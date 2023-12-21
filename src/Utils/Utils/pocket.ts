import fs from 'fs/promises';
import sqlite3 from 'sqlite3';

interface PocketOptions {
    path: string;
    useJson: boolean;
}

export class Pocket {
    path: string;
    useJson: boolean;
    jsonPath: string = '';
    db: sqlite3.Database | undefined;
    jsonDatabase: Map<string, any> = new Map();

    constructor(options: PocketOptions) {
        if (!options.path) {
            throw new Error('Invalid Path');
        }
        this.path = options.path;
        this.useJson = options.useJson;

        if (this.useJson) {
            this.jsonPath = this.path + '.json';
            this.loadFromJson();
        } else {
            this.db = new sqlite3.Database(this.path + '.db', (err: Error | null) => {
                if (err) {
                    console.error('Database opening error:', err.message);
                } else {
                    this.db?.run('CREATE TABLE IF NOT EXISTS data (key TEXT, value TEXT)');
                }
            });
        }
    }

    async loadFromJson() {
        try {
            const data = await fs.readFile(this.jsonPath, 'utf8');
            this.jsonDatabase = new Map(JSON.parse(data));
        } catch (error) {
            this.jsonDatabase = new Map();
            await this.saveToJson();
        }
    }

    async saveToJson() {
        await fs.writeFile(this.jsonPath, JSON.stringify([...this.jsonDatabase]));
    }

    async get(key?: string): Promise<any> {
        if (this.useJson) {
            if (!key) {
                return this.jsonDatabase;
            }
            return this.jsonDatabase.get(key) || null;
        } else {
            const v = await this.getFromSQLite(key!)
            
            return await v?.length ? JSON.parse(v) : v;
        }
    }

    async getFromSQLite(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db?.get('SELECT value FROM data WHERE key=?', [key], (err, row: { value: any }) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.value : null);
                }
            });
        });
    }    

    async delete(key: string) {
        if (this.useJson) {
            this.jsonDatabase.delete(key);
            await this.saveToJson();
        } else {
            this.db?.run('DELETE FROM data WHERE key=?', key);
        }
    }

    async set(key: string, value: any) {
        if (this.useJson) {
            this.jsonDatabase.set(key, value);
            await this.saveToJson();
        } else {
            this.db?.run('INSERT OR REPLACE INTO data (key, value) VALUES (?, ?)', [key, (value?.length ? JSON.stringify(value) : value)]);
        }
    }

    async push(key: string, value: any) {
        if (this.useJson) {
            let arr = this.jsonDatabase.get(key) || [];
            arr.push(value);
            this.jsonDatabase.set(key, arr);
            await this.saveToJson();
        } else {
            this.getFromSQLite(key).then((existingValues: any) => {
                const arr = JSON.parse(existingValues as string) || [];
                arr.push(value);
                this.set(key, JSON.stringify(arr));
            });
        }
    }

    async pop(key: string, value: any) {
        if (this.useJson) {
            let arr = this.jsonDatabase.get(key) || [];
            arr.pop(value);
            this.jsonDatabase.set(key, arr);
            await this.saveToJson();
        } else {
            this.getFromSQLite(key).then((existingValues: any) => {
                const arr = JSON.parse(existingValues as string) || [];
                arr.pop(value);
                this.set(key, JSON.stringify(arr));
            });
        }
    }
}
