const characters: string = "abcdefghijklmnopqrstuvwxyz1234567890";

export function generateCode(length: number): string {
    let code: string = "";

    while (code.length < length) 
        code += characters[Math.floor(Math.random() * characters.length)];

    return code;
}
