export const config = {
  port: Bun.env.PORT || 3000,

  dbPath: Bun.env.DB_PATH || 'db/easyrecipe.db',

  jwt: {
    secret: Bun.env.JWT_SECRET || 'easyrecipe_secret_key',
    expiresIn: '168h',
  },
};
