import { GuildCommandInteraction, ApplicationCommandOptionBase, ApplicationCommandOptionsWithValue, Message, Guild, Role, User, ApplicationCommandOptions, InteractionOptionsSubCommand, ApplicationCommandOptionsSubCommand, ApplicationCommandOptionsUser, ApplicationCommandOptionsInteger } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import ms from "ms";

export const name: string = "mute";

export const perm: number = 2;

export const slashCommand: ApplicationCommandOptions = {
    name: "mute", description: "Mute a member", type: 1,
    options: [
        { name: "member", description: "Member", required: true, type: 6 },
        { name: "time", description: "Temps", required: true, type: 3 },
    ]
};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    //let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    let user = args ? message.guild.members.get(args[0]) : message.data.options.getUser('member');
    let time = message.data.options.getString('time') || "0"
    if (isNaN(ms(time))) {
        let embed = {
            color: Merlin?.config.color,
            description: "The date is invalid."
        };
        return message.createMessage({ embeds: [embed] })
    }
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
    const duration = new Date(Date.now() + ms(time)).toISOString();
    
    member?.guild.editMember(member.user.id, { communicationDisabledUntil: duration }).finally(() => {
        message.createMessage({ content: `<:forge_yes:1169596233338327082> Timeout ${user?.username} successfully` })
    })
}