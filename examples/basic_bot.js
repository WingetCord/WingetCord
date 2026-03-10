import { Client } from '../src/index.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const client = new Client({
    token: process.env.DISCORD_TOKEN || 'YOUR_TOKEN_HERE',
    intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT'],
});
client.on('READY', (data) => {
    console.log('Bot is ready!', data.user.username);
});
async function run() {
    await client.commands.load(join(__dirname, 'commands'));
    await client.login();
}
run().catch(console.error);
//# sourceMappingURL=basic_bot.js.map