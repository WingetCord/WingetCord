# Getting Started with WingetCord

WingetCord is a high-performance TypeScript Discord framework.

## Installation

```bash
npm install @wingetcord/wingetcord
```

## Quick Start

```typescript
import { Client, GatewayIntentBits } from '@wingetcord/wingetcord';

const client = new Client({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.GUILDS,
    GatewayIntentBits.GUILD_MESSAGES,
  ],
});

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply('Pong!');
  }
});

client.login();
```

## Client Options

```typescript
interface ClientOptions {
  token: string;
  intents: number | IntentBit[];
  shardId?: number;
  shardCount?: number;
}
```

## Intents

WingetCord provides a unified `IntentBits` API:

```typescript
import { GatewayIntentBits } from '@wingetcord/wingetcord';

const intents = [
  GatewayIntentBits.GUILDS,
  GatewayIntentBits.GUILD_MESSAGES,
  GatewayIntentBits.GUILD_VOICE_STATES,
];
```

## Building Messages

```typescript
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from '@wingetcord/wingetcord';

const embed = new EmbedBuilder()
  .setTitle('Hello!')
  .setDescription('This is an embed message')
  .setColor(0x5865F2);

const button = new ButtonBuilder()
  .setLabel('Click Me')
  .setCustomId('click_me')
  .setStyle('primary');

const row = new ActionRowBuilder<ButtonBuilder>().addComponent(button);
```

## Voice & Audio

For voice features, install the optional dependencies:

```bash
npm install @discordjs/voice ffmpeg-static
```

```typescript
import { VoiceManager, AudioPlayer } from '@wingetcord/wingetcord';

const voiceManager = new VoiceManager();
const audioPlayer = new AudioPlayer({ maxQueues: 10 });
```

## Scheduling Tasks

```typescript
import { Scheduler } from '@wingetcord/wingetcord';

const scheduler = new Scheduler();

// Run every minute
scheduler.scheduleInterval(60000, async () => {
  console.log('Task executed');
});

// Run once after 5 seconds
scheduler.scheduleOnce(5000, async () => {
  console.log('One-time task');
});

// Run on cron schedule
scheduler.scheduleCron('0 * * * *', async () => {
  console.log('Hourly task');
});
```

## Decorators

```typescript
import { Command, On, Once } from '@wingetcord/wingetcord';

@On('messageCreate')
export class MessageHandler {
  execute(message: any) {
    console.log('Message received:', message.content);
  }
}

@Once('ready')
export class ReadyHandler {
  execute() {
    console.log('Bot is ready!');
  }
}
```

## Cache

```typescript
import { CacheManager, TTLCache, LRUCache } from '@wingetcord/wingetcord';

const cache = new CacheManager();

// Or use individual caches
const lru = new LRUCache<string, any>({ maxSize: 100 });
lru.set('key', 'value');
console.log(lru.get('key'));
```

## Metrics

```typescript
import { MetricsRegistry } from '@wingetcord/wingetcord';

const metrics = new MetricsRegistry();
const counter = metrics.createCounter({ name: 'messages_sent', help: 'Total messages sent' });

counter.inc();
console.log(counter.get());
```

## Next Steps

- Read the [Commands Guide](./commands.md) for slash commands
- Read the [Interactions Guide](./interactions.md) for buttons and selects
- Read the [Audio Guide](./audio.md) for voice and music features
