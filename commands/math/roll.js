const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
var Roll = require('roll');
var roll = new Roll();

module.exports = class RollCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'roll',
			aliases: [],
			group: 'math',
			memberName: 'roll',
			description: 'Rolls dice.',
			details: oneLine`
				Rolls dice. 1d6+8. 4d20. 1d100.
			`,
			examples: ['roll 1d20+6'],

			args: [
				{
					key: 'expression',
					label: 'expression',
					prompt: 'What die would you like to roll?',
					type: 'string' //,
					//infinite: true
				}
			]
		});
	}

	async run(msg, args) {
		const r = roll.roll(args.expression);
		return msg.reply(`${args.expression} = ${r.rolled} = **${r.result}**`);
	}
};