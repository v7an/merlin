import { Merlin } from "../../Types/ExtendedClient";
import colors from "colors";

export const name: string = "ready";

export async function execute(Merlin: Merlin) {
    console.log(colors.yellow(`[BOT]: Started as ${Merlin.user.tag } (${Merlin.user.id})`));

    setInterval(() => {
        Merlin.editStatus(Merlin.config.status, [Merlin.config.activity])
    }, 30000)

}