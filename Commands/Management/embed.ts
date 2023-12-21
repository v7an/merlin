import {
    GuildCommandInteraction,
    ApplicationCommandOptionBase,
    GuildComponentSelectMenuInteraction,
    Message,
    Guild,
    Role,
    User,
    Embed,
    MessageActionRow,
    SelectMenuComponent,
    ComponentTypes,
    StringSelectMenu,
    Component,
    MessageComponent,
    ButtonComponent,
    ButtonStyles
} from "oceanic.js";
import {Merlin} from "../../Types/ExtendedClient";
import {InteractionCollector} from "oceanic-collectors";

export const name: string = "embed";

export const perm: number = 4;

export const slashCommand: ApplicationCommandOptionBase = {name: "embed", description: "Builds an embed", type: 1};

export const update: Boolean = false;

export async function execute(Merlin: Merlin, message: GuildCommandInteraction, args: string[]): Promise<void> {
    let msg: any = await message.createMessage({content: "🪄 Thinking..."})
    if (msg == undefined) {
        msg = await message.getOriginal()
    }

    const selectMenu: StringSelectMenu = {
        type: ComponentTypes.STRING_SELECT,
        customID: "selectMenu",
        options: [
            {label: "Title", emoji: {name: "✏️"}, value: "title"},
            {label: "Description", emoji: {name: "📝"}, value: "description"},
            {label: "Author", emoji: {name: "👤"}, value: "author"},
            {label: "Footer", emoji: {name: "👣"}, value: "footer"},
            {label: "Image", emoji: {name: "🖼️"}, value: "image"},
            {label: "Thumbnail", emoji: {name: "🖼️"}, value: "thumbnail"},
            {label: "Color", emoji: {name: "🎨"}, value: "color"},
            {label: "Add a field", emoji: {name: "➕"}, value: "add"},
            {label: "Edit a field", emoji: {name: "✏️"}, value: "edit"},
            {label: "Delete a field", emoji: {name: "❌"}, value: "delete"},
            {label: "Add current timestamp", emoji: {name: "🕐"}, value: "timestamp"},
        ]
    }

    const buttons: ButtonComponent[] = [
        {
            label: "Copy an embed",
            emoji: {id: "1169596213520257064"},
            style: ButtonStyles.SECONDARY,
            customID: "copy",
            type: ComponentTypes.BUTTON
        },
        {
            label: "Send embed",
            emoji: {id: "1169596218347900938"},
            style: ButtonStyles.SUCCESS,
            customID: "send",
            type: ComponentTypes.BUTTON
        }
    ]

    const buttonsActionRow: MessageActionRow = {
        type: ComponentTypes.ACTION_ROW,
        components: buttons as MessageComponent[]
    }


    const actionRow: MessageActionRow = {
        type: ComponentTypes.ACTION_ROW,
        components: [selectMenu as MessageComponent]
    }


    let title = {
        color: Merlin.config.color,
        author: {
            name: "",
            iconURL: "https://media.discordapp.net/attachments/1169411663645122650/1170457088955260968/1169596246890119169.png?ex=65591c1c&is=6546a71c&hm=809ced12e959ef6f7f666d46bdfc7a6ac19c9cbb3606baf15b5678302f843a82&="
        }
    }


    let embed: any = {
        description: "** **",
        author: {},
        footer: {},
        thumbnail: {},
        image: {},
        fields: []
    }

    let copyEmbed: any = JSON.parse(JSON.stringify(embed))

    updateEmbed(embed)

    const collector = new InteractionCollector(Merlin, {
        filter: (interaction: GuildComponentSelectMenuInteraction) => interaction.user.id === message?.user.id,
        message: msg,
        time: 300000
    });

    collector.on("collect", async (interaction: GuildComponentSelectMenuInteraction) => {
        if (interaction.data.values.raw[0] != "cancel") {
            copyEmbed = JSON.parse(JSON.stringify(embed))
        }

        switch (interaction.data.values.raw[0]) {
            case "title":
                interaction.deferUpdate();

                title.author.name = `Please provide a title.`
                await msg.edit({content: "", embeds: [title], components: []});
                const titleMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                titleMessage.delete()
                embed.title = titleMessage.content
                title.author.name = `Please provide a title link (Answer with \`skip\` if none).`
                await msg.edit({content: "", embeds: [title], components: []});

                const titleLinkMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                embed.url = (titleLinkMessage.content == "skip" ? "" : titleLinkMessage.content)
                titleLinkMessage.delete()


                updateEmbed(embed)
                break;

            case "description":
                interaction.deferUpdate();

                title.author.name = `Please provide a description.`
                await msg.edit({content: "", embeds: [title], components: []});
                const descMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                descMessage.delete()
                embed.description = descMessage.content
                updateEmbed(embed)
                break;

            case "author":
                interaction.deferUpdate();

                title.author.name = `Please provide an author name.`
                await msg.edit({content: "", embeds: [title], components: []});
                const authorMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                authorMessage.delete()
                embed.author.name = authorMessage.content

                title.author.name = `Please provide an author icon (Answer with \`skip\` if none).`
                await msg.edit({content: "", embeds: [title], components: []});
                const authorIconMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                embed.author.iconURL = (authorIconMessage.content == "skip" ? "" : (authorIconMessage.attachments.first()?.url || authorIconMessage.content))
                authorIconMessage.delete()


                updateEmbed(embed)
                break;

            case "footer":
                interaction.deferUpdate();

                title.author.name = `Please provide a footer name.`
                await msg.edit({content: "", embeds: [title], components: []});
                const footerMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                footerMessage.delete()
                embed.footer.text = footerMessage.content

                title.author.name = `Please provide a footer icon (Answer with \`skip\` if none).`
                await msg.edit({content: "", embeds: [title], components: []});
                const footerIconMessage: Message = await Merlin.awaitReply(msg.channel, message.user)

                embed.footer.iconURL = (footerIconMessage.content == "skip" ? "" : (footerIconMessage.attachments.first()?.url || footerIconMessage.content))

                footerIconMessage.delete()


                updateEmbed(embed)
                break;

            case "image":
                interaction.deferUpdate();

                title.author.name = `Please provide an image`
                await msg.edit({content: "", embeds: [title], components: []});
                const IconMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                embed.image = IconMessage.attachments.first()?.url || IconMessage.content
                IconMessage.delete()


                updateEmbed(embed)
                break;

            case "thumbnail":
                interaction.deferUpdate();

                title.author.name = `Please provide a thumbnail`
                await msg.edit({content: "", embeds: [title], components: []});
                const ThMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                embed.thumbnail = (ThMessage.attachments.first()?.url || ThMessage.content)
                ThMessage.delete()


                updateEmbed(embed)
                break;

            case "color":
                interaction.deferUpdate();

                title.author.name = `Please provide a color.`
                await msg.edit({content: "", embeds: [title], components: []});
                const colorMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                colorMessage.delete()
                embed.color = parseInt(colorMessage.content?.replace("#", ""), 16)


                updateEmbed(embed)
                break;

            case "add":
                interaction.deferUpdate();

                title.author.name = `Please provide a field name.`
                await msg.edit({content: "", embeds: [title], components: []});
                const fieldMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                fieldMessage.delete()

                title.author.name = `Please provide a field value.`
                await msg.edit({content: "", embeds: [title], components: []});
                const fieldValue: Message = await Merlin.awaitReply(msg.channel, message.user)
                fieldValue.delete()

                embed.fields.push({
                    name: fieldMessage.content,
                    value: fieldValue.content
                })
                updateEmbed(embed)
                break;
            case "edit":
                interaction.deferUpdate();
                if (!embed.fields) return

                title.author.name = `Please provide a field name.`
                await msg.edit({content: "", embeds: [title], components: []});
                const fieldName: Message = await Merlin.awaitReply(msg.channel, message.user)
                fieldName.delete()
                let fieldEdit = embed.fields.find((x: { name: string, value: string }) => x.name == fieldName.content)
                if (!fieldEdit) {
                    title.author.name = `Invalid field name !`
                    await msg.edit({content: "", embeds: [title], components: []});

                    setTimeout(() => {
                        updateEmbed(embed)
                    }, 3000);
                } else {
                    title.author.name = `Please provide a new field name.`
                    await msg.edit({content: "", embeds: [title], components: []});
                    const fieldMessage: Message = await Merlin.awaitReply(msg.channel, message.user)
                    fieldMessage.delete()

                    title.author.name = `Please provide a new field value.`
                    await msg.edit({content: "", embeds: [title], components: []});
                    const fieldValue: Message = await Merlin.awaitReply(msg.channel, message.user)
                    fieldValue.delete()

                    embed.fields[embed.fields.indexOf(fieldEdit?.length ? fieldEdit[0] : fieldEdit)] = {
                        name: fieldMessage.content,
                        value: fieldValue.content
                    }
                    updateEmbed(embed)
                }
                break;
            case "delete":
                interaction.deferUpdate();
                if (!embed.fields) return

                title.author.name = `Please provide a field name.`
                await msg.edit({content: "", embeds: [title], components: []});
                const removeFieldName: Message = await Merlin.awaitReply(msg.channel, message.user)
                removeFieldName.delete()
                let removeFieldEdit = embed.fields.find((x: {
                    name: string,
                    value: string
                }) => x.name == removeFieldName.content)
                if (!removeFieldEdit) {
                    title.author.name = `Invalid field name !`
                    await msg.edit({content: "", embeds: [title], components: []});

                    setTimeout(() => {
                        updateEmbed(embed)
                    }, 3000);
                } else {
                    embed.fields = embed.fields.filter((field: any) => field.name !== removeFieldName.content)
                    updateEmbed(embed)
                }
                break;
            case "timestamp":
                interaction.deferUpdate();
                embed.timestamp = new Date().toISOString()

                updateEmbed(embed)
                break;

            case "cancel":
                interaction.deferUpdate();

                updateEmbed(copyEmbed)
                break;
            case "send":
                interaction.deferUpdate();

                const menu = {
                    type: 1,
                    components: [
                        {
                            channelType: [0, 5],
                            customID: "selectChannels",
                            disabled: false,
                            maxValue: 3,
                            minValue: 1,
                            options: [],
                            placeHolder: "Select channels",
                            type: 8
                        }
                    ]
                }
                msg.edit({embeds: [], components: [menu]})
                break;
          /*  case "selectChannels":
                interaction.deferUpdate()
                const channel = interaction.guild.channels.get(interaction.data.values.raw).send({ cont})
                break;
        */
        }

    })

    function updateEmbed(embedToEdit: Embed) {
        const cancelMenu: SelectMenuComponent = {
            type: selectMenu.type,
            customID: selectMenu.customID,
            options: [...selectMenu.options, {label: "Cancel last action", emoji: {name: "↩"}, value: "cancel"}]
        }

        const cancelActionRow: MessageActionRow = {
            type: ComponentTypes.ACTION_ROW,
            components: [cancelMenu]
        }


        msg.edit({
            content: "",
            embeds: [embedToEdit],
            components: [(copyEmbed != embed) ? cancelActionRow : actionRow, buttonsActionRow]
        })
    }
}
