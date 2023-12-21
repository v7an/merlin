import { GuildCommandInteraction, ApplicationCommandOptionBase, GuildComponentSelectMenuInteraction, Message, Guild, Role, User } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { InteractionCollector } from "oceanic-collectors";
import { getCommands } from "../../Utils/Client/getCommands";

export const name: string = "commands";

export const perm: number = 5;

export const slashCommand: ApplicationCommandOptionBase = { name: "commands", description: "Manage guild's commands permissions", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {

    console.log((new Set(getCommands().values())))
    const commands: any = Array.from(new Set(getCommands().values())).filter((x) => x.name).sort((a, b) => a?.name?.localeCompare(b?.name));
    let pageCount = 0
    const pages: any = [];
    const chunks: any = Math.ceil(commands.length / 25);

    Array(chunks).fill(undefined).forEach((_, i) => {
        const start = i * 25;
        const end = start + 25;
        pages.push(commands.slice(start, end));
    });



    let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    if (msg == undefined) {
        msg = await message.getOriginal()
    }

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 30000
    });


    updateEmbed(msg, pages, pageCount, Merlin, message.guild)

    collector.on("collect", async (interaction: any) => {
        let command = interaction.message.components?.[0]?.components[0]?.options?.find((x: any) => x.default)?.value
        let data = await Merlin.database?.get(`commands_${interaction.guild.id}`) || []

        switch (interaction.data.customID) {
            case "right":
                interaction.deferUpdate()
                pageCount++

                if (pageCount == pages.length) {
                    pageCount = 0
                }

                updateEmbed(msg, pages, pageCount, Merlin, message.guild)
                break;

            case "left":
                interaction.deferUpdate()
                pageCount--

                if (pageCount == -1) {
                    pageCount = pages.length - 1
                }

                updateEmbed(msg, pages, pageCount, Merlin, message.guild)
                break;

            case "commands":
                interaction.deferUpdate()
                data = data.find((x: any) => interaction.data.values.raw[0] == x.command) || { command: interaction.data.values.raw[0], perms: [] }

                updateEmbed(msg, pages, pageCount, Merlin, message.guild, data)
                break;

            case "permissions":
                interaction.deferUpdate()

                data = data.filter((x: any) => x.command != command)
                data.push({ command: command, perms: interaction.data.values.raw })

                await Merlin.database?.set(`commands_${message.guild.id}`, data)
                updateEmbed(msg, pages, pageCount, Merlin, message.guild, { command: command, perms: interaction.data.values.raw })
                break;

            case "autoconfig":
                interaction.deferUpdate()

                data = commands.filter((x: any) => x.perm).map((x: any) => ({ command: x.name, perms: [x.perm] }))
                await Merlin.database?.set(`commands_${message.guild.id}`, data)
                updateEmbed(msg, pages, pageCount, Merlin, message.guild)
                break;
        }
    })
}


async function updateEmbed(msg: any, pages: any, pageCount: any, Merlin: Merlin, guild: any, command?: any) {

    let compo: any = [{
        type: 1,
        components: [{
            type: 3,
            customID: "commands",
            options: pages[pageCount].map((x: any) => ({ value: x.name, default: command && x.name == command.command, label: x.name, emoji: { id: "1112798003217039442" } }))
        }]
    }]

    if (command) {
        let d = await Merlin.database?.get(`perms_${guild.id}`) || []

        compo.push({
            type: 1,
            components: [{
                type: 3,
                customID: "permissions",
                maxValues: d.length > 0 ? d.length : 1,
                options: [{
                    value: 1, label: "1 (Public)", emoji: {
                        name: "🏴"
                    }
                }, ...(d || []).filter((x: any) => x.perm != 1).map(((x: any) => ({
                    value: x.perm, label: x.perm, default: command.perms.includes(x.perm), emoji: {
                        name: "🏴"
                    }
                })))]
            }]
        })
    }

    compo.push({
        type: 1,
        components: [{
            type: 2,
            emoji: { id: "1169596244100907059" },
            style: 1,
            customID: "left"
        }, {
            type: 2,
            style: 2,
            label: `Page ${pageCount + 1}/${pages.length}`,
            customID: "page",
            disabled: true,
        }, {
            type: 2,
            style: 1,
            emoji: { id: "1169596215999090790" },
            customID: "right"
        },
        {
            type: 2,
            label: "Automatic Setup",
            emoji: { id: "1169596246890119169" },
            style: 2,
            customID: "autoconfig",
        }]
    })

    msg.edit({
        content: "",
        embeds: command ? [{
            color: Merlin.config.color,
            author: { name: Merlin.user.tag + " - Configuration of permission", iconURL: Merlin.user.avatarURL() },
            footer: { text: guild.name, iconURL: guild?.iconURL() || undefined },
            description: `**Name of the command: ${command.command}**
\`\`\`Authorized permission(s)\n${command.perm ? "None" : command.perms.map((x: any) => `・${x}`).join("\n") }\`\`\``,
            timestamp: new Date().toISOString(),
            thumbnail: { url: guild.iconURL() }
        }] : [],
        components: compo
    })
}