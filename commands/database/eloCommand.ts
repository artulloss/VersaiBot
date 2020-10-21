import { CommandoMessage, CommandoClient } from "discord.js-commando";
import databaseCommand from "./databaseCommand";
import { MessageEmbed } from "discord.js";
import Discord = require("discord.js");
import { validateName } from "../../utilities/utilities";
const query = "SELECT duel_players.name, player_elo.kit, player_elo.elo FROM player_elo INNER JOIN duel_players ON player_elo.id = duel_players.id WHERE duel_players.id = (SELECT id FROM duel_players WHERE name = \":name\")";
export default class eloCommand extends databaseCommand {
    constructor(client: CommandoClient) {
        super (client, {
            name: "elo",
            aliases: [],
            group: "database",
            memberName: "elo",
            description: "Checks player elo",
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            },
            args: [
                {
                    key: "player",
                    prompt: "Please enter a player",
                    type: "string"
                }
            ]
        });
    }

    run (message: CommandoMessage, { player } : { player: string }) {
        if(!validateName(player))
            return message.say("Invalid player provided!")
        let embed: MessageEmbed = new Discord.MessageEmbed();
        databaseCommand.database.query(query.replace(":name", player), (error: Error, result: any[]) => {
            if (error)
                return this.handleError(message, { player });
            if(result.length === 0) {
                embed
                    .setTitle("Invalid player!")
                    .setDescription(`${player} does not exist or have any elo!`)
                    .setColor("#cc0000")
                    .setFooter(this.config.server_name, this.config.icon)
                    .setTimestamp(new Date());
                return message.say(embed);
            }
            let description: string = "";
            let last: number = result.length - 1;
            for(let key in result) {
                //description += `${result[key].kit}: ${result[key].elo}${key != last ? "\n" : ""}`;
                description += `${result[key].kit}: ${result[key].elo}\n`;
            }
            embed
                .setTitle(`Elo for ${result[0].name}`)
                .setDescription(description)
                .setColor("#33cc33")
                .setFooter(this.config.server_name, this.config.icon)
                .setTimestamp(new Date());
            this.seconds = databaseCommand.defaultSeconds;
            message.say(embed);
            //databaseCommand.database.destroy(); // Check if closing database works
            //message.say("Database Destroyed");
        }, undefined);
        return new Promise<null>(() => {});
    }
}