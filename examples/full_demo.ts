import { Client, EmbedBuilder, AudioPlayer, Validator } from '../src/index.js';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Full Demo: Showcasing the high-performance, refined WingetCord framework.
 * This demo covers:
 * 1. Intelligent Caching & REST
 * 2. Interaction Collectors
 * 3. Voice & Audio Player
 * 4. Security Validation
 */

const client = new Client({
  token: process.env.DISCORD_TOKEN || 'YOUR_TOKEN',
  intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT', 'GUILD_VOICE_STATES']
});

client.on('READY', (data: any) => {
  console.log(`Bot refined and ready! Logged in as ${data.user.username}`);
});

// --- 1. Message Handling with Validation ---
client.on('MESSAGE_CREATE', async (msg: any) => {
  if (msg.author.bot) return;

  // Input Sanitation
  const cleanContent = Validator.sanitize(msg.content);

  if (cleanContent === '!ping') {
    const start = Date.now();
    await client.rest.channels.sendMessage(msg.channel_id, {
      content: `Pong! Latency: ${Date.now() - start}ms`
    });
  }

  // --- 2. Advanced Interaction Collector Example ---
  if (cleanContent === '!survey') {
    const embed = new EmbedBuilder()
      .setTitle('User Survey')
      .setDescription('Please react or reply within 30 seconds.')
      .setColor('#3498db');

    await client.rest.channels.sendMessage(msg.channel_id, { embeds: [embed.toJSON()] });

    // Create a message collector for this user
    const collector = client.interactions.createCollector({
      filter: (m: any) => m.author.id === msg.author.id,
      time: 30000,
      max: 1
    });

    collector.on('collect', (m: any) => {
      console.log(`Collected input: ${m.content}`);
      client.rest.channels.sendMessage(msg.channel_id, { content: `Got it! You said: ${m.content}` });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        client.rest.channels.sendMessage(msg.channel_id, { content: 'Survey timed out.' });
      }
    });
  }

  // --- 3. Audio Player with Error Isolation ---
  if (cleanContent === '!play') {
    await client.voice.join(msg.guild_id, msg.channel_id);
    const player = new AudioPlayer();
    
    player.on('start', (track) => console.log(`Started: ${track.title}`));
    player.on('error', (err) => console.error('Playback error:', err));

    player.play({ title: 'Lo-fi Beats', url: 'https://example.com/stream' });
    
    await client.rest.channels.sendMessage(msg.channel_id, { content: '🎧 Now playing in voice channel!' });
  }
});

// --- 4. Slash Command Interaction Handling ---
client.interactions.on('command', async (interaction: any) => {
  // Always acknowledge within 3s
  await client.interactions.acknowledge(interaction.id, interaction.token, 4);

  if (interaction.data.name === 'hello') {
    await client.rest.request('POST', `/interactions/${interaction.id}/${interaction.token}/callback`, {
      type: 4,
      data: { content: `Hello ${interaction.member.user.username}!` }
    });
  }
});

client.login().catch(console.error);
