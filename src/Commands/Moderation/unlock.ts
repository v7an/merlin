import {GuildCommandInteraction, ApplicationCommandOptions, ChannelTypes, TextChannel, VoiceChannel} from "oceanic.js";
import {Merlin} from "../../Types/ExtendedClient";

export const name: string = "unlock";

export const perm: number = 3;

export const slashCommand: ApplicationCommandOptions = {
    name: "unlock", description: "Unlock a channel", type: 1,
    options: [
        {
            name: "channel",
            description: "Channel",
            required: false,
            type: 7,
            channelTypes: [ChannelTypes.GUILD_TEXT, ChannelTypes.GUILD_VOICE]
        },
    ]
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    const channel = args ? message.channel || message.guild.channels.get(args[0]): message.data.options.getChannel('channel') ||  message.channel;
    
    (channel as TextChannel | VoiceChannel).editPermission(message.guild.id, {
        type: 0,
        allow: "377957124096",
        reason: `Unlocked by Merlin | ${message.user.username} ( ${message.user.id} )`
    }).finally(() => {
        message.createMessage({
            embeds: [{
                title: `<:forge_yes:1169596233338327082> Successfully unlocked ${channel.name}`,
                color: Merlin.config.color,
                footer: {text: message.guild.name, iconURL: message.guild.iconURL() || undefined},
                timestamp: new Date().toISOString(),
            }], flags: 64
        });
    });
}