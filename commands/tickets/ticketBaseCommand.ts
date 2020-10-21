import { Command, CommandoClient, CommandInfo } from "discord.js-commando";
const Discord = require("discord.js");
const config = require("../../config.json");
const { default: Collection } = require("@discordjs/collection");

export default class ticketBaseCommand extends Command {
    constructor (client: CommandoClient, commandInfo: CommandInfo) {
        super(client, commandInfo);
    }
    getChannelByName(name: string) {
        //bot.channels.find("name","welcome").send("Welcome!")
    }
}