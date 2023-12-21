import { GuildCommandInteraction, ApplicationCommandOptionBase, ComponentTypes, MessageActionRow, MessageComponent, Embed, RoleSelectMenu, GuildComponentSelectMenuInteraction, ButtonComponent, ButtonStyles } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { InteractionCollector } from "oceanic-collectors";

export const name: string = "autorole";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = { name: "autorole", description: "Manage guild's autorole", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]) {
    let autorole: string[] = await Merlin.database?.get(`${message.guild.id}_autorole`) || [];
    
    let msg: any = await message.createMessage({ content: "🪄 Thinking..."})
    if(msg == undefined) {
        msg = await message.getOriginal()
    }

    async function update() {
        const embed: Embed = {
            color: Merlin.config.color,
            author: { name: Merlin.user.tag + " - Automatic roles", iconURL: Merlin.user.avatarURL() },
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            description: "```" + ((autorole.map((x) => `- ${message.guild.roles.get(x)?.name} (${x})`).join("\n") ) || "None") + "```",
            timestamp: new Date().toISOString()
        }
    
        const roleMenu: RoleSelectMenu = {
            type: ComponentTypes.ROLE_SELECT,
            customID: "roleMenu",
            maxValues: message.guild.roles.size > 25 ? 25 : message.guild.roles.size
        }
    
        const actionRow: MessageActionRow = {
            type: ComponentTypes.ACTION_ROW,
            components: [
                roleMenu as MessageComponent
            ]
        };

        const deleteButton: ButtonComponent = {
            type: 2,
            style: ButtonStyles.SECONDARY,
            customID: "delete",
            label: "Delete data",
            emoji: { id: "1170427475348693164"}
        }

        const actionRowButton: MessageActionRow = {
            type: ComponentTypes.ACTION_ROW,
            components: [
                deleteButton as MessageComponent
            ]
        };
    
        await msg.edit({ embeds: [embed], components: [actionRow, actionRowButton], content: ""})
    }
    
    update()

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message:  msg,
        time: 30000
    });

    collector.on("collect", async (interaction: GuildComponentSelectMenuInteraction) => {
        if(interaction.data.customID == "roleMenu") {
            const filteredRoles = interaction.data.values.raw.filter((x) => !message.guild.roles.get(x)?.hoist ) 
            autorole = filteredRoles

            await interaction.createMessage({
                content: "Data was updated successfully. " + (filteredRoles.length !== interaction.data.values.raw.length ? `\nI can't attribute the following roles: ${interaction.data.values.raw.filter((x) => message.guild.roles.get(x)?.hoist).map((x) => `<@&${x}>`).join(", ")}` : ""),
                flags: 64,
            });
            
            await Merlin.database?.set(`${message.guild.id}_autorole`, autorole)
            update()
        } else {
            autorole = []
            await Merlin.database?.delete(`${message.guild.id}_autorole`)
            await interaction.createMessage({
                content: "Data was deleted sucessfully.",
                flags: 64,
            });
            update()
        }
    })

}