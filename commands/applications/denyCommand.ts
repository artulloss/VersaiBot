import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import Discord = require("discord.js");
const config = require("../../config.json");

export default class denyCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: "deny",
            aliases: [],
            group: "applications",
            memberName: "deny",
            description: "Deny an application",
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            },
            userPermissions: ["ADMINISTRATOR"]
        });
    }
    async run (message: CommandoMessage, { type }: { type: string}) {
        if(message.guild === null) {
            return message.say("This command can only be run in a server!");
        }
        if(!(message.channel instanceof Discord.TextChannel && message.channel.topic !== null))
            return message.say("This command cannot be executed here!");
        let topicArray: string[] = message.channel.topic.split(" ");
        if(topicArray.length !== 5)
            return message.say("This command cannot be executed here!");
        if(topicArray[1] === "Application") {
            try {
                let user: Discord.User = await this.client.users.fetch(topicArray[4]);
                let dm: Discord.DMChannel = await user.createDM();
                message.channel.delete();
                return await dm.send(`Your application for ${topicArray[0].toLowerCase()} has been denied.`)
            } catch (err) {
                console.log(`There was an error!\n${err}`);
            }
        } else
            return message.say("This command cannot be executed here!");
        return new Promise<null>(() => {});
    }
}