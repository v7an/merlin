import { AnyGuildChannel, AnyTextableGuildChannel, Message, TextableChannel } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { CreateMessageOptions } from "oceanic.js";
import { MessageOptions } from "child_process";
import { getCommands } from "../../Utils/Client/getCommands";
import { Command } from "../../Types/Command";

export const name: string = "messageCreate";

export const prefixOnly: boolean = true

export async function execute(Merlin: Merlin, message: Message) {
    if (!message.guildID) return;
    const prefix: string = Merlin.config.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const contentWithoutPrefix: string = message.content.slice(prefix.length).trim();
    const [command, ...args]: string[] = contentWithoutPrefix.split(/\s+/);
    const cmd = Merlin?.commands?.get(command);
    if (!cmd) return;

    const cm: Command | undefined = Array.from(getCommands().values()).find((x) => x.name == command)
    const guild = Merlin.guilds.get(message.guildID || "")
    const messageChannel = guild?.channels.get(message.channelID)

    if (!Merlin.config.buyer.includes(message.author.id)) {
        const commandData = (await Merlin.database?.get("commands_" + guild?.id) || []).find((x: any) => x.command == cm?.name)
        let permsData = (await Merlin.database?.get("perms_" + guild?.id) || []) // [{ perm: Number, roles: [String], members: [String]}, {}...}]
        permsData = permsData.filter((x: any) => commandData?.perms.includes(x.perm)).filter((x: any) => x.members.includes(message.author.id) || x.roles.some(() => message.member?.roles.includes(x))) // Returns filtered permsData

        if (commandData && !commandData.perms.includes(1)) {

            if (!commandData.perms.includes(1)) {
                if (!(permsData.length > 0)) return message.channel?.createMessage({ content: "You do not have permission", flags: 64 })

            }
        } else if (cm?.perm != 1) {
            return message.channel?.createMessage({ content: "You do not have permission", flags: 64 })
        }
    }

    try {

        cmd(Merlin, { ...message, guild: guild, channel: messageChannel, user: message.author, createMessage: (messageOptions: MessageOptions) => message.channel?.createMessage({ ...messageOptions, messageReference: { messageID: message.id } }) }, args);
    } catch (e) {
        console.log(e)
        message.channel?.createMessage({ content: "An error occurred while executing the command.", messageReference: { messageID: message.id } });
    }
}
