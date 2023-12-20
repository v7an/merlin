import { ApplicationCommandOptionBase } from "oceanic.js";

export interface Command { 
    name: string,
    update?: boolean,
    perm: number,
    execute: Function,
    slashCommand: ApplicationCommandOptionBase,
    permissions?: string[]
}