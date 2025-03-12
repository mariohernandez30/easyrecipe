import { Database } from 'bun:sqlite';
import fs from 'fs';
import path from 'path';
import { $try, log } from '../../shared/shared.js';

const dbDir = path.dirname('./db/users.sqlite');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database('./db/users.sqlite', {
  create: true,
});

log('Conectado a la base de datos SQLite usando Bun.Database');

function adjustParams(params, callback) {
  if (typeof params === 'function') {
    return { params: [], callback: params };
  }

  if (
    Array.isArray(params) &&
    params.length === 0 &&
    typeof callback !== 'function'
  ) {
    return { params: [], callback };
  }

  return { params, callback };
}

function executeQuery(stmt, params) {
  if (Array.isArray(params)) {
    return stmt.run(...params);
  } else {
    return stmt.run(params);
  }
}

function handleDatabaseError(error, callback, defaultValue = null) {
  log(`Error en base de datos: ${error.message}`, { isError: true });
  if (typeof callback === 'function') {
    callback(error, defaultValue);
  }
  throw error;
}

export default {
  run: async (sql, params = [], callback) => {
    const { params: adjustedParams, callback: adjustedCallback } = adjustParams(
      params,
      callback
    );

    const [error, result] = await $try(async () => {
      const stmt = db.query(sql);
      const queryResult = executeQuery(stmt, adjustedParams);

      return {
        lastID: queryResult.lastInsertRowid || 0,
        changes: queryResult.changes || 0,
      };
    });

    if (typeof adjustedCallback === 'function') {
      if (error) {
        adjustedCallback(error);
      } else {
        adjustedCallback.call(result, null);
      }
    }

    if (error) {
      handleDatabaseError(error, null);
    }

    return { lastInsertRowid: result.lastID, changes: result.changes };
  },

  get: async (sql, params = [], callback) => {
    const { params: adjustedParams, callback: adjustedCallback } = adjustParams(
      params,
      callback
    );

    const [error, row] = await $try(async () => {
      const stmt = db.query(sql);

      if (Array.isArray(adjustedParams)) {
        return stmt.get(...adjustedParams);
      } else {
        return stmt.get(adjustedParams);
      }
    });

    if (typeof adjustedCallback === 'function') {
      if (error) {
        adjustedCallback(error, null);
      } else {
        adjustedCallback(null, row || null);
      }
    }

    if (error) {
      handleDatabaseError(error, null);
    }

    return row || null;
  },

  all: async (sql, params = [], callback) => {
    const { params: adjustedParams, callback: adjustedCallback } = adjustParams(
      params,
      callback
    );

    const [error, rows] = await $try(async () => {
      const stmt = db.query(sql);

      if (Array.isArray(adjustedParams)) {
        return stmt.all(...adjustedParams);
      } else {
        return stmt.all(adjustedParams);
      }
    });

    if (typeof adjustedCallback === 'function') {
      if (error) {
        adjustedCallback(error, []);
      } else {
        adjustedCallback(null, rows || []);
      }
    }

    if (error) {
      handleDatabaseError(error, null, []);
    }

    return rows || [];
  },

  exec: async (sql, callback) => {
    const [error] = await $try(async () => {
      db.run(sql);
    });

    if (typeof callback === 'function') {
      if (error) {
        callback(error);
      } else {
        callback(null);
      }
    }

    if (error) {
      handleDatabaseError(error, null);
    }

    return { changes: 0 };
  },
};
