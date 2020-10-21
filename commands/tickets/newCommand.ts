import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
const Discord = require("discord.js");
const config = require("../../config.json");
const { default: Collection } = require("@discordjs/collection");

export default class applyCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: "apply",
            group: "applications",
            memberName: "apply",
            description: "Apply for a role on the server",
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            }
        });
    }
    async run(message: CommandoMessage, {}) {
        return message.reply("Created a ticket for you!")
    }
}