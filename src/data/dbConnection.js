import { Database } from 'bun:sqlite';
import fs from 'fs';
import path from 'path';
import { $try, log } from '../utils.js';

// Asegurarnos de que existe el directorio de la base de datos
const dbDir = path.dirname('./db/users.sqlite');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Usar la API nativa de Bun para SQLite
const db = new Database('./db/users.sqlite', {
  create: true, // Crear la base de datos si no existe
});

log('Conectado a la base de datos SQLite usando Bun.Database');

// Funciones auxiliares
function adjustParams(params, callback) {
  // Si params es función o array vacío y callback es función, ajustar parámetros
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
    // Para parámetros posicionales
    return stmt.run(...params);
  } else {
    // Para parámetros nombrados
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

// Exportar objeto de base de datos con interfaz compatible
export default {
  run: async (sql, params = [], callback) => {
    const { params: adjustedParams, callback: adjustedCallback } = adjustParams(
      params,
      callback
    );

    const [error, result] = await $try(async () => {
      const stmt = db.query(sql);
      const queryResult = executeQuery(stmt, adjustedParams);

      // Crear un objeto de contexto similar al de sqlite3
      return {
        lastID: queryResult.lastInsertRowid || 0,
        changes: queryResult.changes || 0,
      };
    });

    // Llamamos al callback con el contexto adecuado si existe
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

    // Llamar al callback con el resultado si existe
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

    // Llamar al callback con los resultados si existe
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

  // Método para crear tablas y otros DDL
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
