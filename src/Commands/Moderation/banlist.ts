import { GuildCommandInteraction, Role, Member, ApplicationCommandOptionBase, ChannelTypes, GuildComponentButtonInteraction } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "banlist";

export const perm: number = 3;

export const slashCommand: ApplicationCommandOptionBase = {
    name: "banlist", description: "Fetch ban list", type: 1,
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    let page: number = 0;
    let size: number = 0;

    const bans = (await message.guild.getBans()).map((ban) => `${ban.user.username} - ${ban.reason}`).join("\n")
    

    if (!bans.length) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> The server has no ban`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });

    let embed = {
        color: Merlin.config.color,
        author: { name: Merlin.user.username + `List of bans`, iconURL: Merlin.user.avatarURL() },
        footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
        description: "```" + bans.slice(size, size + 50) + "```",
        
        timestamp: new Date().toISOString()
    }

    let component = {
        type: 1,
        components: [
            {
                type: 2,
                emoji: { id: "1169596208944267285" },
                style: 3,
                disabled: page == 0,
                customID: "left",
            },
            {
                type: 2,
                emoji: { id: "1169596208944267285" },
                style: 3,
                disabled: bans.length > size,
                customID: "right",
            },
        ]
    }

    await message.createMessage({ embeds: [embed], components: [component] })



    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentButtonInteraction) => interaction.user.id === message?.user.id,
        message: await message.getOriginal(),
        time: 30000,
    });

    collector.on("collect", async (interaction: GuildComponentButtonInteraction) => {
        switch (interaction.data.customID) {
            case "right":
                size += 50;
                page++
                await message.editOriginal({
                    embeds: [embed],
                    components: [component]
                })
            case "left":
                size -= 50;
                page--
                await message.editOriginal({
                    embeds: [embed],
                    components: [component]
                })
        }
    })

}