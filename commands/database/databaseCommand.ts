import { CommandoClient, Command, CommandInfo, CommandoMessage } from "discord.js-commando";
import { configInterface } from "../../configInterface";
import { Connection } from "mysql";
import { Message } from "discord.js";
const Discord = require("discord.js");
const mysql = require("mysql");
const config = require("../../config.json");
export default class databaseCommand extends Command {
    protected config: configInterface;
    protected seconds: number;
    protected static count: number = 0;
    protected static defaultSeconds: number = 1;
    protected static database: Connection;
    constructor(client: CommandoClient, commandInfo: CommandInfo) {
        super(client, commandInfo);
        this.config = config;
        if (databaseCommand.count++ === 0)
            this.connectDatabase();
        this.seconds = databaseCommand.defaultSeconds;
    }
    connectDatabase() {
        databaseCommand.database = mysql.createConnection(config.database);
        databaseCommand.database.connect({
            socketPath: '/var/run/mysqld/mysqld.sock'
        }, function (err: Error) {
            if (err) {
                console.log(`Error when connecting to database: ${err}`);
            }
            else {
                console.log(`Connected to ${config.database.database}@${config.database.host}`);
            }
        });
    }
    getErrorEmbed() {
        return (new Discord.MessageEmbed())
            .setTitle("There was an error!")
            .setDescription(`Retrying in ${this.seconds} seconds.`)
            .setColor("#cc0000")
            .setFooter(this.config.server_name, this.config.icon)
            .setTimestamp(new Date());
    }
    async handleError(message: CommandoMessage, args: string|string[]|object) {
        this.connectDatabase();
        if (this.seconds < 65) {
            let embed = this.getErrorEmbed();
            let sentMessage: Message|Message[] = await message.say(embed);
            setTimeout(() => {
                this.run(message, args, false);
                (sentMessage as Message).delete();
            }, (this.seconds *= 2) * 500);
            return;
        }
        return message.say((new Discord.MessageEmbed())
            .setTitle("Unable to resolve error!")
            .setDescription(`Stopping command execution!`)
            .setColor("#cc0000")
            .setFooter(this.config.server_name, this.config.icon)
            .setTimestamp(new Date()));
    }
}
