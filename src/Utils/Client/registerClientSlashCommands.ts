import fs from "fs";
import { CreateApplicationCommandOptions } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";
import colors from "colors";

interface Command {
    name: string,
    slashCommand: CreateApplicationCommandOptions
    update: boolean | null | undefined,
    execute: Function
}

function disableUpdate(path: string) {
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
    
        const updatedData = data.replace(/export const update: Boolean = true;/g, 'export const update: Boolean = false;');
    
        fs.writeFile(path, updatedData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
        });
    });
}

export function registerClientSlashCommands(Merlin: Merlin, id: string): void {
    const CommandsCategorys: string[] = fs.readdirSync("./src/Commands") 
    const Commands: Command[][] = CommandsCategorys.map((CommandCategory: string) => {
        const CommandsArray: Command[] = fs.readdirSync(`./src/Commands/${CommandCategory}`)
        .map((Command: string) => {
            const file: Command = require(`../../Commands/${CommandCategory}/${Command}`)
            disableUpdate(`./src/Commands/${CommandCategory}/${Command}`)

            return file
        });

        return CommandsArray
    });


    Commands.flat().filter((Cmd: Command) => Cmd.update)
    .forEach((Cmd: Command) => {
        console.log(colors.red(`[SLASH]: Registered '${Cmd.name}'`));
        Merlin.rest.applicationCommands.createGlobalCommand(id, Cmd.slashCommand)
    })
}