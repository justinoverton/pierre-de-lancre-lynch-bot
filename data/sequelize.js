const Sequelize = require('sequelize');
  
module.exports = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  
  // SQLite only
  storage: './wwconfig.sqlite3'
});
