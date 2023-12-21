import { GuildCommandInteraction, ApplicationCommandOptionBase, GuildComponentSelectMenuInteraction, Message, Guild, Role, User } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import { InteractionCollector } from "oceanic-collectors";

export const name: string = "permissions";

export const perm: number = 5;

export const slashCommand: ApplicationCommandOptionBase = { name: "permissions", description: "Manage guild's permissions", type: 1 };

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    let perms = (await Merlin.database?.get("perms_" + message.guild.id)) || [{ perm: 1, members: [], roles: [] }];
    let msg: any = await message.createMessage({ content: "🪄 Thinking..." })
    if (msg == undefined) {
        msg = await message.getOriginal()
    }
    async function firstEmbed() {
        await msg.edit({
            content: "",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            customID: "perms",
                            placeholder: "Select the permissions to modify",
                            options: perms.map((x: any) => ({
                                label: x.perm == 1 ? "Permission 1 (Public)" : `${x.perm}`,
                                value: `${x.perm}`,
                                emoji: {
                                    id: "1169596221162258482",
                                },
                            })),
                        },
                    ],
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: { id: "1169596208944267285" },
                            style: 3,
                            disabled: perms.length == 25,
                            customID: "create",
                        },
                        {
                            type: 2,
                            emoji: { id: "1170427475348693164" },
                            style: 2,
                            disabled: perms.length == 1,
                            customID: "reset",
                        },
                        {
                            type: 2,
                            emoji: { id: "1169596239730462720" },
                            style: 4,
                            disabled: perms.length == 1,
                            customID: "delete",
                        },
                        {
                            type: 2,
                            label: "Automatic Setup",
                            emoji: { id: "1169596246890119169" },
                            style: 2,
                            customID: "autoconfig",
                        },
                    ],
                },
            ],
        });
    }
    firstEmbed()
    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 30000,
    });

    collector.on("collect", async (interaction: any) => {
        let perm = interaction.message.components[0].components[0].options.find((x: any) => x.default)?.value;
        perms = (await Merlin.database?.get("perms_" + message.guild.id)) || [{ perm: 1, members: [], roles: [] }];

        switch (interaction.data.customID) {
            case "rolesPerm":
                interaction.deferUpdate();
                perms.find((x: any) => x.perm == perm).roles = interaction.data.values.raw;
                await Merlin.database?.set("perms_" + message.guild.id, perms);

                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == perm), message.guild);
                break;

            case "membersPerm":
                interaction.deferUpdate();
                perms.find((x: any) => x.perm == perm).members = interaction.data.values.raw;
                await Merlin.database?.set("perms_" + message.guild.id, perms);

                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == perm), message.guild);
                break;

            case "autoconfig":
                interaction.deferUpdate();
                perms = [
                    { perm: 1, members: [], roles: [] },
                    { perm: "Permission 2 (Moderator)", members: [], roles: [] },
                    { perm: "Permission 3 (Administrator)", members: [], roles: [] },
                    { perm: "Permission 4 (Whitelist)", members: [], roles: [] },
                    { perm: "Permission 5 (Owner)", members: [], roles: [] },
                    { perm: "Permission 6 (Destructive Owner)", members: [], roles: [] },
                ];

                await Merlin.database?.set("perms_" + message.guild.id, perms);
                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == 1), message.guild);
                break;

            case "reset":
                interaction.deferUpdate();

                await Merlin.database?.delete("perms_" + message.guild.id);

                perms = [{ perm: 1, members: [], roles: [] }];
                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == 1), message.guild);
                break;

            case "permsDelete":
                interaction.deferUpdate();
                perms = perms.filter((x: any) => x.perm != interaction.data.values.raw[0]);

                await Merlin.database?.set("perms_" + message.guild.id, perms);
                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == 1), message.guild);
                break;

            case "delete":
                interaction.deferUpdate();

                msg.edit({
                    content: "Select the permission to remove",
                    embeds: [],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customID: "permsDelete",
                                    options: perms.filter((x: any) => x.perm != 1).map((x: any) => ({
                                        label: x.perm == 1 ? "1 (Public)" : x.perm,
                                        value: `${x.perm}`,
                                        emoji: { name: "➖" },
                                    })),
                                },
                            ],
                        },
                    ],
                });

                break;

            case "createModal":
                let newPerm: any;

                if (perms.find((x: any) => x.perm == interaction.data.components[0].components[0].value)) {
                    await interaction.createMessage({ content: "A permission already exists with that name.", flags: 64 });
                } else {
                    interaction.deferUpdate();
                    newPerm = { perm: interaction.data.components[0].components[0].value, members: [], roles: [] };
                    perms.push(newPerm);

                    await Merlin.database?.set("perms_" + message.guild.id, perms);
                }

                msg = await updateEmbed(Merlin, msg, perms, newPerm, message.guild);
                break;

            case "create":
                let modal = {
                    title: "New permission",
                    customID: "createModal",
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 4,
                                    maxLength: 15,
                                    customID: "permName",
                                    label: "Name of new permission",
                                    style: 1,
                                },
                            ],
                        },
                    ],
                };

                await interaction.createModal(modal);
                break;

            case "perms":
                interaction.deferUpdate();

                msg = await updateEmbed(Merlin, msg, perms, perms.find((x: any) => x.perm == interaction.data.values.raw[0]), message.guild);
                break;
        }
    });
}

async function updateEmbed(
    Merlin: Merlin,
    msg: Message,
    perms: { perm: string; members: string[]; roles: string[] }[],
    perm: { perm: string; members: string[]; roles: string[] },
    guild: Guild
): Promise<Message> {
    let compo: any[] = [
        {
            type: 1,
            components: [
                {
                    type: 3,
                    customID: "perms",
                    options: perms.map((x: any) => ({
                        label: x.perm == "1" ? "Permission 1 (Public)" : x.perm,
                        value: `${x.perm}`,
                        default: x.perm == perm.perm,
                        emoji: {
                            id: "1169596221162258482",
                        },
                    })),
                },
            ],
        },
    ];

    if (perm.perm !== "1") {
        compo.push({
            type: 1,
            components: [
                {
                    type: 6,
                    customID: "rolesPerm",
                    maxValues: guild.roles.size > 25 ? 25 : guild.roles.size,
                },
            ],
        },
            {
                type: 1,
                components: [
                    {
                        type: 5,
                        customID: "membersPerm",
                        maxValues: guild.members.size > 25 ? 25 : guild.members.size,
                    },
                ],
            });
    }

    compo.push({
        type: 1,
        components: [
            {
                type: 2,
                emoji: { id: "1169596208944267285" },
                style: 3,
                disabled: perms.length == 25,
                customID: "create",
            },
            {
                type: 2,
                emoji: { id: "1170427475348693164" },
                style: 2,
                disabled: perms.length == 1,
                customID: "reset",
            },
            {
                type: 2,
                emoji: { id: "1169596239730462720" },
                style: 4,
                disabled: perms.length == 1,
                customID: "delete",
            },
            {
                type: 2,
                label: "Automatic Setup",
                emoji: { id: "1169596246890119169" },
                style: 2,
                customID: "autoconfig",
            },
        ],
    });

    return await msg.edit({
        content: "",
        embeds: [
            {
                color: Merlin.config.color,
                author: { name: Merlin.user.tag + " - Configuration of permission", iconURL: Merlin.user.avatarURL() },
                footer: { text: guild.name, iconURL: guild?.iconURL() || undefined },
                description: `**Name of the permission: ${perm.perm}**
                 \`\`\`Allowed role(s):\n${perm.perm == "1" ? "・@everyone" : perm.roles.map((x: any) => `・${guild.roles.get(x)?.name} (ID: ${x})`).join("\n")
                    }\`\`\` \`\`\`Allowed user(s):\n${perm.perm == "1" ? "・Everyone" : perm.members.map((x: any) => `・${Merlin.users.get(x)?.username} (ID: ${x})`).join("\n")
                    }\`\`\``,
                timestamp: new Date().toISOString(),
                thumbnail: { url: guild.iconURL() || "" },
            },
        ],
        components: compo,
    });
}
    