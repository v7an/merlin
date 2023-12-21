import { Member, TextChannel } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "guildMemberAdd";

export async function execute(Merlin: Merlin, member: Member) {
    const welcome: any = await Merlin.database?.get(`${member.guild.id}_welcome`) || [];

    if (welcome && welcome.channelId) {
        const channel = member?.guild.channels.get(welcome.channelId[0]);
        (channel as TextChannel)?.createMessage({
            content: welcome.message
                .replace(/\?userName/g, member.user.username)
                .replace(/\?userId/g, member.user.id)
                .replace(/\?userMention/g, member.user.mention)
                .replace(/\?guildName/g, member.guild.name)
                .replace(/\?guildMember/g, member.guild?.memberCount)
        })
    }
}
