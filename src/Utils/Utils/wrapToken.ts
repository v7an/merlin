export async function wrapToken(token: string): Promise<boolean> {
    const url = 'https://discord.com/api/v9/users/@me';
    const headers = {
        Authorization: `Bot ${token}`,
    };

    try {
        const response = await fetch(url, { headers });
        return response.ok;
    } catch (error) {
        return false;
    }
}