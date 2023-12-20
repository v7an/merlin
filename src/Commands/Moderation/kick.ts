import { GuildCommandInteraction, ApplicationCommandOptionBase, ApplicationCommandOptionsWithValue, Message, Guild, Role, User, ApplicationCommandOptions, InteractionOptionsSubCommand, ApplicationCommandOptionsSubCommand, ApplicationCommandOptionsUser, ApplicationCommandOptionsInteger } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "kick";

export const perm: number = 2;

export const slashCommand: ApplicationCommandOptions = {
    name: "kick", description: "Kick a member", type: 1,
    options: [
        { name: "member", description: "Member", required: true, type: 6 },
        { name: "reason", description: "Reason", required: false, type: 3 },
    ]
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    //let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    let user = args ? message.guild.members.get(args[0]) : message.data.options.getUser('member');
        
    let reason = message.data.options.getString('reason', false) 
    if (!user) return
    const member = message.guild.members.get(user.id);

    if (member?.id === Merlin.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't kick the bot!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't kick yourself!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.guild.ownerID) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't ban server creator!`,
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

    message?.guild.members.get(Merlin.user.id)?.roles.forEach(roleID => {
        const role = message.guild.roles.get(roleID);
        if (!role) return;
        if (!botHighestRole || role.position > botHighestRole.position) {
            botHighestRole = role;
        }
    });
    if (targetHighestRole.position > botHighestRole.position) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> This member\'s position is higher than mine!`,
            color: Merlin.config.color,
            footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    message.guild.removeMember(user.id, reason).finally(() => {
        message.createMessage({
            embeds: [{
                title: `<:forge_yes:1169596233338327082> Kicked ${user?.username} successfully`,
                color: Merlin.config.color,
                footer: { text: message.guild.name, iconURL: message.guild.iconURL() || undefined },
                timestamp: new Date().toISOString(),
            }]
        })
    })
}