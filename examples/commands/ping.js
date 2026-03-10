import { Client } from '../../src/index.js';
import { Command } from '../../src/core/CommandManager.js';
export default class PingCommand extends Command {
    constructor() {
        super({
            name: 'ping',
            description: 'Replies with Pong!',
            aliases: ['p'],
            cooldown: 5000,
        });
    }
    async execute(ctx) {
        const start = Date.now();
        await ctx.client.rest.request('POST', `/channels/${ctx.message.channel_id}/messages`, {
            content: `Pong! 🏓 (Latency: ${Date.now() - start}ms)`,
        });
    }
}
//# sourceMappingURL=ping.js.map