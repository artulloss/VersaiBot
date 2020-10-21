import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import { oneLine } from 'common-tags' ;
import { Message } from "discord.js";
const config = require("../../config.json");
const Discord = require("discord.js");

export default class PingCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: 'Checks the bot\'s ping to the Discord server.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg: CommandoMessage) {
        let embed = new Discord.MessageEmbed();
        embed
            .setTitle("Pinging...")
            .setDescription("Please wait while we ping the server")
        let pingMsg = await msg.say(embed);
        pingMsg = pingMsg as Message;
        return pingMsg.edit(
            embed
                .setTitle("Pong!")
                .setDescription(oneLine`
                    ${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
                    The message round-trip took ${
                        (pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
                    }ms.
                    ${this.client.ws.ping ? `The heartbeat ping is ${Math.round(this.client.ws.ping)}ms.` : ''}
                    `)
                .setColor("#33cc33")
                .setFooter(config.server_name, config.icon)
                .setTimestamp(new Date())
        );
	}
};