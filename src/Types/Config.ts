import { BotActivity, MutualStatuses } from "oceanic.js";

export interface Config {
    token: string,
    color: any,
    id: string,
    buyer: string[],
    status: MutualStatuses | "invisible",
    activity: BotActivity,
    type: "Hybrid" | "Slash" | "Prefix",
    prefix: string
}