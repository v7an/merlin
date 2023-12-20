import { Merlin } from "../../Types/ExtendedClient";

export const name: string = "ready";

export async function execute(Merlin: Merlin) {
    setInterval(async () => {

        Merlin?.guilds.forEach(async (guild) => {
            const counters = await Merlin.database?.get(`${guild.id}_counters`);
            if (counters) {
                await guild.fetchMembers();

                for (const key of Object.keys(counters).filter((k) => counters[k].channel)) {
                    const counter = counters[key];
                    let count;

                    switch (key) {
                        case "members":
                            count = guild?.memberCount;
                            break;
                        case "bots":
                            count = guild?.members.filter((member) => member.user.bot).length;
                            break;
                        case "online":
                            count = guild?.members.filter((x) => x.presence && x.presence?.status !== "offline").length;
                            break;
                        case "offline":
                            count = guild?.members.filter((x) => !x.presence || x.presence?.status === "offline").length;
                            break;
                        case "boosts":
                            count = guild?.premiumSubscriptionCount;
                            break;
                        case "voice":
                            count = guild?.members.filter((member) => member.voiceState).length;
                            break;
                    }
                    const channel = guild?.channels.get(counter.channel);
                    if (channel) {
                        if (channel.name !== `${counter.name.replace("?count", count?.toString())}`)
                            await channel.edit({ name: `${counter.name.replace("?count", count?.toString())}` });
                    }
                }
            }
        });
    }, 3000);
}
