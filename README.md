# WingetCord

A high-performance, modular Discord framework in TypeScript.

## Performance
- **Optimized REST**: Persistent connection pooling and route-specific queuing.
- **Resilient Gateway**: Internal rate-limiting and robust session resume.
- **Fast Interractions**: Optimized collector system with automated cleanup.

## Getting Started

```bash
npm install github:wingetcord/WingetCord
```

```typescript
import { Client } from '@wingetcord/wingetcord';

const client = new Client({
  token: 'YOUR_TOKEN',
  intents: ['GUILDS', 'GUILD_MESSAGES']
});

client.on('READY', () => console.log('WingetCord is Ready!'));

client.login();
```

## Modular Handlers
- Users: `client.rest.users`
- Guilds: `client.rest.guilds`
- Channels: `client.rest.channels`
- Webhooks: `client.rest.webhooks`
- Commands: `client.rest.commands`
