// require('ts-node/register');
require("../app/config-env");
module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin",
    // freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // Opções de retry para tentativas de reconexão
  retry: {
    max: 3, // número máximo de tentativas
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: "America/Sao_Paulo",
  dialectOptions: {
    useUTC: false, // Desativa UTC
    timezone: "America/Sao_Paulo",
  },
  host: process.env.POSTGRES_HOST,
  port: process.env.DB_PORT || "443",
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logging: false,
};
