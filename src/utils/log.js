export default function log(message, { isError } = { isError: false }) {
  const { log, error } = globalThis.console;

  if (isError) {
    return error(message);
  }
  return log(message);
}
