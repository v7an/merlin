import fs from "fs";
import { Command } from "../../Types/Command";

export function registerClientCommands(): Map<string, Function> {
    const CommandsCategorys: string[] = fs.readdirSync("./src/Commands") 
    const Commands: Command[][] = CommandsCategorys.map((CommandCategory: string) => {
        const CommandsArray: Command[] = fs.readdirSync(`./src/Commands/${CommandCategory}`)
        .map((Command: string) => {
            return require(`../../Commands/${CommandCategory}/${Command}`)
        });

        return CommandsArray
    });


    const commands: Map<string, Function> = new Map(Commands.flat().map((command) => [command.name, command.execute]));

    return commands
}