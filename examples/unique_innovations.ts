import { Client, ButtonBuilder, ButtonStyle, ActionRowBuilder } from '../src/index.js';
import 'dotenv/config';

const client = new Client({
    token: process.env.TOKEN!,
    intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
});

// 1. Unique Feature: Native Middleware
client.use(async (ctx, next) => {
    if (ctx.event === 'MESSAGE_CREATE') {
        console.log(`[Middleware] Message from ${ctx.data.author.username}: ${ctx.data.content}`);
    }
    await next(); // Proceed to next middleware or events
});

// 2. Unique Feature: Reactive Store
client.on('READY', (user) => {
    client.store.botStartedAt = Date.now();
    client.store.commandCount = 0;
    console.log(`🚀 Store initialized. Bot started at: ${client.store.botStartedAt}`);
});

// Listen for store changes reactively (Internal emitter exposed via Proxies isn't direct, but we can wrap it)
// For this demo, we'll just show usage in commands.

client.on('MESSAGE_CREATE', async (message) => {
    if (message.content === '!stats') {
        await client.rest.channels.sendMessage(message.channel_id, {
            content: `📊 **Bot Stats**\n- Started: <t:${Math.floor(client.store.botStartedAt / 1000)}:R>\n- Commands Processed: ${client.store.commandCount}`
        });
    }

    if (message.content === '!unique') {
        client.store.commandCount++;

        // 3. Unique Feature: Inline Callbacks (No more manual collectors or customId handling!)
        const btn = new ButtonBuilder()
            .setLabel('Click Me')
            .setStyle(ButtonStyle.Primary)
            .onAction(async (i) => {
                await i.reply({ content: '✅ This was handled by an **Inline Callback**! No CustomId needed.', ephemeral: true });
            });

        const row = new ActionRowBuilder().addComponents(btn);

        await client.rest.channels.sendMessage(message.channel_id, {
            content: 'WingetCord Innovations Demo:',
            components: [row]
        });
    }
});

client.login();
