import { GuildCommandInteraction, ApplicationCommandOptionBase, ComponentTypes, MessageActionRow, MessageComponent, ChannelSelectMenu, ChannelTypes, GuildComponentInteraction } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "goodbye";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "goodbye", description: "Manage guild's goodbye", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    const goodbye: any = await Merlin.database?.get(`${message.guild.id}_goodbye`) || {
        message: null,
        channelId: null
    }

    let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    if (msg == undefined) {
        msg = await message.getOriginal()
    }



    if (msg == undefined) {
        msg = await message.getOriginal()
    }
    update()

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 30000
    });

    collector.on("collect", async (interaction: any) => {
        switch (interaction.data.customID) {
            case "setup":
                let textEmbed = {
                    color: Merlin.config.color,
                    description: `<:forge_plume:1169596246890119169> Please specify a goodbye message for the goodbye configuration.`

                }
                await msg.edit({ content: "", embeds: [textEmbed], components: [] });
                const collected = await require("oceanic-collectors").awaitMessages(Merlin, message.channel, {
                    filter: (m: GuildComponentInteraction) => interaction.user.id === message?.user.id,
                    max: 1,
                    time: 300000,
                });
                goodbye.message = collected[0].content
                collected[0].delete()
                const channelMenu: ChannelSelectMenu = {
                    type: ComponentTypes.CHANNEL_SELECT,
                    channelTypes: [ChannelTypes.GUILD_TEXT],
                    customID: "channelMenu",
                    maxValues: 1
                }

                const actionRow: MessageActionRow = {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        channelMenu as MessageComponent
                    ]
                };
                await msg.edit({ embeds: [], components: [actionRow], content: "" })
                interaction.deferUpdate()
                break;
                case "channelMenu":
                    const filteredChannels = interaction.data.values.raw
                    goodbye.channelId = filteredChannels
        
                    await interaction.createMessage({
                        content: "Data was updated successfully.",
                        flags: 64,
                    });
                    
                    await Merlin.database?.set(`${message.guild.id}_goodbye`, goodbye)
                    update()
                    break;
                    case "delete":
                        goodbye.channelId = null
                        goodbye.message = null

                    await Merlin.database?.delete(`${message.guild.id}_goodbye`)
                    await interaction.createMessage({
                        content: "Data was deleted sucessfully.",
                        flags: 64,
                    });
                    update()
                    break
        }
    })

    async function update() {
        const menu = {
            type: 1,
            components: [
                {
                    type: 2,
                    emoji: { id: "1169596246890119169" },
                    label: "Setup",
                    style: 2,
                    customID: "setup"
                },
                {
                    type: 2,
                    emoji: { id: "1170427475348693164" },
                    label: "Delete Data",
                    style: 2,
                    customID: "delete"
                }
            ],

        }

        await msg.edit({
            components: [menu],
            content: "",
            embeds: [{
                color: Merlin.config.color,
                description: `A management mechanism that will allow you to keep precise track of your server's goodbye.\n➜ \`?userName\`, \`?userMention\`, \`?userId\` to replace with user information\n➜ \`?guildName\`, \`?guildMember\` for server information`,
                fields: [
                    { name: `Message`, value: `${goodbye?.message ? `${goodbye.message}` : "None"}`, inline: true },
                    { name: "Channel", value: `${goodbye?.channelId ? `<#${goodbye.channelId}>` : "None"}`, inline: true },
                ],
                author: {
                    "name": `・ ${message?.guild?.name} - Server Goodbye configuration`,
                },
                timestamp: new Date().toISOString()
            }]
        })
    }
}