export function log(message, { isError } = { isError: false }) {
  const { log, error } = globalThis.console;

  if (isError) {
    return error(message);
  }
  return log(message);
}

/**
 * Función $try para manejo de errores que retorna una tupla [error, resultado]
 * @param {Function} fn - La función a ejecutar
 * @returns {Promise<[Error, any]>} [error, resultado]
 */
export async function $try(fn) {
  try {
    return [null, await fn()];
  } catch (error) {
    return [error, null];
  }
}

/**
 * Función para validar un objeto según reglas específicas
 * @param {Object} data - Datos a validar
 * @param {Object} rules - Reglas de validación
 * @returns {Object} { isValid, errors }
 */
export function validate(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    if (
      fieldRules.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors[field] = `El campo ${field} es requerido`;
      continue;
    }

    if (value !== undefined && value !== null) {
      if (fieldRules.minLength && String(value).length < fieldRules.minLength) {
        errors[field] =
          `El campo ${field} debe tener al menos ${fieldRules.minLength} caracteres`;
      }

      if (fieldRules.maxLength && String(value).length > fieldRules.maxLength) {
        errors[field] =
          `El campo ${field} debe tener como máximo ${fieldRules.maxLength} caracteres`;
      }

      if (fieldRules.pattern && !fieldRules.pattern.test(String(value))) {
        errors[field] = `El formato del campo ${field} no es válido`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Función para limpiar texto de posibles inyecciones
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeText(text) {
  if (!text) return '';
  return String(text).replace(/[<>"'&]/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      case '&':
        return '&amp;';
      default:
        return match;
    }
  });
}

/**
 * Función para formatear fechas
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} format - Formato deseado (short, medium, long)
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'medium') {
  const dateObj = date instanceof Date ? date : new Date(date);

  const options = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return dateObj.toLocaleDateString('es-ES', options[format] || options.medium);
}
