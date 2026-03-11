import { Client, GatewayIntentBits, type Message } from '../../src/index.js';

const client = new Client({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.GUILDS,
    GatewayIntentBits.GUILD_MESSAGES,
  ],
});

client.on('ready', () => {
  console.log(`Client is ready`);
  console.log(`Bot uptime: ${client.uptime}ms`);
});

client.on('messageCreate', (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  if (message.content === 'ping') {
    message.reply('Pong!');
  }
  
  if (message.content === 'info') {
    message.reply(`Bot Uptime: ${client.uptime}ms`);
  }
});

client.login().catch(console.error);
