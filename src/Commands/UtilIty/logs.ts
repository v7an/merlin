import { GuildCommandInteraction, ApplicationCommandOptionBase, GuildComponentInteraction, TextableGuildChannels, CategoryChannel, GuildChannel, ChannelTypes, TextChannel, AnyGuildChannelWithoutThreads } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "logs";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "logs", description: "Manage guild's logs", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    const logs: string[] = await Merlin.database?.get(`${message.guild.id}_logs`) || [];
    let msg: any = await message.createMessage({ content: "🪄 Thinking..."})
    if(msg == undefined) {
        msg = await message.getOriginal()
    }
    async function update() {
        const menu = {
            type: 1,
            components: [{
                channelTypes: [0, 5],
                customID: "logsSelect",
                disabled: false,
                maxValues: 1,
                minValues: 1,
                options: [],
                placeholder: "Select a channel",
                type: 8
            }]
        }
    
        const buttonsRow = {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 3,
                    label: "Enable",
                    customID: "state"
                },
                {
                    type: 2,
                    label: "Automatic setup",
                    style: 2,
                    customID: "setup"
                }
            ]
        }
    
        const eventsMenu = {
            type: 1,
            components: [
                {
                    type: 3,
                    customID: "logs",
                    options: [
                        {
                            label: "Channel-related actions",
                            value: "channels"
                        },
    
                        {
                            label: "Role-related actions",
                            value: "roles"
                        },
    
                        {
                            label: "Message-related actions",
                            value: "messages"
                        },
    
                        {
                            label: "Member-related actions",
                            value: "members"
                        },
                    ]
                }
            ]
        }
        await msg.edit({
            components: [buttonsRow, eventsMenu, menu],
            content: "",
            embeds: [{
                color: Merlin.config.color,
                description: "**Current Status**\n・Active `✅`\n**Log Type:** \n・`Channel Creation`\n・`Channel Modification`\n・`Channel Deletion`\n**Log Channel:**\n・<#1160568894264721438> (`ID: 1160568894264721438`)",
                author: {
                    "name": `・ ${message?.guild?.name} - Server logging configuration`,
                },
                footer: {
                    "text": "Merlin Project 🪄"
                },
                timestamp: new Date().toISOString()
            }]
        })
    }
    update()
   

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentInteraction) => interaction.user.id === message?.user.id,
        message:  msg,
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
                if (message.guild.channels.some(chan => chan.name === "logs" && chan.type === ChannelTypes.GUILD_CATEGORY)) {
                    foundChannel = message.guild.channels.filter(x => x.type === ChannelTypes.GUILD_CATEGORY).find(chan => chan.name === "logs") as CategoryChannel | undefined;
                }

                const categoryChannel: CategoryChannel = foundChannel as CategoryChannel || await message.guild.createChannel(ChannelTypes.GUILD_CATEGORY, { name: "logs", reason: "Merlin Logs" });

                
                ([
                    { name: "⏰・logs-channels", value: "channels" },
                    { name: "🎯・logs-roles", value: "roles" },
                    { name: "💬・logs-messages", value: "messages" },
                    { name: "👤・logs-members", value: "members" },
                    { name: "🏮・logs-serveur", value: "server" },
                ])
                .forEach(async (x) => {                    
                    const logChannel: AnyGuildChannelWithoutThreads | Promise<TextChannel> = message.guild.channels.find((chan: any) => chan.name == x.name)  || await message.guild.createChannel(ChannelTypes.GUILD_TEXT, { name: x.name, parentID: categoryChannel.id, reason: "Merlin Logs" });

                })
                break;
        }
    })

}