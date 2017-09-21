const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Config = require('../../data/config.js');
const Blacklist = require('../../data/blacklist.js');

module.exports = class LynchBlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'lynchblacklist',
			group: 'werewolf',
			memberName: 'lynchblacklist',
			description: 'Blacklist a channel from lynch votes',
			details: oneLine`
				Prevents a channel from accepting or listening to votes. Specify channelid or use blank for the current channel.
            `,
            guildOnly: true,			
			args: [
				{
					key: 'channelid',
					label: 'channelid',
					prompt: `Channel id`,
                    type: 'channel',
                    default: ''
				}
			]
		});
	}

	hasPermission(msg) {
        
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
		}).then(function(current) {
			
			if(current) {
				return msg.reply('already blacklisted');
            }
            
			return Blacklist.create({
				guild: guildId,
				channel: channelId
			}).then(function(){
				msg.react('✅');
			});
		});
	}
};