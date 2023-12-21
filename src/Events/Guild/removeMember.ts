import { Member, TextChannel } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "guildMemberRemove";

export async function execute(Merlin: Merlin, member: Member) {
    const goodbye: any = await Merlin.database?.get(`${member.guild.id}_goodbye`) || [];
    if (goodbye && goodbye.channelId) {
        const channel = member?.guild.channels.get(goodbye.channelId[0]);
        (channel as TextChannel)?.createMessage({
            content: goodbye.message
                .replace(/\?userName/g, member.user.username)
                .replace(/\?userId/g, member.user.id)
                .replace(/\?userMention/g, member.user.mention)
                .replace(/\?guildName/g, member.guild.name)
                .replace(/\?guildMember/g, member.guild?.memberCount)
        })
    }
}
