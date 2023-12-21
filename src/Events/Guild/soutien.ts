import { Merlin } from "../../Types/ExtendedClient";
import { Member } from "oceanic.js"

export const name: string = "presenceUpdate";

export async function execute(Merlin: Merlin, member: Member, newPresence: any, oldPresence: any) {
    if (!newPresence.guild) return
    const data: any = await Merlin.database?.get(`${newPresence.guild.id}_soutien`);
    if (!data) return
    if (!newPresence.presence.activities[0] || newPresence.presence.activities[0].length === 0) return

    switch (true) {
        case newPresence.presence.activities[0].state !== data.text:
            break;

        case newPresence.presence.activities[0].state === data.text:
            newPresence.addRole(data.roleId)
            break;
    }

}
