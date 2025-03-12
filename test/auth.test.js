import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from 'bun:test';

import { createUser } from '../src/data/userCreate.js';
import { deleteUser } from '../src/data/userDelete.js';
import { verifyUser } from '../src/data/userVerify.js';

import bcrypt from 'bcrypt';
import db from '../src/data/dbConnection.js';

const originalBcryptCompare = bcrypt.compare;
const originalDbGet = db.get;
const originalDbRun = db.run;

const testUser = {
  id: 1,
  username: 'usuariotest',
  email: 'usuario@test.com',
  password: 'hashed-password-mock',
};

let bcryptShouldMatch = true;
bcrypt.compare = async () => bcryptShouldMatch;

let mockConfig = {
  shouldThrowDeleteError: false,
  deleteChanges: 1,
};

mock.module('../src/utils.js', () => ({
  log: () => {},
  $try: async (fn) => {
    try {
      const result = await fn();
      return [null, result];
    } catch (error) {
      return [error, null];
    }
  },
}));

mock.module('bcrypt', () => ({
  genSalt: () => Promise.resolve('mock-salt'),
  hash: () => Promise.resolve('hashed-password-mock'),
  compare: () => Promise.resolve(mockConfig.bcryptShouldMatch),
}));

const runMock = (query, params, callback) => {
  if (mockConfig.shouldThrowDeleteError) {
    callback(new Error('Error simulado'));
  } else {
    callback.call({ lastID: 123, changes: mockConfig.deleteChanges }, null);
  }
};

mock.module('../src/data/dbConnection.js', () => ({
  default: {
    get: (query, params, callback) => {
      if (params[0] === 'usuario@test.com') {
        callback(null, { ...testUser });
      } else if (
        params[0] === 'existente@test.com' ||
        params[0] === 'existenteuser'
      ) {
        callback(null, {
          id: 2,
          username: 'existenteuser',
          email: 'existente@test.com',
        });
      } else {
        callback(null, null);
      }
    },
    run: runMock,
  },
}));

describe('Test de autenticación', () => {
  beforeEach(() => {
    bcryptShouldMatch = true;
  });

  afterEach(() => {
    bcryptShouldMatch = true;
  });

  describe('verifyUser', () => {
    test('debería verificar un usuario correctamente con credenciales válidas', async () => {
      db.get = (query, params, callback) => {
        callback(null, testUser);
      };

      bcryptShouldMatch = true;

      const email = 'usuario@test.com';
      const password = 'password123';

      const user = await verifyUser(email, password);

      expect(user).not.toBeNull();
      expect(user.email).toBe(email);
    });

    test('debería retornar null cuando el usuario no existe', async () => {
      db.get = (query, params, callback) => {
        callback(null, null);
      };

      const email = 'noexiste@test.com';
      const password = 'password123';

      const user = await verifyUser(email, password);

      expect(user).toBeNull();
    });

    test('debería retornar null cuando la contraseña es incorrecta', async () => {
      db.get = (query, params, callback) => {
        callback(null, testUser);
      };

      bcryptShouldMatch = false;

      const email = 'usuario@test.com';
      const password = 'passwordincorrecta';

      const user = await verifyUser(email, password);

      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    test('debería crear un usuario correctamente', async () => {
      db.get = (query, params, callback) => {
        callback(null, null);
      };

      db.run = (query, params, callback) => {
        callback.call({ lastID: 123 }, null);
      };

      const username = 'nuevouser';
      const email = 'nuevo@test.com';
      const password = 'password123';

      const userId = await createUser(username, email, password);

      expect(userId).toBe(123);
    });

    test('debería lanzar error si el nombre de usuario ya existe', async () => {
      db.get = (query, params, callback) => {
        callback(null, { username: 'existenteuser', email: 'otro@email.com' });
      };

      const username = 'existenteuser';
      const email = 'nuevo@test.com';
      const password = 'password123';

      await expect(createUser(username, email, password)).rejects.toThrow(
        'El nombre de usuario ya está en uso'
      );
    });

    test('debería lanzar error si el email ya existe', async () => {
      db.get = (query, params, callback) => {
        callback(null, { username: 'otrouser', email: 'existente@test.com' });
      };

      const username = 'nuevouser';
      const email = 'existente@test.com';
      const password = 'password123';

      await expect(createUser(username, email, password)).rejects.toThrow(
        'El correo electrónico ya está registrado'
      );
    });
  });

  describe('deleteUser', () => {
    test('debería eliminar un usuario correctamente', async () => {
      db.run = (query, params, callback) => {
        callback.call({ changes: 1 }, null);
      };

      const userId = 1;
      const result = await deleteUser(userId);

      expect(result).toBe(true);
    });

    test('debería lanzar error si el usuario no existe', async () => {
      db.run = (query, params, callback) => {
        callback.call({ changes: 0 }, null);
      };

      const userId = 999;
      await expect(deleteUser(userId)).rejects.toThrow('Usuario no encontrado');
    });

    test('debería lanzar error si hay un problema al eliminar el usuario', async () => {
      db.run = (query, params, callback) => {
        callback(new Error('Error simulado'));
      };

      const userId = 'error';
      await expect(deleteUser(userId)).rejects.toThrow();
    });
  });

  afterAll(() => {
    bcrypt.compare = originalBcryptCompare;
    db.get = originalDbGet;
    db.run = originalDbRun;
  });
});
