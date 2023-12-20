import { GuildCommandInteraction, ApplicationCommandOptionBase, GuildComponentInteraction, TextableGuildChannels, CategoryChannel, GuildChannel, ChannelTypes, VoiceChannel, AnyGuildChannelWithoutThreads, Message, GuildComponentButtonInteraction, GuildComponentSelectMenuInteraction } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "levels";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "levels", description: "Manage guild's levels", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
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
            case "toggle":
                interaction.deferUpdate();
                niveaux.toggle ? niveaux.toggle = false : niveaux.toggle = true;
                await Merlin.database?.set(`${message.guild.id}_niveaux`, niveaux);
                console.log(niveaux)
                update()
                break;
            case "message":
                interaction.deferUpdate()
                await msg.edit({ content: "Please enter a level-up message", embeds: [], components: [] });
                const rankUpMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                rankUpMessage.delete()

                niveaux.message = rankUpMessage.content
                await Merlin.database?.set(`${message.guild.id}_niveaux`, niveaux);
                update()
                break;
            case "blacklistChannels":
                interaction.deferUpdate()
                const menu = {
                    type: 1,
                    components: [
                        {
                            channelType: [0, 5],
                            customID: "selectChannels",
                            disabled: false,
                            maxValue: 3,
                            minValue: 1,
                            options: [],
                            placeHolder: "Select channels",
                            type: 8
                        }
                    ]
                }
                msg.edit({ embeds: [], components: [menu] })
                break;
            case "selectChannels":
                interaction.deferUpdate()
                niveaux.channelBlacklist = interaction.data.values.raw
                await Merlin.database?.set(`${interaction.guild.id}_config`, niveaux);
                update()
                break;
                case "blacklistUsers":
                    interaction.deferUpdate()
                    const menuUsers = {
                        type: 1,
                        components: [
                            {
                                customID: "selectUsers",
                                disabled: false,
                                maxValue: 5,
                                minValue: 1,
                                options: [],
                                placeHolder: "Select users",
                                type: 5
                            }
                        ]
                    }
                    msg.edit({ embeds: [], components: [menuUsers] })
                    break;
                case "selectUsers":
                    interaction.deferUpdate()
                    niveaux.usersBlacklist = interaction.data.values.raw
                    await Merlin.database?.set(`${interaction.guild.id}_config`, niveaux);
                    update()
                    break;
        }

    })

    async function update() {
        const menu = {
            type: 1,
            components: [
                { label: niveaux?.toggle ? "Disabled" : "Enable", customID: "toggle", style: niveaux?.toggle ? 4 : 3, type: 2 },
                { label: "Change the message", disabled: niveaux?.toggle ? false : true, customID: "message", style: 2, type: 2 },
                { label: "Blacklist a channel", disabled: niveaux?.toggle ? false : true, customID: "blacklistChannels", style: 2, type: 2 },
                { label: "Blacklist a user", disabled: niveaux?.toggle ? false : true, customID: "blacklistUsers", style: 2, type: 2 },
            ]
        }



        await msg.edit({
            components: [menu],
            content: "",
            embeds: [{
                description: "A management mechanism that will allow you to keep a precise record of your server's actions.\n➜ Use `?userName`, `?userMention`, `?userId` to replace with user information\n➜ Use `?level`, `?xpToNextLevel`, `?currentExp`, `?currentLevel`, `?nextLevel` for level-related information.",
                color: Merlin.config.color,
                fields: [
                    {
                        name: `Rankup Message`,
                        value:
                            (niveaux?.message ? `${niveaux?.message}` : "```❌```"),
                        inline: true
                    },
                    {
                        name: `Blacklisted Channel(s)`,
                        value:
                            niveaux?.channelBlacklist?.map((r: any) => `<#${r}>`).join(", ") || "```❌```", inline: true
                    },
                    {
                        name: `Blacklisted User(s)`,
                        value:
                            niveaux?.usersBlacklist?.map((r: any) => `<@${r}>`).join(", ") || "```❌```", inline: true
                    },
                ],
                timestamp: new Date().toISOString(),
                author: {
                    "name": `・ ${message?.guild?.name} - Server invite configuration`,
                },
            }]
        })
    }
}