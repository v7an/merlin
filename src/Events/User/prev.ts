import { JSONUser, User } from "oceanic.js";
import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "userUpdate";

export async function execute(Merlin: Merlin, user: User, oldUser: JSONUser) {
    // Usernames
    if (user.username != oldUser.username) {
        await Merlin.database?.push(`${user.id}_usernames`, { key: oldUser.username, date: Date.now() })
    }

    // Avatars
    if (user.avatar != oldUser.avatar) {
        await Merlin.database?.push(`${user.id}_avatars`, { key: oldUser.avatar, date: Date.now() })
    }

    // Banners
    if (user.banner != oldUser.banner) {
        await Merlin.database?.push(`${user.id}_banners`, { key: oldUser.banner, date: Date.now() })
    }
}
