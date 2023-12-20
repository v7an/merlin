import { GuildCommandInteraction, ApplicationCommandOptionBase } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "ping";

export const perm: number = 1;

export const slashCommand: ApplicationCommandOptionBase = { name: "ping", description: "Returns bot's ping", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    message.createMessage({ content: "Pong !"})
}