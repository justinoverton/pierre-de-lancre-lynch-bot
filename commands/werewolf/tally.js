const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Poll = require('../../data/poll.js');
const Vote = require('../../data/vote.js');
const auth = require('../../auth.json');

module.exports = class LynchCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'tally',
			aliases: ['count'],
			group: 'werewolf',
			memberName: 'tally',
			description: 'Get tally of votes',
            guildOnly: true
		});
	}

	async run(msg, args) {
		
		let guildId = msg.guild.id.toString();
        let channelId = msg.channel.id;
		
		return Poll.findOne({where: {
			guild: guildId,
			channel: channelId}
		}).then((currentPoll) => {
			
			if(!currentPoll) {
				return msg.reply('Voting is not enabled on this channel');
			}

			return Vote.findAll({where: {
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
				var counted = Object.values(rec).reduce((ctr, name) => {
					
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
				
				let ret = ['The tally is:\r\n\r\n'];
				
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
				
				return msg.reply(ret);
			});
		});
	}
};

