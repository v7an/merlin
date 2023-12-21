import { GuildCommandInteraction, ApplicationCommandOptionBase, ComponentTypes, MessageActionRow, MessageComponent, RoleSelectMenu, GuildComponentInteraction } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "soutien";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "soutien", description: "Manage guild's soutien", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    let value: any;
    let value2: any;

    const soutien: any = await Merlin.database?.get(`${message.guild.id}_soutien`) || {
        text: null,
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
                let textEmbed = {
                    color: Merlin.config.color,
                    description: `<:forge_plume:1169596246890119169> Please specify a message for the soutien configuration.`

                }
                await msg.edit({ content: "", embeds: [textEmbed], components: [] });
                const collected = await require("oceanic-collectors").awaitMessages(Merlin, message.channel, {
                    filter: (m: GuildComponentInteraction) => interaction.user.id === message?.user.id,
                    max: 1,
                    time: 300000,
                });
                soutien.text = collected[0].content
                collected[0].delete()
                interaction.deferUpdate()

                const roleMenu: RoleSelectMenu = {
                    type: ComponentTypes.ROLE_SELECT,
                    customID: "roleMenu",
                    maxValues: 1
                }

                const actionRow: MessageActionRow = {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        roleMenu as MessageComponent
                    ]
                };
                let roleEmbed = {
                    color: Merlin.config.color,
                    description: `<:forge_plume:1169596246890119169> Please choose a role for the soutien configuration.`

                }
                await msg.edit({ embeds: [roleEmbed] , components: [actionRow], content: ""})
                break;
                case "roleMenu":
                    const filteredRoles = interaction.data.values.raw
                    soutien.roleId = filteredRoles
        
                    await interaction.createMessage({
                        content: "Data was updated successfully.",
                        flags: 64,
                    });
                    
                    await Merlin.database?.set(`${message.guild.id}_soutien`, soutien)
                    update()
                    break;
                    case "delete":
                        soutien.roleId = null
                        soutien.text = null

                    await Merlin.database?.delete(`${message.guild.id}_soutien`)
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
                    { name: `Message`, value: `${soutien?.text ? `${soutien.text}` : "None"}`, inline: true },
                    { name: "Role", value: `${soutien?.roleId ? `<@&${soutien.roleId}>` : "None"}`, inline: true },
                ],
                author: {
                    "name": `・ ${message?.guild?.name} - Server Soutien configuration`,
                },
                timestamp: new Date().toISOString()
            }]
        })
    }
}