import { Database } from 'bun:sqlite';
import fs from 'fs';
import path from 'path';
import log from '../utils/log.js';

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

// Exportar objeto de base de datos con interfaz compatible
export default {
  run: (sql, params = [], callback) => {
    try {
      // Si params es array vacío y callback es función, ajustamos los parámetros
      if (
        Array.isArray(params) &&
        params.length === 0 &&
        typeof callback !== 'function'
      ) {
        callback = params;
        params = [];
      }

      // Ejecutar la consulta
      const stmt = db.query(sql);
      let result;

      if (Array.isArray(params)) {
        // Para parámetros posicionales
        result = stmt.run(...params);
      } else {
        // Para parámetros nombrados
        result = stmt.run(params);
      }

      // Crear un objeto de contexto similar al de sqlite3
      const context = {
        lastID: result.lastInsertRowid || 0,
        changes: result.changes || 0,
      };

      // Llamamos al callback con el contexto adecuado si existe
      if (typeof callback === 'function') {
        callback.call(context, null);
      }

      return { lastInsertRowid: context.lastID, changes: context.changes };
    } catch (error) {
      log(`Error al ejecutar consulta: ${error.message}`, { isError: true });
      if (typeof callback === 'function') {
        callback(error);
      }
      throw error;
    }
  },

  get: (sql, params = [], callback) => {
    try {
      // Si params es función, ajustamos los parámetros
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }

      // Preparar y ejecutar la consulta
      const stmt = db.query(sql);
      let row;

      if (Array.isArray(params)) {
        // Para parámetros posicionales
        row = stmt.get(...params);
      } else {
        // Para parámetros nombrados
        row = stmt.get(params);
      }

      // Llamar al callback con el resultado si existe
      if (typeof callback === 'function') {
        callback(null, row || null);
      }

      return row || null;
    } catch (error) {
      log(`Error al ejecutar consulta get: ${error.message}`, {
        isError: true,
      });
      if (typeof callback === 'function') {
        callback(error, null);
      }
      throw error;
    }
  },

  all: (sql, params = [], callback) => {
    try {
      // Si params es función, ajustamos los parámetros
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }

      // Preparar y ejecutar la consulta
      const stmt = db.query(sql);
      let rows;

      if (Array.isArray(params)) {
        // Para parámetros posicionales
        rows = stmt.all(...params);
      } else {
        // Para parámetros nombrados
        rows = stmt.all(params);
      }

      // Llamar al callback con los resultados si existe
      if (typeof callback === 'function') {
        callback(null, rows || []);
      }

      return rows || [];
    } catch (error) {
      log(`Error al ejecutar consulta all: ${error.message}`, {
        isError: true,
      });
      if (typeof callback === 'function') {
        callback(error, []);
      }
      throw error;
    }
  },

  // Método para crear tablas y otros DDL
  exec: (sql, callback) => {
    try {
      db.run(sql);

      if (typeof callback === 'function') {
        callback(null);
      }

      return { changes: 0 };
    } catch (error) {
      log(`Error al ejecutar SQL: ${error.message}`, { isError: true });
      if (typeof callback === 'function') {
        callback(error);
      }
      throw error;
    }
  },
};
