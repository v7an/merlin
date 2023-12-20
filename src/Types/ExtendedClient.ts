import { Client, ClientOptions, CommandInteraction, GuildComponentInteraction, Message, TextChannel, User } from "oceanic.js";
import { Pocket } from "../Utils/Utils/pocket";
import { registerClientCommands } from "../Utils/Client/registerClientCommands";
import { registerClientEvents } from "../Utils/Client/registerClientEvents";
import { registerClientSlashCommands } from "../Utils/Client/registerClientSlashCommands";
import { Config } from "./Config";
import { awaitMessages } from "oceanic-collectors";
import { readFileSync, writeFileSync } from "fs";

interface MerlinOptions extends ClientOptions {
    database?: Pocket;
    subscriptionCode: string,
    config: Config
};

export class Merlin extends Client {
    database?: Pocket;
    commands?: Map<string, Function>
    config: Config
    subscriptionCode: string

    constructor(options: MerlinOptions) {
        super(options);


        this.database = new Pocket({
            path: `./src/database/${options.subscriptionCode}`,
            useJson: true
        });

        this.subscriptionCode = options.subscriptionCode;
        this.config = options.config;

        if(options.config.type == "Hybrid" || options.config.type == "Slash") {
            registerClientSlashCommands(this, options.config.id);
        } else {
            (async () =>
            (await this.rest.applicationCommands.getGlobalCommands(options.config.id))
            .forEach(GlobalCommand => {
                this.rest.applicationCommands.deleteGlobalCommand(options.config.id, GlobalCommand.id)
            })
            )();
        };

        if(options.config.type == "Hybrid" || options.config.type == "Prefix") {
            registerClientEvents(this, true);
            this.commands = registerClientCommands();
        } else {
            registerClientEvents(this, false);
            this.commands = registerClientCommands();
        };

        this.connect();
    };

    destroy = () => {
        this.removeAllListeners();
        this.disconnect(false);
    }

    awaitReply = async (channel: TextChannel, author: User): Promise<Message> => {
        const collected: any = await awaitMessages(this, channel, {
            filter: (m: Message) => m.author.id === author.id,
            max: 1,
            time: 300000,
        });
        
        return collected[0]
    }

    updateConfig = async () => {
        writeFileSync(`./src/database/${this.subscriptionCode}`, JSON.stringify({...this.config, color: this.config.color.toString()}))
    }
}