export async function updateAvatar(token: string, newImageURL: string): Promise<void> {
    const endpoint = "https://discord.com/api/v9/users/@me";
    const body = JSON.stringify({ avatar: newImageURL });

    try {
        const response = await fetch(endpoint, {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: body,
        });

        console.log(await response.json())

        if (!response.ok) {
            throw new Error(`Failed to change the bot's profile picture. Status: ${response.status} - ${response.statusText}`);
        }

    } catch (error) {

        console.log(error)
    }
}

