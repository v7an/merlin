import { GuildCommandInteraction, ApplicationCommandOptionBase } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { initializeClient } from "../../Utils/Client/initializeClient";

export const name: string = "restart";

export const perm: number = 5;

export const slashCommand: ApplicationCommandOptionBase = { name: "restart", description: "restart", type: 1 };

export const update: boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    message.createMessage({ content: "Restarting..."})
    Merlin.destroy()
    Merlin = initializeClient("Merlin")
    Merlin.once("ready", () => {
        message.channel.createMessage({ content: "Restarted"})
    })
}
