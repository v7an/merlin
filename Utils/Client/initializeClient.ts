import {  AllIntents } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient"
import fs from "fs";
import { Config } from "../../Types/Config";

export function initializeClient(subscriptionCode: string): Merlin {
    
    const config: Config = JSON.parse(fs.readFileSync(`./src/Database/${subscriptionCode}-config.json`, 'utf8'))
    if((typeof config.color) == "string") config.color = parseInt(config.color, 16)

    return new Merlin({
        subscriptionCode: subscriptionCode,
        auth: `Bot ${config.token}`,
        config: config,
        gateway: {
            intents: AllIntents
        }
    })
    
}