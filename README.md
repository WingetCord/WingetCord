# 💎 WingetCord

A high-performance TypeScript Discord framework.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://www.npmjs.com/package/@wingetcord/wingetcord)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

## Install

```bash
npm install @wingetcord/wingetcord
```

## Quick Start

```typescript
import { Client, Intents } from '@wingetcord/wingetcord';

const client = new Client({
    token: 'YOUR_BOT_TOKEN',
    intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
});

client.onReady((user) => {
    console.log(`Logged in as ${user.tag}`);
});

client.onMessage(async (msg) => {
    if (msg.content === '!ping') {
        await msg.reply('Pong!');
    }
});

client.connect();
```

## Features

- ⚡ Fast REST with `undici` connection pooling
- 🛡️ Resilient Gateway with auto-reconnect
- 💎 Expressive fluent API
- 🧩 Zero-config command & event handlers
- 🔌 Plugin system
- 📦 Built-in caching (LRU, LFU, TTL)

## Links

- [Documentation](https://wingetcord.github.io/WingetCord/)
- [Discord](https://discord.gg/wingetcord)
- [GitHub](https://github.com/wingetcord/WingetCord)
