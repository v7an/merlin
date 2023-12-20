import { GuildCommandInteraction, ApplicationCommandOptionBase, ComponentTypes, MessageActionRow, Embed, Message, GuildComponentSelectMenuInteraction, ButtonComponent, ButtonStyles, GuildComponentInteraction } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { InteractionCollector, awaitMessages } from "oceanic-collectors";

export const name: string = "badword";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "badword", description: "Manage guild's badword", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    let badword: string[] = await Merlin.database?.get(`${message.guild.id}_badwords`) || [];

    let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    if (msg == undefined) {
        msg = await message.getOriginal()
    }

    async function update() {
        const embed: Embed = {
            color: Merlin.config.color,
            author: { name: Merlin.user.tag + " - Badwords", iconURL: Merlin.user.avatarURL() },
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            description: "```" + ((badword.map((x) => `- ${x}`).join("\n")) || "None") + "```",
            timestamp: new Date().toISOString()
        }

        const addButton: ButtonComponent = {
            type: 2,
            style: ButtonStyles.SUCCESS,
            customID: "add",
            emoji: { id: "1169596208944267285" },
        }

        const resetButton: ButtonComponent = {
            type: 2,
            style: ButtonStyles.SECONDARY,
            customID: "reset",
            disabled: badword.length == 0,
            emoji: { id: "1170427475348693164" },
        }
        const deleteButton: ButtonComponent = {
            type: 2,
            style: ButtonStyles.DANGER,
            customID: "remove",
            disabled: badword.length == 0,
            emoji: { id: "1169596239730462720" },
        }

        const actionRowButton: MessageActionRow = {
            type: ComponentTypes.ACTION_ROW,
            components: [
                addButton, resetButton, deleteButton
            ]
        };

        await msg.edit({ embeds: [embed], components: [actionRowButton], content: "" })
    }

    update()

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 30000
    });

    collector.on("collect", async (interaction: GuildComponentSelectMenuInteraction) => {
        switch (interaction.data.customID) {
            case "add":
                await interaction.createMessage({
                    content: `What message would you add to the badwords?`,
                    flags: 64,
                })
                const collector2 = await awaitMessages(Merlin, message.channel, {
                    filter:  (m: Message) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 300000,
                });

                if (!badword.includes(collector2[0].content)) await Merlin.database?.push(`${message.guild.id}_badwords`, collector2[0].content).finally(() => {
                    update()
                    collector2[0].delete()
                })
                break;
            case "remove":
                await interaction.createMessage({
                    content: `What message do you want to remove from the badwords?`,
                    flags: 64,
                })
                const collector3 = await awaitMessages(Merlin, message.channel, {
                    filter: (m: Message) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 300000,
                });

                if (badword.includes(collector3[0].content)) await Merlin.database?.pop(`${message.guild.id}_badwords`, collector3[0].content).finally(() => {
                    update()
                    collector3[0].delete()
                })
                break;
            case "reset":
                Merlin.database?.delete(`${message.guild.id}_badwords`).finally(() => update())
                await interaction.createMessage({
                    content: "Data was deleted sucessfully.",
                    flags: 64,
                });
                break;
        }

    })

}