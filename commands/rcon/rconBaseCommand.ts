
import { CommandoClient, Command, ArgumentInfo, CommandoMessage, CommandoGuild } from 'discord.js-commando';
import Discord = require("discord.js");
import { Rcon, RconOptions } from 'rcon-client'; // but u r using require, yes, this is why deno is superior
const config = require('../../config.json');
import { configInterface } from '../../configInterface';
const ALLOWED_SERVERS = [ // If the user isn't in ALLOWED_USERS it won't let them use the commands in any server except these
    "708291410612322345", // Versai
    "686340569794215945", // Versai Staff
    "732054561010876517" // Versai Bot Development
];
const ALLOWED_USERS = [ // These users can use all commands in all servers so long as they have the permission of the command
    "205757579413028864", // Adam goodest
    "280384190908989451", // Tru gooder
    "320879177832202243", // Sue bad
    "281530702590246914" // John good 
];
export default abstract class rconBaseCommand extends Command {
    protected config: configInterface;
    protected seconds: number;
    public static rcon?: any;
    protected static count: number = 0;
    protected static defaultSeconds: number = 1;
    constructor(client: CommandoClient, name: string, description: string, args: ArgumentInfo[], aliases: string[] = [], permissions: Discord.BitFieldResolvable<Discord.PermissionString>[] = ["ADMINISTRATOR"]) {
        super (client, {
            name: name,
            aliases: aliases,
            group: "rcon",
            memberName: name,
            description: description,
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            },
            args: args,
            userPermissions: permissions
        });
        this.config = config as unknown as configInterface;
        if(rconBaseCommand.count++ === 0) {
            this.connectRCON();
        };
        this.seconds = rconBaseCommand.defaultSeconds;
    }
    checkPermissions(message: CommandoMessage) {
        let author: any|Discord.User = message.author;
        let guild: any|CommandoGuild = message.guild;
        if(!author)
            author = { id: '' }
        if(!guild)
            guild = { id: '' }
        let authorID: string = author.id;
        let guildID: string = guild.id;
        return this.checkAuthorPermissions(authorID) && this.checkServerPermissions(guildID);
    }
    checkServerPermissions(id: string) {
        return ALLOWED_SERVERS.includes(id);
    }
    checkAuthorPermissions(id: string) {
        return ALLOWED_USERS.includes(id);
    }
    async connectRCON() {
        rconBaseCommand.rcon = await Rcon.connect(this.config.rcon as unknown as RconOptions);
        console.log(`RCON connected to ${config.rcon.host}:${config.rcon.port}`);
    }
    async sendRCON(command: string) {
        return await rconBaseCommand.rcon.send(command.replace('“', "\"").replace("”", "\""));
    }
    getErrorEmbed() {
        return (new Discord.MessageEmbed())
            .setTitle("There was an error!")
            //.setDescription(seconds === null ? `Retrying in ${this.seconds}` : `Failed to retry!`)
            .setDescription(`Retrying in ${this.seconds} seconds.`)
            .setColor("#cc0000")
            .setFooter(this.config.server_name, this.config.icon)
            .setTimestamp(new Date());
    }
    async handleError(err: Error, message: CommandoMessage, args: object|string|string[]) {
        // console.log(`There was an error:\n${err}`);
        this.connectRCON();
        if(this.seconds < 65) {
            let embed = this.getErrorEmbed();
            let sentMessage: Discord.Message|Discord.Message[] = await message.say(embed);
            setTimeout(() => {
                this.run(message, args, false);
                (sentMessage as Discord.Message).delete(); 
            }, (this.seconds *= 2) * 500);
            return;
        }
        message.say((new Discord.MessageEmbed())
            .setTitle("Unable to resolve error!")
            .setDescription(`Stopping command execution!`)
            .setColor("#cc0000")
            .setFooter(this.config.server_name, this.config.icon)
            .setTimestamp(new Date())
        );
    }
    handleResult(message: CommandoMessage, command: string, result: string): void {
        if(result.length > 2048) {
            var description = this.handleDescription(result);
        } else {
            var description: string[] = [result];
        }
        for(let key in description) {
            description[key] = description[key] !== "" ? `\`\`\`${description[key]}\`\`\`` : ""
            message.say(new Discord.MessageEmbed()
                .setTitle(`Executed command /${command}`)
                .setDescription(description[key])
                .setColor("#33cc33")
                .setFooter(this.config.server_name, this.config.icon)
                .setTimestamp(new Date()));
        }
        this.seconds = rconBaseCommand.defaultSeconds;
    }
    /**
     * https://stackoverflow.com/questions/18087416/split-string-in-half-by-word
     * @param {string} description 
     */
    handleDescription(description: string): string[] {
        let middle = Math.floor(description.length / 2);
        let before = description.lastIndexOf('\n', middle);
        let after = description.indexOf('\n', middle + 1);

        if (middle - before < after - middle) {
            middle = before;
        } else {
            middle = after;
        }
        return [
            description.substr(0, middle),
            description.substr(middle + 1)
        ];
    }
}