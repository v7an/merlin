import { GuildComponentInteraction, Member, TextChannel, MessageActionRow } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import Canvas from "canvas";
import { InteractionCollector } from "oceanic-collectors";
export const name: string = "guildMemberAdd";

export async function execute(Merlin: Merlin, member: Member) {
    const captcha = await Merlin.database?.get(`${member.guild.id}_captcha`) || { channelId: null, roleId: null };
    if (captcha) {
        const channel = member?.guild.channels.get(captcha.channelId[0]);
        function generateCaptcha() {
            let text = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 5; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage("https://media.discordapp.net/attachments/1146062748527099965/1186703082265006162/captcha_merlin.jpg", { format: "jpg" });
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        let captchaText = generateCaptcha();
        ctx.textAlign = "center";
        ctx.font = "100px Uni Sans Heavy";
        ctx.fillStyle = "#ffffff";

        ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2 + 20)
        let fake1 = generateCaptcha();
        let fake2 = generateCaptcha();
        const buttons = {
            type: 1,
            components: [
                { type: 2, style: 1, label: fake1, customID: fake1 },
                { type: 2, style: 1, label: fake2, customID: fake2 },
                { type: 2, style: 1, label: captchaText, customID: captchaText }
            ]
        }
        buttons.components.sort(() => Math.random() - 0.5);
        const message = await (channel as TextChannel)?.createMessage({
            content: `Welcome to ${member.guild.name}, ${member.user.mention}! Please verify by clicking the button with the correct text.`, components: [buttons], files: [{ contents: canvas.toBuffer(), name: "image.png" }]
        })
        const collector = new InteractionCollector(Merlin, {
            filter: (interaction: GuildComponentInteraction) => interaction.user.id === member?.user.id,
            message: message,
            time: 30000
        });
        collector.on("collect", async (collected: GuildComponentInteraction) => {
            collected.deferUpdate();
            message.delete();
            if (collected.data.customID === captchaText) {
                if (member.guild.roles.get(captcha.roleId)) {
                    await member.addRole(captcha.roleId).catch((e) => { })
                }
            } else {
                member.kick();
            }
        });
    }

}
