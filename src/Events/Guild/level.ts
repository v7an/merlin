import { Message } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import math from "mathjs"
import { NiveauConfig } from "../../Types/NiveauConfig";
import { UserLevel } from "../../Types/UserLevel";
export const name: string = "messageCreate";

export async function execute(Merlin: Merlin, message: Message) {
    if (!message.guild || !message.channel) return;
    const niveaux: NiveauConfig = await Merlin.database?.get(`${message.guild.id}_niveaux`) || { message: undefined };
    const userLevel: UserLevel = await Merlin.database?.get(`${message.guild.id}_${message.author.id}_levels`) || {
        guildId: message.guild.id,
        xp: 0,
        allXp: 0,
        messages: 0,
        level: 0,
        lastMessage: Date.now(),
        firstMessage: Date.now(),
        requiredExp: 0
    }

    userLevel.messages = userLevel.messages + 1
    const randomNumber = Math.random();
    const toAdd: number = Math.floor(randomNumber * (15 - 7 + 1)) + 7;
    const xpNeeded: number = userLevel.level * 100 + 100
    userLevel.xp = userLevel.xp + toAdd
    userLevel.allXp = userLevel.allXp + toAdd

    if (userLevel.xp >= xpNeeded) {
        while (userLevel.xp >= userLevel.requiredExp) {
            userLevel.xp -= userLevel.requiredExp;
            userLevel.requiredExp = Math.floor(userLevel.requiredExp * niveaux.levelMultiplier);
            userLevel.level++;
        }
    }

    await Merlin.database?.set(`levels_${message.guild.id}_${message.author.id}`, userLevel)
    //console.log(userLevel)
}
