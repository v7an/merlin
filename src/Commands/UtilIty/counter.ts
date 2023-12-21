import { GuildCommandInteraction, ApplicationCommandOptionBase, GuildComponentInteraction, TextableGuildChannels, CategoryChannel, GuildChannel, ChannelTypes, VoiceChannel, AnyGuildChannelWithoutThreads } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "counters";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "counters", description: "Manage guild's counters", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    let value: any;
    let value2: any;

    const counters: any = await Merlin.database?.get(`${message.guild.id}_counters`) || {
        members: {
            channel: undefined,
            name: undefined,
        },
        bots: {
            channel: undefined,
            name: undefined,
        },
        online: {
            channel: undefined,
            name: undefined,
        },
        voice: {
            channel: undefined,
            name: undefined,
        },
        boosts: {
            channel: undefined,
            name: undefined,
        },
        offline: {
            channel: undefined,
            name: undefined,
        }
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
                let embedTest = {
                    "description": "Automatic server logging configuration in progress...",
                    "color": Merlin?.config?.color,
                    "author": {
                        "name": `・ ${message?.guild?.name} - Server logging configuration`,
                    },
                    "footer": {
                        "text": "Merlin Project 🪄"
                    },
                    "timestamp": new Date().toISOString()
                }

                interaction.createMessage({
                    embeds: [embedTest],
                    components: [],
                    content: "",
                    flags: 64
                })

                let foundChannel: CategoryChannel | undefined;
                if (message.guild.channels.some(chan => chan.name === "counter" && chan.type === ChannelTypes.GUILD_CATEGORY)) {
                    foundChannel = message.guild.channels.filter(x => x.type === ChannelTypes.GUILD_CATEGORY).find(chan => chan.name === "counter") as CategoryChannel | undefined;
                }

                const categoryChannel: CategoryChannel = foundChannel as CategoryChannel || await message.guild.createChannel(ChannelTypes.GUILD_CATEGORY, { name: "counter", reason: "Merlin Counter" });


                ([
                    { name: "Members: ?count", value: "members" },
                    { name: "Bots: ?count", value: "bots" },
                    { name: "Online Members: ?count", value: "online" },
                    { name: "Offline Members: ?count", value: "offline" },
                    { name: "Voice Member: ?count", value: "voice" },
                    { name: "Boosts: ?count", value: "boosts" }
                ])
                    .forEach(async (x) => {
                        const logChannel: AnyGuildChannelWithoutThreads | Promise<VoiceChannel> = message.guild.channels.find((chan: any) => chan.name == x.name) || await message.guild.createChannel(ChannelTypes.GUILD_VOICE, { name: x.name, parentID: categoryChannel.id, reason: "Merlin Counter" });
                        counters[x.value] = { channel: logChannel.id, name: x.name }
                    })

                await Merlin.database?.set(`${message.guild.id}_counters`, counters)
                update()

                break;
            case "selectChannel":
                value = interaction.data.values.raw
                console.log(value)
                const menu = {
                    channelTypes: [2],
                    customID: "selectChannels",
                    disabled: false,
                    maxValues: 1,
                    minValues: 1,
                    options: [],
                    placeholder: "Please select a channel",
                    type: 8
                }

                let row = [{ type: 1, components: [menu] }]

                await msg.edit({ content: "", embeds: [], components: row });
                break;

            case "selectChannels":
                let channel = interaction.data.values.raw
                console.log(channel)

                const filter = (m: GuildComponentInteraction) => interaction.user.id === message.user.id;
                const collected = await require("oceanic-collectors").awaitMessages(Merlin, message.channel, {
                    filter: filter,
                    max: 1,
                    time: 300000,
                });

                let value2 = collected[0].content

                let nameCounters = {
                    color: Merlin.config.color,
                    description: `<:forge_plume:1169596246890119169> Please specify a syntax for the counter configuration.`

                }
                await msg.edit({ content: "", embeds: [nameCounters], components: [] });
                counters[value[0]] = { channel: channel, name: value2 }
                await Merlin.database?.set(`${message.guild.id}_counters`, counters)
                update()
                break;
        }
    })
   
    async function update() {
        const menu = {
            type: 1,
            components: [
                {
                    customID: "selectChannel",
                    disabled: false,
                    options: [{
                        label: "Members",
                        value: "members",
                        description: "Modify member counter",
                        emoji: { name: "🤽" }
                    },
                    {
                        label: "Bots",
                        value: "bots",
                        description: "Modify bot counter",
                        emoji: { name: "🤖" }
                    },
                    {
                        label: "Online",
                        value: "online",
                        description: "Modify online member counter",
                        emoji: { name: "🟢" }
                    },
                    {
                        label: "Offline",
                        value: "offline",
                        description: "Modify offline member counter",
                        emoji: { name: "⚪" }
                    },
                    {
                        label: "Voice",
                        value: "voice",
                        description: "Modify voice member counter",
                        emoji: { name: "🔊" }
                    }],
                    placeholder: "Please select an option",
                    type: 3
                }
            ]
        }

        const buttonsRow = {
            type: 1,
            components: [
                {
                    type: 2,
                    emoji: { id: "1169596246890119169" },
                    label: "Automatic setup",
                    style: 2,
                    customID: "setup"
                }
            ]
        }

        await msg.edit({
            components: [menu, buttonsRow],
            content: "",
            embeds: [{
                color: Merlin.config.color,
                fields: [
                    { name: `🤽 Members`, value: `Channel: ${counters.members?.channel ? `<#${counters.members?.channel}>` : "Undefined"}\nName: ${counters?.members?.name ? counters.members.name : "Undefined"}`, inline: true },
                    { name: "🤖 Bots", value: `Channel: ${counters.bots?.channel ? `<#${counters.bots?.channel}>` : "Undefined"}\nName: ${counters?.bots?.name ? counters.bots.name : "Undefined"}`, inline: true },
                    { name: "🟢 Online", value: `Channel: ${counters.online?.channel ? `<#${counters?.online?.channel}>` : "Undefined"}\nName: ${counters?.online?.name ? counters.online.name : "Undefined"}`, inline: true },
                    { name: "⚪ Offline", value: `Channel: ${counters.offline?.channel ? `<#${counters.offline?.channel}>` : "Undefined"}\nName: ${counters?.offline?.name ? counters.offline.name : "Undefined"}`, inline: true },
                    { name: "🔊 Voice", value: `Channel: ${counters?.voice?.channel ? `<#${counters.voice?.channel}>` : "Undefined"}\nName: ${counters?.voice?.name ? counters.voice.name : "Undefined"}`, inline: true },
                    { name: "💎 Boosts", value: `Channel: ${counters?.boosts?.channel ? `<#${counters.boosts?.channel}>` : "Undefined"}\nName: ${counters?.boosts?.name ? counters.boosts.name : "Undefined"}`, inline: true },
                ],
                author: {
                    "name": `・ ${message?.guild?.name} - Server Counter configuration`,
                },
                footer: {
                    "text": "Ps: count = the value of the counter",
                    "iconURL": Merlin.user.avatarURL()
                },
                timestamp: new Date().toISOString()
            }]
        })
    }
}