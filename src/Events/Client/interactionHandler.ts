import {CommandInteraction, InteractionTypes} from "oceanic.js";
import {Merlin} from "../../Types/ExtendedClient";
import {getCommands} from "../../Utils/Client/getCommands";
import {Command} from "../../Types/Command";

export const name: string = "interactionCreate";

export async function execute(Merlin: Merlin, interaction: CommandInteraction) {
    if (interaction.type != InteractionTypes.APPLICATION_COMMAND) return
    const cmd = Merlin?.commands?.get(interaction.data.name);
    if (!cmd) return;

    const cm: Command | undefined = Array.from(getCommands().values()).find((x) => x.name == interaction.data.name)
    
    if (!Merlin.config.buyer.includes(interaction.user.id)) {
        const commandData = (await Merlin.database?.get("commands_" + interaction.guild?.id) || []).find((x: any) => x.command == cm?.name)
        let permsData = (await Merlin.database?.get("perms_" + interaction.guild?.id) || [])
        permsData = permsData.filter((x: any) => commandData?.perms.includes(x.perm)).filter((x: any) => x.members.includes(interaction.user.id) || x.roles.some(() => interaction.member?.roles.includes(x))) // Returns filtered permsData
        if (commandData && !commandData.perms.includes(1)) {

            if (!commandData.perms.includes(1)) {
                if (!(permsData.length > 0)) return interaction.createMessage({
                    content: "You do not have permission",
                    flags: 64
                })
            }
        } else if (cm?.perm != 1) {
            return interaction.createMessage({content: "You do not have permission", flags: 64})
        }
    }


    cmd(Merlin, interaction, null);
}