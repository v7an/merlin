import { GuildCommandInteraction, ApplicationCommandOptionBase, Message, ApplicationCommand } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { createCanvas, loadImage, registerFont } from "canvas"

export const name: string = "rank";

export const perm: number = 1;

export const slashCommand: ApplicationCommandOptionBase = { name: "rank", description: "View your level", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    if(!message.guild || !message.channel) return; 

    const niveaux: {
        toggle: Boolean,
        message: string | undefined,
        channelBlacklist: string[],
        usersBlacklist: string[],
    } = await Merlin.database?.get(`${message.guild.id}_niveaux`) || {
        toggle: undefined,
        message: undefined,
        channelBlacklist: [],
        usersBlacklist: [],
    }

    const userLevel: {
        guildId: string | undefined,
        xp: number,
        allXp: number,
        messages: number,
        level: number,

    } = await Merlin.database?.get(`${message.guild.id}_${message.user.id}_levels`) || {}
    let blackListedUsers: string[] = niveaux.usersBlacklist || []
    let blacklistUser = {
        color: Merlin.config.color,
        description: `<:forge_no:1169596223674667059> The user to blacklisted`

    }
    if (blackListedUsers.includes(message.user.id)) return message.createMessage({ content: "", embeds: [blacklistUser], components: [] });

    const guildLevels: Map<string, any> = await Merlin.database?.get()
    console.log(Array.from(guildLevels.entries()).filter((x) => x[0].endsWith("_levels") && x[0].startsWith(message.guild.id) ))
    let xpNeeded = userLevel.level * 100 + 100
    let xp = userLevel.xp;
    let level = userLevel.level;
    const canvas = createCanvas(1440, 606)
    const ctx = canvas.getContext('2d')

   
    
    message.createMessage({ content: "Pong !" })
}