import fetch from 'node-fetch';

export async function imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        return base64;
    } catch (error) {
        console.error('Error fetching the image:', error);
        throw error;
    }
}

