import { GuildCommandInteraction } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "avatars";

export const perm: number = 1;

export const slashCommand: any = { name: "avatars", description: "Returns old user's avatars", type: 1, options: [{ name: "id", description: "User's id", required: true, type: 3 },] };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[] | null) {
    let id: string | undefined | null;
    
    if(args) {
        if(args.length == 0) return message.createMessage({ content: "You must specify a member."})
        id = args[0]
    } else if(message.data.options.getString("id")) {
        id = message.data.options.getString("id")
    }

    return message.createMessage({ content: ((await Merlin.database?.get(`${id}_avatars`) || []).map((x: { key: string, date: number}) => `**[Click Here](${x.key})** - <t:${Math.floor(x.date / 1000)}:R>`).join("\n") || "None")})
}