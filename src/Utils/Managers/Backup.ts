import { Client, ChannelTypes, Guild } from "oceanic.js";
import { readdirSync, writeFileSync, existsSync, mkdirSync, readFileSync, rmdirSync } from "fs";
import { join } from "node:path";

export class BackupManager {
    private client: Client;
    private dirname: string;
    private reason: string;

    constructor(client: Client) {
        this.client = client;
        this.dirname = join(__dirname, './backups/');
        this.reason = ""
    }

    private async reload () {
        if (!existsSync(this.dirname)) mkdirSync(this.dirname, { recursive: true });
    }
    public async save(userId: string, guildId: string, date: string, params: boolean | false, bans: boolean | false, emojis: boolean | false, roles: boolean | false, channels: boolean | false) {
        const guild = this.client.guilds.get(guildId);
        const json = JSON.stringify({
            guildId: guildId,
            guildName: guild?.name,
            time: date,
            name: params ? guild?.name : null,
            icon: params ? guild?.iconURL() : null,
            bans: bans ? await guild?.getBans() : null,
            emojis: emojis ? guild?.emojis.map((emoji) => ({
                name: emoji.name,
                url: emoji.id
            })) : null,
            roles: roles ? guild?.roles
                .filter((role) => role.name != '@everyone' && role.managed == false)
                .map((role) => ({
                    name: role.name,
                    permissions: role.permissions.json
                })) : null,
            channels: channels ? guild?.channels
                .filter((channel) => !channel.parent)
                .map((channel) => {
                    if (channel.type === ChannelTypes.GUILD_CATEGORY) {
                        return {
                            name: channel.name,
                            type: channel.type,
                            parents: guild?.channels
                                .filter((parent) => parent.parentID === channel.id)
                                .map((parent) => ({
                                    name: parent.name,
                                    type: parent.type,
                                    permissions: channel.permissionOverwrites.map((permission) => ({
                                        type: permission.type,
                                        allow: permission.allow,
                                        deny: permission.deny
                                    }))
                                }))
                        }
                    } else {
                        return {
                            name: channel.name,
                            type: channel.type,
                            permissions: channel.permissionOverwrites.map((permission) => ({
                                type: permission.type,
                                allow: permission.allow,
                                deny: permission.deny
                            }))
                        }
                    }
                }) : null
        }, null, 2);

        writeFileSync(`${this.dirname}/${userId}/${this.getNewID(userId)}.json`, json, 'utf8');
    }

    public getNewID(userId: string) {
        const userDir = join(__dirname, `${this.dirname}/${userId}`);
          
        if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });
        const size = this.getLength(userId) + 1;

       return size;
    }

    public getLength (userId: string) {
        const userDir = join(__dirname, `${this.dirname}/${userId}`);
        return existsSync(userDir) ? readdirSync(userDir).length : 0
    }

    public exists (userId: string, ID: number | string = 0) {
        const userDir = ID == 0 ? join(__dirname, `${this.dirname}/${userId}`) : join(__filename, `${this.dirname}/${userId}/${ID}`)
        return existsSync(userDir);
    }

    public async load (userId: string, ID: number | string, guild: Guild) {
        const IdDir = join(__filename, `${this.dirname}/${userId}/${ID}`)
        const data = JSON.parse(readFileSync(IdDir, 'utf8'));
        if(data.name) guild?.edit({
                name: data.name,
                reason: this.reason
            }) 
          
        if(data.icon) guild?.edit({
                icon: data.icon,
                reason: this.reason
            })
          
        if(data.roles) {
            await guild?.getRoles();
            guild?.roles.filter((c) => c.name != "@everyone" && c.managed == false)?.forEach((c) => c.delete());
            for (const role of data.roles) {
              await guild?.createRole({
                name: role.name,
                permissions: role.permissions,
                reason: this.reason,
              }).catch();
            }
          };
          if (data.channels) {
            await guild?.getChannels(); 
            guild?.channels.forEach((c) => c.delete());
            for (const channel of data.channels) {
              if (channel.type === ChannelTypes.GUILD_CATEGORY) {
                const category = await guild?.createChannel(ChannelTypes.GUILD_CATEGORY, {
                  name: channel.name,
                  reason: this.reason,
                }).catch();
                for (const parent of channel.parents) {
                  await guild?.createChannel(parent.type, {
                    name: parent.name,
                    parentID: category.id,
                    permissionOverwrites: parent.permissions,
                    reason: this.reason,
                  }).catch();
                }
              } else {
                await guild?.createChannel(channel.type, {
                  name: channel.name,
                  permissionOverwrites: channel.permissions,
                  reason: this.reason,
                }).catch();
              }
            }
          }
          if (data.bans) {
            for (const ban of data.bans) {
              await guild?.createBan(ban.user, {
                reason: this.reason
              }).catch();
            }
          }
          if (data.emojis) {
            await guild?.getEmojis();
            await guild?.emojis.clear()
            for (const emoji of data.emojis) {
              await guild?.createEmoji({
                image: emoji.url,
                name: emoji.name,
                reason: this.reason,
              }).catch();
            }
          }
    }

    public async view(userId: string, ID: string) {
        const IdDir = join(__filename, `${this.dirname}/${userId}/${ID}`)
        if(!exists(userId, ID)) return
        const data = JSON.parse(readFileSync(IdDir, 'utf8'));
        
        return data

    }

    public async delete(userId: string, ID: string) {
        const IdDir = join(__filename, `${this.dirname}/${userId}/${ID}`)
        if(!exists(userId, ID)) return true;
        
        rmdirSync(IdDir)
        return !exists(userId, ID)

    }
}