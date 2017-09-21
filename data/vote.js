
const Sequelize = require('sequelize');
const sequelize = require('./sequelize.js');

var Vote = sequelize.define('vote', {
    guild: { type: Sequelize.STRING },
    channel: { type: Sequelize.STRING },
    voter: { type: Sequelize.STRING },
    target: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
    msgId: { type: Sequelize.STRING }
});

Vote.sync();
module.exports = Vote;
