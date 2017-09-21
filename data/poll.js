
const Sequelize = require('sequelize');
const sequelize = require('./sequelize.js');

var Poll = sequelize.define('poll', {
    guild: { type: Sequelize.STRING, unique: 'composite' },
    channel: { type: Sequelize.STRING, unique: 'composite' },
    close: { type: Sequelize.DATE },
    tallyMsg: { type: Sequelize.STRING }
});

Poll.sync();
module.exports = Poll;
