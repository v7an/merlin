import { GuildCommandInteraction, ApplicationCommandOptionBase, ApplicationCommandOptionsWithValue, Message, Guild, Role, User, ApplicationCommandOptions, InteractionOptionsSubCommand, ApplicationCommandOptionsSubCommand, ApplicationCommandOptionsUser, ApplicationCommandOptionsInteger } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import ms from "ms";

export const name: string = "unmute";

export const perm: number = 2;

export const slashCommand: ApplicationCommandOptions = {
    name: "unmute", description: "Unmute a member", type: 1,
    options: [
        { name: "member", description: "Member", required: true, type: 6 }
    ]
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    //let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    let user = args ? message.guild.members.get(args[0]) : message.data.options.getUser('member');

    if (!user) return
    const member = message.guild.members.get(user.id);

    if (member?.id === Merlin.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't mute the bot!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't mute yourself!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.guild.ownerID) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't mute server creator!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    }); 
    let botHighestRole = message.guild.roles.get(message.guild.id) as Role;
    let targetHighestRole = message.guild.roles.get(message.guild.id) as Role;
    member?.roles.forEach(roleID => {
        const role = message.guild.roles.get(roleID);
        if (!role) return;
        if (!targetHighestRole || role.position > targetHighestRole.position) {
                targetHighestRole = role;
            }
        });
    message.guild.members.get(Merlin.user.id)?.roles.forEach(roleID => {
        const role = message.guild.roles.get(roleID);
        if (!role) return;
        if (!botHighestRole || role.position > botHighestRole.position) {
            botHighestRole = role;
        }
    });
    if (botHighestRole.position <= targetHighestRole.position) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> This member\'s position is higher than mine!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if(!member?.communicationDisabledUntil) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> This member\'is not already timeout`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });

    member?.guild.editMember(member.user.id, { communicationDisabledUntil: null }).finally(() => {
        message.createMessage({ content: `<:forge_yes:1169596233338327082> Untimeout ${user?.username} successfully` })
    })
}