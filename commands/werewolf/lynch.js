const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Config = require('../../data/config.js');
const Poll = require('../../data/poll.js');
const Vote = require('../../data/vote.js');
const Blacklist = require('../../data/blacklist.js');
const dateFormat = require('dateformat');
const auth = require('../../auth.json');

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

let tallyChannels = {};



module.exports = class LynchCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'lynch',
			aliases: ['airlock', 'kill'],
			group: 'werewolf',
			memberName: 'lynch',
			description: 'Vote to lynch a player',
			details: oneLine`
				Lynch a player.
				Lynch <@${auth.userid}> to remove your vote
            `,
            guildOnly: true,			
			args: [
				{
					key: 'player',
					label: 'player',
					prompt: `Who do you want to lynch? (<@${auth.userid}> to remove your vote)`,
					type: 'user'
				}
			]
		});
	}

	hasPermission(msg) {
		let guildId = msg.guild.id.toString();
		return Config.findOne({where: {guild: guildId}}).then(function(currentConfig){

			if(currentConfig == null || !currentConfig.villageRole) {
				return false;
			}

			return msg.member.roles.has(currentConfig.villageRole);
		});
	}

	async run(msg, args) {
		
		let target = args.player.id;

		let created = new Date(msg.createdTimestamp);
		let guildId = msg.guild.id.toString();
		let channelId = msg.channel.id.toString();

		return Poll.findOne({where: {
			guild: guildId,
			channel: channelId}
		}).then(function(currentPoll) {
			
			if(!currentPoll) {
				return Blacklist.findOne({where: {
					guild: guildId,
					channel: channelId}
				}).then(bl => {
					
					if(bl !== null) {
						return;
					}

					msg.react('❗');
					return msg.reply('Voting is not enabled on this channel');
				});
			}

			if(currentPoll.close.getTime() < created.getTime()) {
				msg.react('❗');
				return msg.reply('Voting is closed');
			}

			return Vote.create({
				guild: guildId,
				channel: channelId,
				voter: msg.author.id,
				target: target,
				date: created,
				msgId: msg.id.toString()
			}).then(function(){
				msg.react('✅');

				let tally = tallyChannels[channelId];
				if(!tally) {
					if(currentPoll.tallyMsg){

						return msg.channel.fetchMessage(currentPoll.tallyMsg).then(function(tallyMsg){
							if(tallyMsg) {
								tallyChannels[channelId] = debounce(function () {

									Vote.findAll({where: {
										guild: guildId,
										channel: channelId,
										date: {$lt: currentPoll.close}
									},
									order: [['date', 'ASC']]}).then((votes) => {
						
										let rec = {};
										for(let o of votes) {
											let id = o.target;
											rec[o.voter] = o.target;
										}
						
										let totals = {};
										let maxCount = 0;
										let counted = Object.values(rec).reduce((ctr, name) => {
											
											if(name == auth.userid) {
												return ctr;
											}
						
											if(name in ctr){
												ctr[name]++;
											} else {
												ctr[name] = 1;
											}
											maxCount = Math.max(maxCount, ctr[name]);
											return ctr;
										}, {});
										
										let ret = ['Lynch channel is open and ready for accusations. Voting closes ' + dateFormat(currentPoll.close, 'm/dd/yy h:MM:ss TT') + '\r\n\r\n',
											'The tally as of ' + dateFormat(new Date(), 'm/dd/yy h:MM:ss TT') + ':\r\n\r\n'];
										
										for(let key of Object.keys(counted)) {
											let count = counted[key];
											let fmt1 = '';
											let fmt2 = '';
											if(count == maxCount) {
												fmt1 = '__**';
												fmt2 = '**__';
											}
											
											let name = msg.guild.members.get(key) || key;
											if(name.user && name.user.tag) {
												name = name.user.tag || name;
											}
											
											ret.push(`${fmt1}${name}\t\t${count}${fmt2}`);
										}
										
										return tallyMsg.edit(ret);
									});

								}, 5000);

								tallyChannels[channelId]();
							}
						});
					}
				} else {
					tally();
				}

			});
		});
	}
};