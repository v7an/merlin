export interface UserLevel {
    guildId: string | undefined,
    xp: number,
    allXp: number,
    messages: number,
    level: number,
    lastMessage: number,
    requiredExp: number,

}