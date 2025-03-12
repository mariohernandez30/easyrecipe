export async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = globalThis.localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return globalThis.fetch(endpoint, mergedOptions).then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    return data;
  });
}
