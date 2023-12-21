import fs from "fs";
import { Merlin } from "../../Types/ExtendedClient";
import colors from "colors";
import { Event } from "../../Types/Event";

export function registerClientEvents(Merlin: Merlin, prefix: Boolean) {

    const EventsCategorys: string[] = fs.readdirSync("./src/Events")
    const Events: Event[][] = EventsCategorys.map((EventCategory: string) => {
        const EventsArray: Event[] = fs.readdirSync(`./src/Events/${EventCategory}`)
        .map((Event: string) => {
            return require(`../../Events/${EventCategory}/${Event}`)
        });

        return EventsArray
    });

    Events.flat().map((EventFile: Event) => {
        if (prefix && EventFile.prefixOnly || !EventFile.prefixOnly) {
            console.log(colors.blue(`[EVENT]: Registered '${EventFile.name}'`));
            Merlin.on(EventFile.name, (...args) => EventFile.execute(Merlin, ...args));
        }
    });
}