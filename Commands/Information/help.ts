import { ApplicationCommandOptionsSubCommand, GuildCommandInteraction, GuildComponentSelectMenuInteraction } from "oceanic.js";
import { InteractionCollector } from "oceanic-collectors";
import { Merlin } from "../../Types/ExtendedClient";
import { getCommands } from "../../Utils/Client/getCommands";
import { Command } from "../../Types/Command";

export const name: string = "help";

export const perm: number = 1;

export const slashCommand: ApplicationCommandOptionsSubCommand = {
    name: "help",
    description: "Returns all bot commands",
    type: 1,
    options: []
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    const commands: [string, Command][] = Array.from(getCommands().entries())

    const commandHelp = commands.map(([commandName, commandInfo]) => {
        const options = {
            label: commandInfo.slashCommand.name,
            value: commandInfo.slashCommand.name,
        }
        return options
    })

    const embed = {
        author: { name: `Merlin - List of commands `, iconURL: "https://images-ext-2.discordapp.net/external/Z5gPyhkgY1enaYDZNLiL0faqJ6fycDh5oXi2hraSqA8/https/cdn.jsdelivr.net/gh/twitter/twemoji%4014.0.2/assets/72x72/1f3e0.png" },
        description: `**Merlin** is a bot that will accompany you throughout your Discord server. Its goal is to help you **easily manage your server**.\n\nBelow, you will find a **menu containing all of Merlin's commands**.`,
        image: {
            url: "https://media.discordapp.net/attachments/1160679089347248230/1161296510802202634/image_2023-10-10_153540475.png?ex=6537c8a8&is=652553a8&hm=d9f2dd168dd04be595f308c7392a1217a5a18269aa56557eb5d082b1d7bad798&=&width=582&height=37"
        },
        footer: { text: "Choose a category from the selector below to view its commands." },
        timestamp: new Date().toISOString(),
    };

    let msg: any = await message.createMessage({
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        customID: "menu",
                        placeholder: "Make a choice",
                        options: commandHelp,
                    },
                ],
            },
        ],
    });

    if (msg == undefined) {
        msg = await message.getOriginal()
    }

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 30000
    });



    collector.on("collect", (interaction: GuildComponentSelectMenuInteraction) => {

        if (interaction.data && interaction.data.values.raw.length > 0) {
            const x: Command | undefined = getCommands().get(interaction?.data?.values?.raw[0])

            interaction.createMessage({
                embeds: [
                    {
                        author: { name: `Merlin - Information about the command ${x?.name}`, iconURL: Merlin?.user.avatarURL() },
                        image: {
                            url: "https://media.discordapp.net/attachments/1150431047419441314/1155565867707404318/Forge_fond.png?ex=651d00d4&is=651baf54&hm=f283ba02f726e70bdf896da1da8e4314fde5a3ac7f1c3cb5fd6409f697b9ce6a&=&width=1106&height=378"
                        },
                        footer: { text: interaction.guild.name, iconURL: interaction.guild.iconURL() || undefined },
                        timestamp: new Date().toISOString(),
                        fields: [
                            { name: "Command's Name", value: x?.name || "`❌`", inline: true },
                            { name: "Description", value: x?.slashCommand.description || "`❌`", inline: true },
                        ],
                    },
                ],
                flags: 64
            })
        }
    })

}
