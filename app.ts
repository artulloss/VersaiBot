const config: configInterface = require('./config.json');
import { CommandoClient, Command } from 'discord.js-commando';

const client = new CommandoClient({
    commandPrefix: '~',
    owner: '205757579413028864',
    invite: 'https://discord.versai.pro',
});

import eloCommand from "./commands/database/eloCommand";

import leaderboardCommand from "./commands/database/leaderboardCommand";
import statsCommand from "./commands/database/statsCommand";

import rconCommand from "./commands/rcon/rconCommand";

import applyCommand from "./commands/applications/applyCommand";
import denyCommand from "./commands/applications/denyCommand";

import helpCommand from "./commands/util/helpCommand";
import pingCommand from "./commands/util/pingCommand";
import { configInterface } from './configInterface';
import singleRconCommand from './commands/rcon/singleRconCommand';

var lastSetColorTime = 0;

async function main () {

    client.once('ready', () => {
        if(client.user === null) return;
        console.log(`Logged in as ${client.user.tag}`);
        if(client.user !== null)
            client.user.setActivity('Versai Network');
    });

    client.on('message', message => {
        if(message.member !== null && message.guild !== null) { // Color Changing Nitro Booster Role
            let role = message.guild.roles.cache.find(role => role.name === "Nitro Booster");
            if(role === undefined) return;
            if(message.member.roles.cache.find(role => role.name === "Nitro Booster")) {
                let currentTime = (new Date()).getTime() / 1000;
                if(currentTime - lastSetColorTime > 30) {
                    role.setColor("#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}));
                    lastSetColorTime = currentTime;
                }
            }
        }
    });
    
    client.login(config.token); // Login to bot
    
    client.registry
        .registerDefaultTypes()
        .registerGroups([
            ['database', "Database Commands"],
            ['rcon', "Remote Console Commands"],
            ['applications', "Apple for role on the server!"],
            ['util', "Utilities"]
        ])
        .registerCommands([
            new eloCommand(client),
            new leaderboardCommand(client),
            new statsCommand(client),
            new rconCommand(client),
            new applyCommand(client),
            new denyCommand(client),
            new helpCommand(client),
            new pingCommand(client)
        ]);

    config.rcon.commands.forEach(command => {
        client.registry.registerCommand(
            new singleRconCommand(client, command.command, command.description, command.usage, command.aliases));
    });
};

main();