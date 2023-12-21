import { GuildCommandInteraction, ApplicationCommandOptionBase, ComponentTypes, MessageActionRow, MessageComponent, RoleSelectMenu, GuildComponentInteraction, ChannelSelectMenu, ChannelTypes } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "captcha";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "captcha", description: "Manage guild's captcha", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {

    const captcha: any = await Merlin.database?.get(`${message.guild.id}_captcha`) || {
        channelId: null,
        roleId: null
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
                interaction.deferUpdate();
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
                break;
            case "channelMenu":
                interaction.deferUpdate();
                const roleMenu: RoleSelectMenu = {
                    type: ComponentTypes.ROLE_SELECT,
                    customID: "roleMenu",
                    maxValues: 1
                }

                const actionRows: MessageActionRow = {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        roleMenu as MessageComponent
                    ]
                };
                const filteredChannel = interaction.data.values.raw
                captcha.channelId = filteredChannel
                msg.edit({ embeds: [], components: [actionRows] })
                break;
            case "roleMenu":
                const filteredRole = interaction.data.values.raw
                captcha.roleId = filteredRole
                await interaction.createMessage({
                    content: "Data was updated successfully.",
                    flags: 64,
                });

                await Merlin.database?.set(`${message.guild.id}_captcha`, captcha)
                update()
                break;
            case "delete":
                captcha.roleId = null
                captcha.channelId = null

                await Merlin.database?.delete(`${message.guild.id}_captcha`)
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
                fields: [
                    { name: `Channel`, value: `${captcha?.channelId ? `<#${captcha.channelId}>` : "None"}`, inline: true },
                    { name: "Role", value: `${captcha?.roleId ? `<@&${captcha.roleId}>` : "None"}`, inline: true },
                ],
                author: {
                    "name": `・ ${message?.guild?.name} - Server Captcha configuration`,
                },
                timestamp: new Date().toISOString()
            }]
        })
    }
}