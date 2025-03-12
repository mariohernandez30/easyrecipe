import { describe, expect, test } from 'bun:test';
import { $try } from '../shared/shared.js';

describe('Utilidad $try', () => {
  describe('Funciones sincrónicas', () => {
    test('debería manejar correctamente retornos de funciones sincrónicas', async () => {
      const [error, result] = await $try(() => {
        return 42;
      });

      expect(error).toBeNull();
      expect(result).toBe(42);
    });

    test('debería capturar errores en funciones sincrónicas', async () => {
      const errorMsg = 'Error de prueba sincrónico';
      const [error, result] = await $try(() => {
        throw new Error(errorMsg);
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMsg);
      expect(result).toBeNull();
    });

    test('debería manejar operaciones con objetos', async () => {
      const obj = { nombre: 'test', valor: 123 };
      const [error, result] = await $try(() => {
        return { ...obj, extra: true };
      });

      expect(error).toBeNull();
      expect(result).toMatchObject({ nombre: 'test', valor: 123, extra: true });
    });

    test('debería manejar operaciones con arrays', async () => {
      const arr = [1, 2, 3];
      const [error, result] = await $try(() => {
        return [...arr, 4, 5];
      });

      expect(error).toBeNull();
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });
  describe('Funciones asincrónicas', () => {
    test('debería manejar promesas resueltas', async () => {
      const [error, result] = await $try(async () => {
        return Promise.resolve(100);
      });

      expect(error).toBeNull();
      expect(result).toBe(100);
    });

    test('debería capturar promesas rechazadas', async () => {
      const errorMsg = 'Error de promesa rechazada';
      const [error, result] = await $try(async () => {
        return Promise.reject(new Error(errorMsg));
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMsg);
      expect(result).toBeNull();
    });

    test('debería capturar errores lanzados en funciones asincrónicas', async () => {
      const errorMsg = 'Error en función async';
      const [error, result] = await $try(async () => {
        throw new Error(errorMsg);
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMsg);
      expect(result).toBeNull();
    });

    test('debería manejar funciones asincrónicas que devuelven objetos', async () => {
      const [error, result] = await $try(async () => {
        await new Promise((resolve) => globalThis.setTimeout(resolve, 10));
        return { data: 'información', success: true };
      });

      expect(error).toBeNull();
      expect(result).toMatchObject({ data: 'información', success: true });
    });
  });
  describe('Promesas directas', () => {
    test('debería manejar promesas directas', async () => {
      const [error, result] = await $try(() => Promise.resolve('Éxito'));

      expect(error).toBeNull();
      expect(result).toBe('Éxito');
    });

    test('debería capturar errores en promesas directas', async () => {
      const errorMsg = 'Error en promesa directa';
      const [error, result] = await $try(() =>
        Promise.reject(new Error(errorMsg))
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMsg);
      expect(result).toBeNull();
    });
  });
  describe('Casos especiales', () => {
    test('debería manejar valores null', async () => {
      const [error, result] = await $try(() => null);

      expect(error).toBeNull();
      expect(result).toBeNull();
    });

    test('debería manejar valores undefined', async () => {
      const [error, result] = await $try(() => undefined);

      expect(error).toBeNull();
      expect(result).toBeUndefined();
    });

    test('debería manejar valores false', async () => {
      const [error, result] = await $try(() => false);

      expect(error).toBeNull();
      expect(result).toBe(false);
    });

    test('debería manejar valores 0', async () => {
      const [error, result] = await $try(() => 0);

      expect(error).toBeNull();
      expect(result).toBe(0);
    });

    test('debería manejar cadenas vacías', async () => {
      const [error, result] = await $try(() => '');

      expect(error).toBeNull();
      expect(result).toBe('');
    });
  });

  describe('Simulación de casos reales', () => {
    test('debería simular una operación de base de datos', async () => {
      const consultaDB = async (id) => {
        if (id <= 0) {
          throw new Error('ID no válido');
        }
        return { id, nombre: `Usuario ${id}` };
      };

      const [error1, usuario1] = await $try(() => consultaDB(1));
      expect(error1).toBeNull();
      expect(usuario1).toMatchObject({ id: 1, nombre: 'Usuario 1' });

      const [error2, usuario2] = await $try(() => consultaDB(-1));
      expect(error2).toBeInstanceOf(Error);
      expect(error2.message).toBe('ID no válido');
      expect(usuario2).toBeNull();
    });

    test('debería simular una operación de red (API)', async () => {
      const fetchData = async (success) => {
        if (!success) {
          throw new Error('Error de red');
        }
        return { status: 200, data: { message: 'Datos recibidos' } };
      };

      const [error1, response1] = await $try(() => fetchData(true));
      expect(error1).toBeNull();
      expect(response1.status).toBe(200);
      expect(response1.data.message).toBe('Datos recibidos');

      const [error2, response2] = await $try(() => fetchData(false));
      expect(error2).toBeInstanceOf(Error);
      expect(error2.message).toBe('Error de red');
      expect(response2).toBeNull();
    });
  });
});
