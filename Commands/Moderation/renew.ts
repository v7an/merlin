import { GuildCommandInteraction, ApplicationCommandOptions, ChannelTypes, TextChannel, VoiceChannel, CreateChannelOptions } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { AnyAaaaRecord } from "dns";

export const name: string = "renew";

export const perm: number = 2;

export const slashCommand: ApplicationCommandOptions = {
    name: "renew", description: "Renew a channel", type: 1,
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
    const channel = args ? message.guild.channels.get(args[0]) : message.data.options.getChannel('channel') || message.channel;
    console.log((channel as TextChannel).type)
    message.guild.createChannel((channel as TextChannel | VoiceChannel)?.type, { ...channel as CreateChannelOptions })
        .then((nc) => {
            nc.createMessage({
                content: message.user.mention,
                embeds: [{
                    title: `<:forge_yes:1169596233338327082> I just recreated ${nc.mention}`,
                    color: Merlin.config.color,
                    footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
                    timestamp: new Date().toISOString(),
                }], flags: 64
            });
        })
        .finally(() => {
            channel?.delete()
        })
}