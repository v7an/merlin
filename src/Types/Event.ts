import { ClientEvents } from "oceanic.js";

export interface Event { 
    name: keyof ClientEvents,
    prefixOnly?: boolean,
    execute: Function
}