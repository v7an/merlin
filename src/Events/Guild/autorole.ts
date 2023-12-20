import { Member } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "guildMemberAdd";
 
export async function execute(Merlin: Merlin, member: Member) {
    const autorole: string[] = await Merlin.database?.get(`${member.guild.id}_autorole`) || [];

    autorole.forEach(async (role: string) => {
        if(member.guild.roles.get(role)) {
            await member.addRole(role).catch((e) => {})
        }
    })
}
