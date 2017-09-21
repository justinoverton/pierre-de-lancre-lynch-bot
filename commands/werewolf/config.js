const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Config = require('../../data/config.js');

class ConfigCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'config',
			aliases: ['config'],
			group: 'werewolf',
			memberName: 'config',
			description: 'Configure a werewolf game',
			details: oneLine`Specify the roles used for villagers and moderators. If no args are given the current config is displayed.`,	
			format: 'config [village|moderator] [role]',
			args: [
				{
					key: 'config',
					label: 'config',
					prompt: `Configure role for 'village' or 'moderator'?`,
					type: 'string',
					default: '',
					validate: function(val, msg, arg) {
						return val === 'village' || val === 'moderator' || val === '';
					}
				},
				{
					key: 'role',
					label: 'role',
					prompt: `What is the role?`,
					type: 'role',
					default: ''
				}
			]
		});
	}

	hasPermission(msg) {
		if(this.client.isOwner(msg.author)) {
			return true;
		}
		
		return msg.member.hasPermission("MANAGE_CHANNELS");
	}

	async run(msg, args) {
		
		let guildId = msg.guild.id.toString();
		return Config.findOne({where: {guild: guildId}}).then(function(currentConfig){

			if(!args || !args.role) {
				msg.react('✅');

				if(!currentConfig) {
					return msg.say('Nothing is configured yet.');
				}

				let vr = msg.guild.roles.get(currentConfig.villageRole) || currentConfig.villageRole;
				if(vr) {
					vr = vr.name || vr;
				}
				
				let mr = msg.guild.roles.get(currentConfig.moderatorRole) || currentConfig.moderatorRole;
				if(mr) {
					mr = mr.name || mr;
				}

				let ret = [ 'Current Werewolf Config', 
					'Village: @' + vr,
					'Moderator: @' + mr];
				
				return msg.say(ret.join('\r\n'));
			}
			
			if(!currentConfig) {
				currentConfig = Config.build({ guild: guildId });
			}

			if(args.config === 'village') {
				currentConfig.villageRole = args.role.id.toString();
			} else if(args.config === 'moderator') {
				currentConfig.moderatorRole = args.role.id.toString();
			} else {
				return;
			}

			return currentConfig.save().then(o => {
					
					msg.react('✅');

				})
				.catch(error => {
					console.error(error);
					msg.react('❗');
					let e = {
						msg: 'Error Setting Config',
						error: error
					};
					return msg.code('json', JSON.stringify(e));
				});
		});
	}
};

module.exports = ConfigCommand;