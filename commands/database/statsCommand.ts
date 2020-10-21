import databaseCommand from "./databaseCommand";
import Discord = require("discord.js");
import { CommandoMessage, ArgumentCollectorResult, CommandoClient } from "discord.js-commando";
import { MessageEmbed } from "discord.js";
import { validateName } from "../../utilities/utilities";
const query = "SELECT player_scores.name, kills.value AS kills, deaths.value AS deaths, COALESCE(kills.value / NULLIF(deaths.value, 0), kills.value) AS kdr, streaks.value as streak, monthly_kills.value AS monthly_kills, monthly_deaths.value AS monthly_deaths, COALESCE(monthly_kills.value / NULLIF(monthly_deaths.value, 0), monthly_kills.value) AS monthly_kdr, daily_kills.value AS daily_kills, daily_deaths.value AS daily_deaths, COALESCE(daily_kills.value / NULLIF(daily_deaths.value, 0), daily_kills.value) AS daily_kdr FROM player_scores LEFT JOIN kills ON player_scores.id = kills.id LEFT JOIN deaths ON player_scores.id = deaths.id LEFT JOIN streaks ON player_scores.id = streaks.id LEFT JOIN monthly_kills ON player_scores.id = monthly_kills.id LEFT JOIN monthly_deaths ON player_scores.id = monthly_deaths.id LEFT JOIN daily_kills ON player_scores.id = daily_kills.id LEFT JOIN daily_deaths ON player_scores.id = daily_deaths.value WHERE player_scores.id = (SELECT id FROM player_scores WHERE name = \":name\")";
export default class statsCommand extends databaseCommand {
    constructor(client: CommandoClient) {
        super (client, {
            name: "stats",
            aliases: [],
            group: "database",
            memberName: "stats",
            description: "Checks player stats",
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
    run (message: CommandoMessage, { player }: { player: string }) {
        if(!validateName(player))
            return message.say("Invalid player provided!")
        let embed: MessageEmbed = new Discord.MessageEmbed();
        databaseCommand.database.query(query.replace(":name", player), (error: Error, result: any) => {
            if (error)
                return this.handleError(message, { player });
            let data = result[0];
            if(data === undefined) {
                embed
                    .setTitle("Invalid player!")
                    .setDescription(`${player} does not exist or have any stats!`)
                    .setColor("#cc0000")
                    .setFooter(this.config.server_name, this.config.icon).setTimestamp(new Date());;
                message.say(embed);
                return;
            }
            let description = `Kills: ${data.kills}\n\
            Deaths: ${data.deaths === null ? 0 : data.deaths}\n\
            KDR: ${data.kdr === null ? 0 : data.kdr}\n\
            Streak: ${data.streak === null ? 0 : data.streak}\n\n\
            Monthly Kills: ${data.monthly_kills === null ? 0 : data.monthly_kills}\n\
            Monthly Deaths: ${data.monthly_deaths === null ? 0 : data.monthly_deaths}\n\
            Monthly KDR: ${data.monthly_kdr === null ? 0 : data.monthly_kdr}\n\n\
            Daily Kills: ${data.daily_kills === null ? 0 : data.daily_kills}\n\
            Daily Deaths: ${data.daily_deaths === null ? 0 : data.daily_deaths}\n\
            Daily KDR: ${data.daily_kdr === null ? 0 : data.daily_kdr}`;
            embed
                .setTitle(`Stats for ${data.name}`)
                .setDescription(description)
                .setColor("#33cc33")
                .setFooter(this.config.server_name, this.config.icon)
                .setTimestamp(new Date());;
            message.say(embed);
            this.seconds = databaseCommand.defaultSeconds;
            // databaseCommand.database.destroy(); // For database close test
            // message.say("Database destroyed");
        }, undefined);
        return new Promise<null>(() => {});
    }
}