import {
    GuildCommandInteraction,
    ApplicationCommandOptionBase,
    ApplicationCommandOptionsWithValue,
    Message,
    Guild,
    Role,
    User,
    ApplicationCommandOptions,
    InteractionOptionsSubCommand,
    ApplicationCommandOptionsSubCommand,
    ApplicationCommandOptionsUser,
    ApplicationCommandOptionsInteger
} from "oceanic.js";
import {Merlin} from "../../Types/ExtendedClient";

export const name: string = "derank";

export const perm: number = 2;

export const slashCommand: ApplicationCommandOptions = {
    name: "derank", description: "Derank a member", type: 1,
    options: [
        {name: "member", description: "Member", required: true, type: 6},
    ]
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    let user = args ? message.guild.members.get(args[0]) : message.data.options.getUser('member');
    
    if (!user) return
    const member = message.guild.members.get(user.id);
    
    if (member?.id === Merlin.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't derank the bot!`,
            color: Merlin.config.color,
            footer: {text: message.guild.name, iconURL: message.guild.iconURL() || undefined},
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.user.id) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't derank yourself!`,
            color: Merlin.config.color,
            footer: {text: message.guild.name, iconURL: message.guild.iconURL() || undefined},
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    if (member?.id === message.guild.ownerID) return message.createMessage({
        embeds: [{
            title: `<:forge_yes:1169596233338327082> You can't derank server creator!`,
            color: Merlin.config.color,
            footer: {text: message.guild.name, iconURL: message.guild.iconURL() || undefined},
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
            footer: {text: message.guild.name, iconURL: message.guild.iconURL() || undefined},
            timestamp: new Date().toISOString(),
        }], flags: 64
    });
    const size = member?.roles.length;
    member?.edit({ roles: [] }).finally(async () => {
        await message.createMessage({ content: `<:forge_yes:1169596233338327082> Removed ${size} role(s) to ${user?.username}` })
    })
}