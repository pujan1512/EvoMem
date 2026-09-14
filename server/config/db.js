const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'evomem_db';
const DB_PORT = process.env.DB_PORT || 3306;

let sequelize;

// Try initializing MySQL first, fallback to SQLite if MySQL service connection fails
async function initDatabase() {
  const mysqlSequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 10000,
      idle: 10000
    }
  });

  try {
    await mysqlSequelize.authenticate();
    console.log('[Database] Connected successfully to MySQL database server.');
    sequelize = mysqlSequelize;
    return sequelize;
  } catch (err) {
    console.warn(`[Database] MySQL connection failed (${err.message}). Falling back to SQLite file storage (MySQL dialect compatible) for seamless execution.`);
    
    const sqliteSequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'evomem_database.sqlite'),
      logging: false
    });
    
    await sqliteSequelize.authenticate();
    console.log('[Database] Connected to SQLite local store.');
    sequelize = sqliteSequelize;
    return sequelize;
  }
}

// Lazy getter for sequelize instance
const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'evomem_database.sqlite'),
      logging: false
    });
  }
  return sequelize;
};

module.exports = {
  initDatabase,
  getSequelize: () => sequelize || getSequelize()
};
