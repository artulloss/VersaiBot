import { CommandoClient, CommandoMessage } from "discord.js-commando";
import rconBaseCommand from "./rconBaseCommand";
import Discord = require("discord.js");
const ALLOWED_USERS = [
    "205757579413028864", // Adam
    "280384190908989451", // Tru
    "320879177832202243", // Sue
    "281530702590246914" // John
];
export default class rconCommand extends rconBaseCommand {
    constructor(client: CommandoClient ) {
        super(client, "rcon", "Remotely execute commands", [
            {
                key: "command",
                prompt: "Please enter a command",
                type: "string"
            }
        ]);
    }
    run (message: CommandoMessage, { command }: { command: string}) {
        if(!this.checkAuthorPermissions(message.author ? message.author.id : ""))
            return message.say(`You don't have permission to run that command`);
        let embed = new Discord.MessageEmbed()
        this.sendRCON(command).then(result => {
            this.handleResult(message, command, result);
        }).catch(err => {
            this.handleError(err, message, { command });
        });
        //rconBaseCommand.rcon.end() // Simulate closing connection
        // message.say("RCON connection closed!");
        return new Promise<null>((resolve, reject) => { resolve(null) });
    }
}