import { initializeClient } from "./src/Utils/Client/initializeClient";
process.on("uncaughtException", (e) => {
    console.log(e)
})
initializeClient("Merlin")
