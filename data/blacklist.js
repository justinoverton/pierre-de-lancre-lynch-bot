
const Sequelize = require('sequelize');
const sequelize = require('./sequelize.js');

var Blacklist = sequelize.define('blacklist', {
    guild: { type: Sequelize.STRING, unique: 'composite' },
    channel: { type: Sequelize.STRING, unique: 'composite' }
});

Blacklist.sync();
module.exports = Blacklist;
