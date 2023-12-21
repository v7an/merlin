import { Message } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "messageCreate";
 
export async function execute(Merlin: Merlin, message: Message) {
    const badwords: string[] = await Merlin.database?.get(`${message.guild?.id}_badwords`) || [];

    badwords.forEach((b) => {
        if(message.author.id === Merlin.user.id) return
        if(message.content.toLowerCase().replace(/\s/g, '').includes(b.toString().toLowerCase())) {
            cobst del = await message.channel?.createMessage({
                content: `${message.author.mention}, please use appropriate words !`,
                flags: 64
            })
            message.delete()
        }
    })
}