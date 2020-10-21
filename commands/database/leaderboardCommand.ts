import { CommandoClient, CommandoMessage } from "discord.js-commando";
import databaseCommand from "./databaseCommand"
import Discord = require("discord.js");
var query = "SELECT player_scores.name, :type.value FROM :type LEFT JOIN player_scores ON :type.id = player_scores.id ORDER BY value DESC LIMIT :entries";
const types = ['kills', 'deaths', 'kdr', 'streaks', 'monthly_kills', 'monthly_deaths', 'monthly_kdr', 'daily_kills', 'daily_deaths', 'daily_kdr']

export default class leaderboardCommand extends databaseCommand {
    constructor(client: CommandoClient) {
        super (client, {
            name: "leaderboard",
            aliases: ["lb"],
            group: "database",
            memberName: "leaderboard",
            description: "View leaderboards",
            throttling: {
                usages: 2, // 2 times per 10 seconds
                duration: 10
            },
            args: [
                {
                    key: "type",
                    prompt: "Please choose one of the following: kills, deaths, kdr, streaks, monthly_kills, monthly_deaths, monthly_kdr, daily_kills, daily_deaths, daily_kdr",
                    type: "string"
                },
                {
                    key: "entries",
                    prompt: "Please choose how many entries you'd like to display.",
                    type: "integer",
                    default: 10
                }
            ]
        });
    }

    run (message: CommandoMessage, { type, entries }: { type: string, entries: number} ) {
        type = type.toLowerCase();
        let typeReadable = type.charAt(0).toUpperCase() + type.slice(1);
        let embed = new Discord.MessageEmbed().setTitle(`${typeReadable} Leaderboard`);
        if(!types.includes(type)) {
            embed
                .setDescription("Invalid type of leaderboard!")
                .setColor("#cc0000")
                .setFooter(this.config.server_name, this.config.icon)
                .setTimestamp(new Date());
            return message.say(embed);
        }
        if(entries > 50) {
            embed
                .setDescription("You can only query the top 50 players")
                .setColor("#cc0000")
                .setFooter(this.config.server_name, this.config.icon)
                .setTimestamp(new Date());
            return message.say(embed);
        }
        let oldQuery = query;
        query = this.resolveKDR(type);
            databaseCommand.database.query(query.split(":type").join(type).replace(":entries", entries.toString()), (error: Error, result: any) => {
                if (error)
                    return this.handleError(message, { type, entries });
                let data = result;
                let x: number = 1;
                //let final = data.length - 1;
                let description: string = ""
                for(let key in data) {
                    //description += (`${x}. ${data[key].name}: ${data[key].value}${key != final ? "\n" : ""}`);
                    description += (`${x}. ${data[key].name}: ${data[key].value}\n`);
                    x++;
                }
                embed
                    .setDescription(description)
                    .setColor("#33cc33")
                    .setFooter(this.config.server_name, this.config.icon)
                    .setTimestamp(new Date());
                message.say(embed);      
                query = oldQuery;
                this.seconds = databaseCommand.defaultSeconds;
                //databaseCommand.database.destroy(); // Check if closing database works
                //message.say("Database destroyed");
            }, undefined);
            return new Promise<null>(() => {});
    }
    resolveKDR (type: string) {
        switch(type) {
            case "kdr":
            return "SELECT player_scores.name, COALESCE(kills.value / NULLIF(deaths.value, 0), kills.value) as value FROM kills LEFT JOIN player_scores ON kills.id = player_scores.id LEFT JOIN deaths ON deaths.id = player_scores.id ORDER BY value DESC LIMIT :entries";
            case "monthly_kdr":
            return "SELECT player_scores.name, COALESCE(monthly_kills.value / NULLIF(monthly_deaths.value, 0), monthly_kills.value) as value FROM monthly_kills LEFT JOIN player_scores ON monthly_kills.id = player_scores.id LEFT JOIN monthly_deaths ON monthly_deaths.id = player_scores.id ORDER BY value DESC LIMIT :entries";
            case "daily_kdr":
            return "SELECT player_scores.name, COALESCE(daily_kills.value / NULLIF(daily_deaths.value, 0), daily_kills.value) as value FROM daily_kills LEFT JOIN player_scores ON daily_kills.id = player_scores.id LEFT JOIN daily_deaths ON daily_deaths.id = player_scores.id ORDER BY value DESC LIMIT :entries";
            default:
            return query;
        }
    }
}