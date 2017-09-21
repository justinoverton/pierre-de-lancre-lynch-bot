const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Config = require('../../data/config.js');
const Poll = require('../../data/poll.js');
const Blacklist = require('../../data/blacklist.js');

const timeregex = /(?:(\d\d?)\/(\d\d?)\/(\d\d(?:\d\d)?)\s*)?(\d\d?)\:(\d\d)/;

class OpenVoteConfigCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'openvote',
			aliases: ['openvote', 'open'],
			group: 'werewolf',
			memberName: 'openvote',
			description: 'Opens voting for the current channel',
			details: oneLine`
				If only a time is specified, then it will close today at that time (or tomorrow if that time has already passed).
				Time should be in 24 hour format.
			`,	
			examples: ['openvote 21:00', 'openvote 1/2/2017 21:00'],
			guildOnly: true,
			args: [
				{
					key: 'close',
					label: 'close',
					prompt: `When should the vote end?`,
					validate: val => {
						if(!val) return false;
						return timeregex.test(val);
					},
					parse: val => {
						if(val) {
							
							var [,day,month,year,hour,minute] = val.match(timeregex);
							
							hour = parseInt(hour);
							minute = parseInt(minute);

							if(day){
								day = parseInt(day);
								month = parseInt(month) - 1;
								year = parseInt(year);

								if(year <= 99) {
									year += 2000;
								}
							} else {
								var now = new Date();
								
								if(now.getHours() < hour || now.getHours() == hour && now.getMinutes() < minute) {
									day += 1;
								}

								now.setHours(hour);
								now.setMinutes(minute);

								return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
							}

							return new Date(year, month, day, hour, minute);
						}

						return null;
					}
				},
				{
					key: 'channelid',
					label: 'channelid',
					prompt: 'Channel id',
					type: 'channel',
					default: ''
				}
			]
		});
	}

	hasPermission(msg){
		if(this.client.isOwner(msg.author)) {
			return true;
		}
		
		let guildId = msg.guild.id.toString();
		return Config.findOne({where: {guild: guildId}}).then(function(currentConfig){

			if(currentConfig == null || !currentConfig.moderatorRole) {
				return false;
			}

			return msg.member.roles.has(currentConfig.moderatorRole);
		});
	}

	async run(msg, args) {
		
		let guildId = msg.guild.id.toString();

		let channelId = msg.channel.id.toString();
		if(args.channelid !== '') {
            channelId = args.channelid.id.toString();
		}
		
		return Blacklist.findOne({where: {
			guild: guildId,
			channel: channelId}
		}).then(bl => {
			
			if(bl !== null) {
				msg.reply(`Channel is blacklisted from lynch votes`);
				return;
			}

			return Poll.create({
				guild: guildId,
				channel: channelId,
				close: args.close
			}).then(function(p){
				msg.react('✅');

				let ch = msg.guild.channels.get(channelId);

				let d= args.close;
				return ch.send(`Lynch channel is open and ready for accusations. Voting closes ${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes() < 10 ? "0" : "" }${d.getMinutes()}`)
				.then(function(msg2){
					p.tallyMsg = msg2.id;
					let ps = [p.save()];
					if(msg2.pinnable){
						ps.push(msg2.pin());
					}
					return Promise.all(ps);
				});
			});
		});
	}
};

module.exports = OpenVoteConfigCommand;