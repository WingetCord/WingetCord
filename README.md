# 💎 WingetCord

**WingetCord** is a next-generation, high-performance Discord framework built for TypeScript. Designed with a focus on speed, developer experience, and expressiveness, it offers features that push the boundaries of modern bot development.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://www.npmjs.com/package/@wingetcord/wingetcord)

---

## 📦 Installation

```bash
npm install @wingetcord/wingetcord
# or
npm install github:wingetcord/WingetCord
```

---

## 🚀 Why WingetCord?

WingetCord isn't just another Discord library. It's built from the ground up to be faster and more intuitive than existing solutions.

- **⚡ Ultra-Fast REST**: Uses `undici` for persistent connection pooling and per-route queuing.
- **🛡️ Resilient Gateway**: Automatic session resume and internal packet rate limiting.
- **💎 Expressive Syntax**: Modern, fluent API that reduces boilerplate.
- **🧩 Zero-Config Handlers**: Automated command and event discovery with one line of code.

---

## 🎬 Quick Start

```typescript
import { Client, Intents } from '@wingetcord/wingetcord';

const client = new Client({
    token: 'YOUR_BOT_TOKEN',
    intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
});

client.onReady((user) => {
    console.log(`🚀 Logged in as ${user.tag}`);
});

// A simple ping command using our fluent API
client.onMessage(async (msg) => {
    if (msg.content === '!ping') {
        await msg.reply('🏓 Pong!');
    }
});

client.login();
```

---

## 📖 Table of Contents

1. [Core Components](#core-components)
2. [Client Options](#client-options)
3. [Gateway & REST](#gateway--rest)
4. [Commands & Events](#commands--events)
5. [Interactions](#interactions)
6. [Structures](#structures)
7. [Utilities](#utilities)
8. [Voice](#voice)
9. [Advanced Features](#advanced-features)
10. [API Reference](#api-reference)

---

## 🔧 Core Components

### Client

The `Client` class is the main entry point for your bot. It manages all subsystems and provides fluent APIs for event handling.

```typescript
import { Client, Intents, GatewayIntentBits } from '@wingetcord/wingetcord';

const client = new Client({
    token: process.env.DISCORD_TOKEN!,
    intents: [
        GatewayIntentBits.GUILDS,
        GatewayIntentBits.GUILD_MESSAGES,
        GatewayIntentBits.MESSAGE_CONTENT
    ]
});
```

#### Client Properties

| Property | Type | Description |
|----------|------|-------------|
| `token` | `string` | The bot's authentication token |
| `rest` | `RESTManager` | Handles all REST API requests |
| `gateway` | `GatewayManager` | Manages WebSocket connections |
| `cache` | `CacheManager` | In-memory caching system |
| `commands` | `CommandManager` | Manages prefix commands |
| `events` | `EventManager` | Manages event listeners |
| `plugins` | `PluginManager` | Plugin system |
| `interactions` | `InteractionManager` | Handles slash commands & components |
| `handler` | `HandlerManager` | Automated resource discovery |
| `voice` | `VoiceManager` | Voice channel management |
| `store` | `ReactiveStore` | Reactive state management |
| `user` | `User \| null` | The current bot user |

#### Client Methods

##### `login()`

Logs the bot in and establishes a gateway connection.

```typescript
await client.login();
```

##### `say(channelId, content)`

High-level shortcut to send a message to a channel.

```typescript
// Send a simple message
await client.say('123456789', 'Hello, World!');

// Send embeds and components
await client.say('123456789', {
    embeds: [new EmbedBuilder().setTitle('Hello')],
    components: []
});
```

##### `pulse()`

Get an instant health report of the bot.

```typescript
const health = client.pulse();
// Returns: { status, ping, uptime, memory, guilds }
```

##### Fluent Event Listeners

WingetCord provides chainable event listeners:

```typescript
// MESSAGE_CREATE events
client.onMessage((msg) => { /* ... */ });

// INTERACTION_CREATE events
client.onInteraction((interaction) => { /* ... */ });

// READY event
client.onReady((user) => { /* ... */ });
```

---

## 🎯 Client Options

```typescript
interface ClientOptions {
    token: string;
    intents: number | (keyof typeof IntentBits)[];
    shardId?: number;
    shardCount?: number;
}
```

### Intent Bits

WingetCord provides an `IntentBits` enum for easy intent configuration:

```typescript
import { IntentBits } from '@wingetcord/wingetcord';

const intents = 
    IntentBits.GUILDS |
    IntentBits.GUILD_MESSAGES |
    IntentBits.MESSAGE_CONTENT;

// Or as an array:
const intents = ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT'];
```

| Intent | Value | Description |
|--------|-------|-------------|
| `GUILDS` | `1 << 0` | Guilds and guild channels |
| `GUILD_MEMBERS` | `1 << 1` | Guild members |
| `GUILD_MODERATION` | `1 << 2` | Guild moderation events |
| `GUILD_EMOJIS_AND_STICKERS` | `1 << 3` | Emojis and stickers |
| `GUILD_INTEGRATIONS` | `1 << 4` | Guild integrations |
| `GUILD_WEBHOOKS` | `1 << 5` | Webhooks |
| `GUILD_INVITES` | `1 << 6` | Invite management |
| `GUILD_VOICE_STATES` | `1 << 7` | Voice state updates |
| `GUILD_PRESENCES` | `1 << 8` | User presences |
| `GUILD_MESSAGES` | `1 << 9` | Guild messages |
| `GUILD_MESSAGE_REACTIONS` | `1 << 10` | Message reactions |
| `GUILD_MESSAGE_TYPING` | `1 << 11` | Typing indicators |
| `DIRECT_MESSAGES` | `1 << 12` | Direct messages |
| `DIRECT_MESSAGE_REACTIONS` | `1 << 13` | DM reactions |
| `DIRECT_MESSAGE_TYPING` | `1 << 14` | DM typing |
| `MESSAGE_CONTENT` | `1 << 15` | Message content |
| `GUILD_SCHEDULED_EVENTS` | `1 << 16` | Scheduled events |
| `AUTO_MODERATION_CONFIGURATION` | `1 << 20` | Auto-mod config |
| `AUTO_MODERATION_EXECUTION` | `1 << 21` | Auto-mod actions |

---

## 🌐 Gateway & REST

### RESTManager

The RESTManager handles all HTTP requests to Discord's API with advanced features:

- **Connection Pooling**: Uses `undici` for persistent connections
- **Rate Limiting**: Per-route queue with intelligent retry logic
- **Caching**: Automatic caching for GET requests
- **Fast Path**: Optional high-throughput mode for GET requests

```typescript
// Making REST requests
const user = await client.rest.users.getMe();
const guild = await client.rest.guilds.getGuild('guildId');
const message = await client.rest.channels.sendMessage('channelId', {
    content: 'Hello!'
});
```

#### REST Endpoints

| Handler | Methods |
|---------|---------|
| `users` | `getMe()`, `getUser(id)` |
| `guilds` | `getGuild(id)`, `editGuild(id, data)`, `getMembers(id)`, `editMember(guildId, userId, data)`, `getRoles(id)`, `createRole(id, data)`, `editRole(id, roleId, data)`, `deleteRole(id, roleId)`, `getEmojis(id)`, `createEmoji(id, data)`, `editEmoji(id, emojiId, data)`, `deleteEmoji(id, emojiId)` |
| `channels` | `getChannel(id)`, `sendMessage(id, data)`, `deleteMessage(channelId, messageId)`, `createThread(id, data)`, `joinThread(id)`, `leaveThread(id)`, `addThreadMember(id, userId)`, `removeThreadMember(id, userId)` |
| `webhooks` | `getWebhook(id)`, `createWebhook(channelId, data)`, `editWebhook(id, data)`, `deleteWebhook(id)` |
| `commands` | `getGlobalCommands(appId)`, `createGlobalCommand(appId, data)`, `bulkOverwriteGlobalCommands(appId, data)`, `editGlobalCommand(appId, commandId, data)`, `deleteGlobalCommand(appId, commandId)`, `getGuildCommands(appId, guildId)` |
| `auditLogs` | `get(guildId, options)` |
| `autoMod` | `listRules(guildId)`, `getRule(guildId, ruleId)`, `createRule(guildId, data)`, `updateRule(guildId, ruleId, data)`, `deleteRule(guildId, ruleId)` |
| `scheduledEvents` | `list(guildId)`, `create(guildId, data)`, `get(guildId, eventId)`, `update(guildId, eventId, data)`, `delete(guildId, eventId)`, `getUsers(guildId, eventId, options)` |
| `emojis` | `list(guildId)`, `get(guildId, emojiId)`, `create(guildId, data)`, `update(guildId, emojiId, data)`, `delete(guildId, emojiId)` |
| `stickers` | `get(stickerId)`, `listPacks()`, `listGuildStickers(guildId)`, `create(guildId, data)`, `update(guildId, stickerId, data)`, `delete(guildId, stickerId)` |

### GatewayManager

The GatewayManager handles WebSocket communication with Discord:

- **Automatic Reconnection**: Handles connection drops gracefully
- **Session Resume**: Maintains state across reconnections
- **Packet Rate Limiting**: Internal rate limiting (120 packets/60s)
- **Compression**: Optional zlib-stream decompression via `pako`

```typescript
// Gateway status
console.log(client.gateway.status); // 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING'
console.log(client.gateway.ping);   // Current ping in ms
```

---

## ⚔️ Commands & Events

### CommandManager

Manages prefix commands with automatic slash command syncing.

```typescript
import { Command, CommandContext } from '@wingetcord/wingetcord';

class PingCommand extends Command {
    options = {
        name: 'ping',
        description: 'Responds with pong',
        aliases: ['p'],
        cooldown: 5000, // 5 seconds
        permissions: ['SendMessages']
    };

    async execute(ctx: CommandContext) {
        await ctx.message.reply('🏓 Pong!');
    }
}

client.commands.register(new PingCommand());
```

#### Command Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Command name |
| `description` | `string` | Command description |
| `aliases` | `string[]` | Alternative command names |
| `cooldown` | `number` | Cooldown in milliseconds |
| `permissions` | `string[]` | Required permissions |

### EventManager

```typescript
import { Event } from '@wingetcord/wingetcord';

class ReadyEvent extends Event {
    name = 'READY';
    once = true;

    execute() {
        console.log('Bot is ready!');
    }
}

client.events.register(new ReadyEvent());
```

### HandlerManager

Automated resource discovery - load commands, events, and interactions from directories:

```typescript
await client.handler.setup({
    commands: './src/commands',
    events: './src/events',
    interactions: './src/interactions'
});
```

---

## 🎮 Interactions

### InteractionManager

Handles all interaction types including slash commands, buttons, selects, and modals.

```typescript
// Listen for slash commands
client.interactions.on('command', async (interaction) => {
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

// Listen for component interactions
client.interactions.on('component', async (interaction) => {
    if (interaction.customId === 'my-button') {
        await interaction.reply('Button clicked!');
    }
});
```

### Interaction Types

| Class | Description |
|-------|-------------|
| `Interaction` | Base interaction class |
| `CommandInteraction` | Slash command interactions |
| `ComponentInteraction` | Button/select menu interactions |
| `AutocompleteInteraction` | Autocomplete interactions |
| `ModalSubmitInteraction` | Modal submission interactions |

### Interaction Methods

```typescript
// Reply to an interaction
await interaction.reply('Hello!');
await interaction.reply({ embeds: [...] });

// Defer reply (for slow operations)
await interaction.deferReply();
await interaction.deferReply(true); // ephemeral

// Edit original response
await interaction.editReply('Updated!');

// Delete original response
await interaction.deleteReply();

// Follow-up messages
await interaction.followUp('Additional message');

// Show a modal
const modal = new ModalBuilder()
    .setTitle('Feedback')
    .setCustomId('feedback-modal')
    .addComponents(
        new TextInputBuilder()
            .setLabel('Your feedback')
            .setCustomId('feedback')
            .setStyle(TextInputStyle.Paragraph)
    );
await interaction.showModal(modal);

// Component-specific: Update message
await interaction.update('Updated message!');

// Component-specific: Defer update
await interaction.deferUpdate();
```

---

## 🏗️ Structures

All Discord objects are wrapped in fluent structures with helpful properties.

### User

```typescript
user.id               // User ID
user.username         // Username
user.discriminator    // User discriminator
user.globalName       // Display name
user.avatar           // Avatar hash
user.bot              // Whether user is a bot
user.banner           // Banner hash
user.accentColor      // Accent color

user.tag              // "username#0000"
user.displayAvatarURL // Avatar URL with proper format
user.toString()      // "<@123456789>"
```

### Guild

```typescript
guild.id                      // Guild ID
guild.name                   // Guild name
guild.icon                   // Icon hash
guild.ownerId                // Owner ID
guild.verificationLevel      // Verification level
guild.roles                  // Map of roles
guild.emojis                 // Array of emojis
guild.features               // Guild features
guild.premiumTier            // Nitro boost tier

guild.iconURL                // Icon URL
```

### Member

```typescript
member.user               // User object
member.nick              // Nickname
member.roles             // Array of role IDs
member.joinedAt          // Join timestamp
member.premiumSince      // Boost since
member.deaf              // Server deafened
member.mute              // Server muted
member.permissions       // Permissions bitfield

member.id                // User ID
member.displayName       // Nick or global name or username
member.toString()        // "<@123456789>"
```

### Message

```typescript
message.id            // Message ID
message.channelId    // Channel ID
message.author       // Author User
message.content      // Message content
message.timestamp    // Timestamp
message.embeds       // Array of embeds
message.attachments // Array of attachments

message.reply(content)  // Reply to message
message.delete()        // Delete message
```

### Role

```typescript
role.id           // Role ID
role.name         // Role name
role.color        // Color integer
role.hoist        // Whether role is hoisted
role.position     // Position
role.permissions  // Permissions bitfield
role.managed      // Whether role is managed
role.mentionable // Whether role is mentionable

role.hexColor     // "#RRGGBB"
role.toString()  // "<@&123456789>"
```

---

## 🛠️ Utilities

### EmbedBuilder

```typescript
const embed = new EmbedBuilder()
    .setTitle('Embed Title')
    .setDescription('Embed description')
    .setColor('#FF5733')
    .setThumbnail('https://example.com/image.png')
    .addField('Field 1', 'Value 1', true)
    .addFields(
        { name: 'Field 2', value: 'Value 2', inline: true },
        { name: 'Field 3', value: 'Value 3', inline: true }
    )
    .setTimestamp()
    .setFooter('Footer text', 'https://example.com/icon.png');

await channel.send({ embeds: [embed] });
```

### Component Builders

#### ButtonBuilder

```typescript
const button = new ButtonBuilder()
    .setCustomId('my-button')
    .setLabel('Click Me')
    .setStyle(ButtonStyle.Primary)
    .setEmoji({ name: '👋' })
    .onAction(async (interaction) => {
        await interaction.reply('You clicked it!');
    });
```

#### SelectMenuBuilder

```typescript
const select = new SelectMenuBuilder()
    .setCustomId('my-select')
    .setPlaceholder('Select an option')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
        { label: 'Option 1', value: 'option1', description: 'First option' },
        { label: 'Option 2', value: 'option2', description: 'Second option' }
    )
    .onAction(async (interaction) => {
        await interaction.reply(`You selected: ${interaction.values}`);
    });
```

#### ActionRowBuilder

```typescript
const row = new ActionRowBuilder()
    .addComponents(button, select);

await channel.send({
    content: 'Choose something:',
    components: [row]
});
```

### ModalBuilder

```typescript
const modal = new ModalBuilder()
    .setTitle('Feedback Form')
    .setCustomId('feedback-modal')
    .addComponents(
        new TextInputBuilder()
            .setLabel('Your Name')
            .setCustomId('name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter your name')
            .setRequired(true),
        new TextInputBuilder()
            .setLabel('Feedback')
            .setCustomId('feedback')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(10)
            .setMaxLength(1000)
    );

await interaction.showModal(modal);
```

### Collection

A Map with utility methods:

```typescript
const collection = new Collection<string, User>();

collection.set('1', user1);
collection.set('2', user2);

collection.get('1');           // Get by key
collection.find(u => u.bot);    // Find first match
collection.filter(u => u.bot); // Filter to new collection
collection.map(u => u.tag);    // Map to array
collection.some(u => u.bot);   // Check if any match
collection.every(u => !u.bot); // Check if all match
collection.random();           // Random element
collection.first();            // First element
```

### BitField

#### PermissionsBitField

```typescript
const perms = new PermissionsBitField('SendMessages');
perms.has('SendMessages');           // true
perms.has('ManageMessages');         // false
perms.add('ManageMessages');
perms.remove('SendMessages');
perms.toJSON();                      // "1234n"
```

### Color Utility

```typescript
Color.resolve('#FF5733');           // 16737203
Color.resolve(0xFF5733);           // 16737203
Color.resolve([255, 87, 51]);       // 16737203
Color.resolve('random');            // Random color

Color.toHex(16737203);              // "#ff5733"
Color.toRGB(16737203);              // [255, 87, 51]
```

### Validator

```typescript
// Sanitize input
Validator.sanitize('<script>alert(1)</script>'); // "<script>alert(1)</script>"

// Validate payload
Validator.validate(payload, {
    username: 'string',
    age: 'number',
    tags: 'array'
});

// Check permissions
Validator.hasPermissions('123456789', PermissionFlags.Administrator);
```

### ReactiveStore

Proxy-based reactive state management:

```typescript
const store = new ReactiveStore({ count: 0 });

store.state.count = 5; // Automatically emits change events

store.on('change', ({ property, oldValue, newValue }) => {
    console.log(`${property} changed from ${oldValue} to ${newValue}`);
});

store.on('change:count', ({ oldValue, newValue }) => {
    console.log(`Count changed!`);
});
```

### Collector

Collect events over time:

```typescript
const collector = client.interactions.createCollector({
    filter: (i) => i.customId === 'verify-button',
    max: 10,       // Stop after 10 interactions
    time: 60000   // Or after 60 seconds
});

collector.on('collect', (interaction) => {
    console.log('Collected:', interaction.id);
});

collector.on('end', (collected, reason) => {
    console.log(`Ended: ${reason}, collected: ${collected.size}`);
});
```

---

## 🔊 Voice

### VoiceManager

```typescript
// Join a voice channel
await client.voice.join(guildId, channelId, {
    mute: false,
    deaf: true
});
```

### AudioPlayer

```typescript
const player = new AudioPlayer();

player.play({
    url: 'https://example.com/audio.mp3',
    title: 'My Song',
    duration: 180,
    requester: 'User#1234'
});

player.setVolume(0.5);  // 0.0 to 2.0
player.pause();
player.resume();
player.skip();
player.stop();

player.on('start', (track) => console.log('Playing:', track.title));
player.on('idle', () => console.log('Queue finished'));
```

---

## 🔥 Advanced Features

### Middleware System

Intercept and process every event:

```typescript
client.use(async (ctx, next) => {
    const start = Date.now();
    console.log(`[Log] Event: ${ctx.event}`);
    
    await next();
    
    const duration = Date.now() - start;
    console.log(`[Log] ${ctx.event} took ${duration}ms`);
});

// Another example: Permission checking
client.use(async (ctx, next) => {
    if (ctx.event === 'MESSAGE_CREATE') {
        const member = ctx.data.member;
        if (!member.permissions.has('SendMessages')) {
            return; // Don't process
        }
    }
    await next();
});
```

### Inline Interaction Callbacks (Unique!)

Handle button clicks and select menus directly where you define them:

```typescript
const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel('Click Me')
        .setStyle(ButtonStyle.Primary)
        .onAction(async (i) => {
            await i.reply('You clicked the button!');
        })
);

await channel.send({
    components: [row]
});
```

### Plugin System

Extend WingetCord with plugins:

```typescript
import { Plugin, PluginMetadata } from '@wingetcord/wingetcord';

class MyPlugin extends Plugin {
    metadata: PluginMetadata = {
        name: 'my-plugin',
        version: '1.0.0',
        description: 'My awesome plugin',
        author: 'Me'
    };

    init(client) {
        console.log('Plugin initialized!');
    }

    onStart(client) {
        console.log('Plugin started!');
    }

    onStop(client) {
        console.log('Plugin stopped!');
    }
}

await client.plugins.register(new MyPlugin());
```

### Caching

WingetCord includes a built-in caching system with TTL support:

```typescript
// Cache is automatic for REST requests
const guild = await client.rest.guilds.getGuild('id'); // Cached
const cached = client.cache.guilds.get('id');          // From cache

// Manual cache usage
client.cache.guilds.set('id', guildData, 3600000); // 1 hour TTL
```

### Fast Path Mode

Enable high-throughput mode for GET requests:

```typescript
client.rest.setFastPath(true); // Skip queue for GET requests
```

---

## 📋 Enums

WingetCord provides exhaustive Discord enums:

### ChannelType
- `GuildText`, `DM`, `GuildVoice`, `GroupDM`, `GuildCategory`, `GuildAnnouncement`
- `AnnouncementThread`, `PublicThread`, `PrivateThread`, `GuildStageVoice`
- `GuildDirectory`, `GuildForum`

### InteractionType
- `Ping`, `ApplicationCommand`, `MessageComponent`
- `ApplicationCommandAutocomplete`, `ModalSubmit`

### ComponentType
- `ActionRow`, `Button`, `StringSelect`, `TextInput`
- `UserSelect`, `RoleSelect`, `MentionableSelect`, `ChannelSelect`

### ButtonStyle
- `Primary`, `Secondary`, `Success`, `Danger`, `Link`

### TextInputStyle
- `Short`, `Paragraph`

### PermissionFlags
All Discord permissions are available:
- `CreateInstantInvite`, `KickMembers`, `BanMembers`, `Administrator`
- `ManageChannels`, `ManageGuild`, `AddReactions`, `ViewAuditLog`
- `PrioritySpeaker`, `Stream`, `ViewChannel`, `SendMessages`
- `SendTTSMessages`, `ManageMessages`, `EmbedLinks`, `AttachFiles`
- `ReadMessageHistory`, `MentionEveryone`, `UseExternalEmojis`
- `Connect`, `Speak`, `MuteMembers`, `DeafenMembers`, `MoveMembers`
- `UseVAD`, `ManageRoles`, `ManageWebhooks`, `ManageEmojisAndStickers`
- `UseApplicationCommands`, `ManageEvents`, `ManageThreads`, and more...

---

## 📚 Examples

### Complete Bot Example

```typescript
import { 
    Client, 
    IntentBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType
} from '@wingetcord/wingetcord';

const client = new Client({
    token: process.env.DISCORD_TOKEN!,
    intents: [
        IntentBits.GUILDS,
        IntentBits.GUILD_MESSAGES,
        IntentBits.MESSAGE_CONTENT
    ]
});

// Middleware logging
client.use(async (ctx, next) => {
    console.log(`[${ctx.event}] Received`);
    await next();
});

// Ready event
client.onReady((user) => {
    console.log(`🚀 Logged in as ${user.tag}`);
});

// Message commands
client.onMessage(async (msg) => {
    if (msg.content === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('Available commands: !ping, !stats, !help');
        
        const button = new ButtonBuilder()
            .setLabel('Ping')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('ping-btn')
            .onAction(async (i) => {
                await i.reply('Pong!');
            });
        
        const row = new ActionRowBuilder().addComponents(button);
        
        await msg.reply({ embeds: [embed], components: [row] });
    }
    
    if (msg.content === '!ping') {
        await msg.reply(`🏓 Pong! (${client.gateway.ping}ms)`);
    }
});

// Interaction handling
client.interactions.on('command', async (interaction) => {
    if (interaction.commandName === 'stats') {
        const health = client.pulse();
        await interaction.reply({
            embeds: [{
                title: 'Bot Stats',
                fields: [
                    { name: 'Ping', value: `${health.ping}ms`, inline: true },
                    { name: 'Uptime', value: `${Math.floor(health.uptime)}s`, inline: true },
                    { name: 'Guilds', value: `${health.guilds}`, inline: true }
                ]
            }]
        });
    }
});

client.login();
```

---

## ⚙️ Building & Running

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development
npm run dev

# Clean dist folder
npm run clean
```

---

## 🤝 Contributing

Contributions are welcome! Please read our Contributing Guide to get started.

## ⚖️ License

WingetCord is licensed under the [GNU Affero General Public License v3 (AGPLv3)](LICENSE.md).

**Key Points:**
- ✅ **Free to use** - Anyone can use this library
- ✅ **Open source** - Source code must be provided for modifications
- ❌ **No selling** - You cannot sell this software
- ❌ **No closed-source derivatives** - Any modifications must be open source
- ❌ **No commercial use in products** - Cannot be included in paid products

This license ensures the software remains open and free while preventing commercial exploitation.

---

## 🙏 Acknowledgments

- Built with [discord-api-types](https://discord.js.org/#/docs/main/stable/general/welcome)
- Uses [undici](https://undici.nodejs.org/) for high-performance HTTP
- Uses [pako](https://nodeca.github.io/pako/) for gateway compression
- Logging powered by [pino](https://getpino.io/)

---

Built with ❤️ by **Mr.Winget**
