// require('ts-node/register');
require("../app/config-env");
const logInsertOnly = (query: string) => {

  if (query.trim().startsWith('Executing (default): INSERT')) {
    console.log(`[Sequelize Log] ${query}`);
  }
};
module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
    // freezeTableName: true
  },
  pool: {
    max: process.env.POSTGRES_POOL_MAX || 100,
    min: process.env.POSTGRES_POOL_MIN || 10,
    acquire: process.env.POSTGRES_POOL_ACQUIRE || 30000,
    idle: process.env.POSTGRES_POOL_IDLE || 10000
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: "UTC",
  host: process.env.POSTGRES_HOST,
  port: process.env.DB_PORT || "443",
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER ,
  password: process.env.POSTGRES_PASSWORD,
  logging: false,

};