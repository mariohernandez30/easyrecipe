export function log(message, { isError } = { isError: false }) {
  const { log, error } = globalThis.console;

  if (isError) {
    return error(message);
  }
  return log(message);
}

export async function $try(fn) {
  try {
    const result = fn();

    if (result instanceof Promise) {
      try {
        const data = await result;
        return [null, data];
      } catch (err) {
        return [err, null];
      }
    }

    return [null, result];
  } catch (error) {
    return [error, null];
  }
}
