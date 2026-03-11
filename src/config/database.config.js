const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();

const sslEnabled = process.env.DB_SSL !== "false";
const caPath = process.env.DB_CA;
const caFromPath =
  caPath && fs.existsSync(caPath) ? fs.readFileSync(caPath).toString() : undefined;
const caFromEnv = process.env.DB_CA_CONTENT;
const ca = caFromPath || caFromEnv;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    dialectModule: require("pg"),
    logging: false,
    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
            ...(ca ? { ca } : {}),
          },
        }
      : {},
  }
);

module.exports = sequelize;
