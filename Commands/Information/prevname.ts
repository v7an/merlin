import { GuildCommandInteraction } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "usernames";

export const perm: number = 1;

export const slashCommand: any = { name: "usernames", description: "Returns old user's usernames", type: 1, options: [{ name: "id", description: "User's id", required: true, type: 3 },] };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[] | null) {
    let id: string | undefined | null;
    
    if(args) {
        if(args.length == 0) return message.createMessage({ content: "You must specify a member."})
        id = args[0]
    } else if(message.data.options.getString("id")) {
        id = message.data.options.getString("id")
    }

    return message.createMessage({ content: ((await Merlin.database?.get(`${id}_usernames`) || []).map((x: { key: string, date: number}) => `**${x.key}** - <t:${Math.floor(x.date / 1000)}:R>`).join("\n") || "None")})
}