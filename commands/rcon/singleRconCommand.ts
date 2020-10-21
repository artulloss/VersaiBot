import { CommandoClient, CommandoMessage } from "discord.js-commando";
import rconBaseCommand from "./rconBaseCommand";

export default class singleRconCommand extends rconBaseCommand {
    constructor(client: CommandoClient, name: string, description: string, prompt: string, aliases: string[] = []) {
        super(client, name, description, prompt !== "" ? [
            {
                key: "args",
                prompt: "Please enter arguments like so: " + prompt,
                type: "string"
            }
        ] : [], aliases);
        this.name = name;
    }
    run (message: CommandoMessage, { args }: { args: string }) {
        if(!this.checkServerPermissions(message.guild ? message.guild.id : "")) {
            return message.say("That command can't be used by you here!");
        }
        let command: string = args !== undefined ? `${this.name} ${args}` : this.name;
        this.sendRCON(command).then(result => {
            this.handleResult(message, command, result);
        }).catch((err: Error) => {
            this.handleError(err, message, { args });
        });
        return new Promise<null>((resolve, reject) => { resolve(null) });
    }
}