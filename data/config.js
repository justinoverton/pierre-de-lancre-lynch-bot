
const Sequelize = require('sequelize');
const sequelize = require('./sequelize.js');

var Config = sequelize.define('config', {
    guild: { type: Sequelize.STRING, unique: true },
    villageRole: { type: Sequelize.STRING, allowNull: true },
    moderatorRole: { type: Sequelize.STRING, allowNull: true }


});

Config.sync();
module.exports = Config;