export interface NiveauConfig {
    toggle: Boolean,
    message: string | undefined,
    levelMultiplier: number,
    channelBlacklist: string[],
    usersBlacklist: string[],
}