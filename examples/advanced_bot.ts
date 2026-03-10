import { Client, IntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder, ComponentType, EmbedBuilder } from '../src/index.js';
import 'dotenv/config';

const client = new Client({
  token: process.env.TOKEN!,
  intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
});

client.on('READY', (data) => {
  console.log(`🚀 Advanced Bot is live! Logged in as ${data.user.username}`);
});

client.on('interaction', async (interaction) => {
  if (interaction.type === 2) { // Command
    const cmd = interaction.data.name;

    if (cmd === 'test_components') {
      const embed = new EmbedBuilder()
        .setTitle('WingetCord Components')
        .setDescription('Test our new Buttons and Menus!')
        .setColor('#5865f2');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('primary_btn')
            .setLabel('Click Me')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('danger_btn')
            .setLabel('Danger')
            .setStyle(ButtonStyle.Danger)
        );

      const menuRow = new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder(ComponentType.StringSelect)
            .setCustomId('test_menu')
            .setPlaceholder('Choose an option')
            .addOptions(
              { label: 'Option 1', value: '1', description: 'The first one' },
              { label: 'Option 2', value: '2', description: 'The second one' }
            )
        );

      await interaction.reply({
        embeds: [embed.toJSON()],
        components: [row.toJSON(), menuRow.toJSON()]
      });
    }
  }

  if (interaction.type === 3) { // Component
    const customId = interaction.data.custom_id;
    
    if (customId === 'primary_btn') {
      await interaction.reply({ content: 'You clicked the primary button!', ephemeral: true });
    } else if (customId === 'test_menu') {
      await interaction.update({ content: `You selected: ${interaction.data.values[0]}`, components: [] });
    }
  }
});

client.on('MESSAGE_CREATE', async (msg) => {
  if (msg.content === '!thread') {
    try {
      const thread = await client.rest.channels.createThread(msg.channel_id, {
        name: 'WingetCord Support',
        auto_archive_duration: 60,
        type: 11 // PUBLIC_THREAD
      });
      console.log(`Created thread: ${thread.name}`);
      await client.rest.channels.sendMessage(thread.id, { content: 'Welcome to the thread!' });
    } catch (err) {
      console.error('Thread creation failed:', err);
    }
  }
});

client.login();
