import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";
import Discord = require("discord.js");
const config = require("../../config.json");

export default class applyCommand extends Command {
    private applications: { [key: string]: string } = {};
    constructor (client: CommandoClient) {
        super(client, {
            name: "apply",
            aliases: [],
            group: "applications",
            memberName: "apply",
            description: "Apply for a role on the server",
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            },
            args: [
                {
                    key: "type",
                    prompt: "Please enter what you'd like to apply for!",
                    type: "string"
                }
            ]
        });
    }
    async run (message: CommandoMessage, { type }: { type: string}) {
        if(message.guild === null) {
            return message.say("This command can only be run in a server!");
        }
        type = type.toLowerCase();
        let types: string[] = Object.keys(config.application.types);
        let uctypes: string[] = [];
        types.forEach((type, index) => {
            uctypes[index] = type.charAt(0).toUpperCase() + type.slice(1);
        });
        if(!types.includes(type)) {
            return message.say(`Invalid application type. Please choose one of: ${uctypes.join(" ")}.`)
        }
        if(this.applications[message.author.id] !== undefined) {
            return message.say(`Unfortunately you're already applying for a position as ${this.applications[message.author.id]}!`);
        }
        message.direct(config.application.message_start.replace("{type}", type))
            .then((directMessage: Discord.Message|Discord.Message[]) => {
                directMessage = directMessage as Discord.Message;
                message.reply("Sent you a direct message!");
                this.applications[message.author.id] = type;
                if(directMessage.channel.type === "dm") {
                    let dmchannel: Discord.DMChannel = directMessage.channel;
                    let filter: Discord.CollectorFilter = (msg: Discord.Message) => msg.author.id === message.author.id;
                    let questions: string[] = config.application.types[type];
                    let messageCollector: Discord.MessageCollector = dmchannel.createMessageCollector(filter, { max: questions.length });
                    let i: number = 0;
                    dmchannel.send(questions[i]);
                    messageCollector.on('collect', msg => {
                        let lowerCaseContent = msg.content.toLowerCase();
                        if(lowerCaseContent === "cancel" || lowerCaseContent === `${config.prefix}cancel`) {
                            messageCollector.stop("User cancelled application!");
                            dmchannel.send("You have cancelled your application!");
                            return;
                        }
                        if(lowerCaseContent === "skip" || lowerCaseContent === `${config.prefix}skip`) {
                            msg.content = "SKIPPED";
                            dmchannel.send("You have skipped the question!");
                        }
                        typeof(questions[++i]) !== 'undefined' ? dmchannel.send(questions[i]) : dmchannel.send(config.application.message_end.replace("{type}", type).replace("{server_name}", config.server_name));
                    });
                    messageCollector.on('end', collected => {
                        for(let [key, value] of collected) {
                            let lowerCaseContent = value.content.toLowerCase();
                            if(lowerCaseContent === "cancel" || lowerCaseContent === `${config.prefix}cancel`) {
                                delete this.applications[message.author.id];
                                return;
                            }
                        }
                        // console.log(`Collected ${collected.size} responses`);
                        message.guild.channels.create(`${type}-${message.author.username}`, {
                            reason: `${message.author.tag} applied for ${type}.`,
                            topic: `${type.charAt(0).toUpperCase() + type.slice(1)} Application for ${message.author.tag.replace(" ", "_")} ${message.author.id}`, // Staff Application for Adam#6666 12039458739204857
                            parent: message.guild.channels.cache.get(config.application["applications_category_id"]),
                        })
                        .then((channel: Discord.GuildChannel|any) => {
                            channel.lockPermissions();
                            let newPerms = channel.permissionOverwrites;
                            newPerms.set(message.author.id, {
                                id: message.author.id,
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES']
                            });
                            channel.overwritePermissions(newPerms);
                            let collectedIterator: Iterator<Discord.Message> = collected.values();
                            questions.forEach((question: string) => {
                                let embed: Discord.MessageEmbed = new Discord.MessageEmbed();
                                embed
                                    .setTitle(question.substring(0, 255))
                                    .setDescription(`\`\`\`${collectedIterator.next().value}\`\`\``)
                                //    .setColor("#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)}))
                                    .setColor("02e8dc")
                                    .setFooter(config.server_name, config.icon)
                                    .setTimestamp(new Date())
                                ;
                                channel.send(embed);
                            });
                            channel.send(`This is your application channel <@${message.author.id}>.\nA staff member will look over your application shortly.`);
                            delete this.applications[message.author.id];
                        })
                        .catch((err: Error) => console.log(err));
                    });
                }
            })
            .catch((err: Error) => {
                console.log(`Error:\n${err}`);
                return message.reply("Failed to DM you! You probably have direct messages disabled!");
            });
            return new Promise<null>(() => {});
        }
}