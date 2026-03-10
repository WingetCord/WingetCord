# WingetCord API Reference

This guide provides everything you need to build advanced Discord bots using WingetCord without needing access to the source code.

## 1. Client Initialization
The `Client` class is the heart of your bot.

```typescript
import { Client } from '@wingetcord/wingetcord';

const client = new Client({
  token: 'YOUR_BOT_TOKEN',
  intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
});

client.login();
```

## 2. REST Manager (`client.rest`)
WingetCord uses a modular REST system. Each category of the Discord API has its own handler.

- **Channels**: `client.rest.channels.sendMessage(channelId, data)`
- **Guilds**: `client.rest.guilds.getGuild(guildId)`
- **Users**: `client.rest.users.getUser(userId)`
- **Webhooks**: `client.rest.webhooks.executeWebhook(id, token, data)`

## 3. Interaction System (`client.interactions`)
Handle Slash Commands and Components (Buttons, Menus).

### Event: `command`
```typescript
client.interactions.on('command', async (interaction) => {
  if (interaction.data.name === 'ping') {
    await client.interactions.acknowledge(interaction, 4);
  }
});
```

### Collectors
Collectors are for multi-step interactions. They automatically clean up once finished.
```typescript
const collector = client.interactions.createCollector({
  filter: (m) => m.author.id === userId,
  time: 60000
});
```

## 4. Voice & Audio (`client.voice`)
Join voice channels and play high-quality audio.

```typescript
await client.voice.join(guildId, channelId);
const player = new AudioPlayer();
player.play({ title: 'Song Name', url: '...' });
```

## 5. Security & Validation (`Validator`)
Use the built-in validator to sanitize inputs.
```typescript
import { Validator } from '@wingetcord/wingetcord';
const cleanString = Validator.sanitize(userInput);
```
