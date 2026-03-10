/**
 * WingetCord CLI - Command Line Interface
 * 
 * Provides commands for:
 * - init: Initialize a new WingetCord project
 * - make:command: Generate a new command
 * - make:plugin: Generate a new plugin
 * - make:event: Generate a new event handler
 * - make:middleware: Generate a new middleware
 * - hotreload: Start bot with hot-reload enabled
 */

import { readdir, mkdir, writeFile, access, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CLIOptions {
  projectPath?: string;
  force?: boolean;
  template?: string;
}

export interface CLICommandOptions {
  name: string;
  description?: string;
  guild?: string;
  dm?: boolean;
}

export interface PluginOptions {
  name: string;
  description?: string;
  author?: string;
  version?: string;
  dependencies?: string[];
}

export interface EventOptions {
  event: string;
  name?: string;
}

export interface MiddlewareOptions {
  name: string;
  type?: 'pre' | 'post' | 'error';
}

/**
 * Get the project root directory
 */
function getProjectRoot(customPath?: string): string {
  if (customPath) return resolve(customPath);
  return process.cwd();
}

/**
 * Check if directory exists
 */
async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create directory if not exists
 */
async function ensureDirectory(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * Read package.json from project
 */
async function getPackageJson(projectPath: string): Promise<any> {
  const packagePath = join(projectPath, 'package.json');
  try {
    const content = await readFile(packagePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Initialize a new WingetCord project
 */
export async function initProject(options: CLIOptions = {}): Promise<void> {
  const projectRoot = getProjectRoot(options.projectPath);
  
  console.log(`\n🚀 Initializing WingetCord project at: ${projectRoot}\n`);
  
  // Check if directory is empty
  const files = await readdir(projectRoot);
  if (files.length > 0 && !options.force) {
    console.error('❌ Directory is not empty. Use --force to override.');
    process.exit(1);
  }
  
  // Create directory structure
  const dirs = [
    'src/commands',
    'src/events',
    'src/plugins',
    'src/middleware',
    'src/utils',
    'src/locales',
    'configs',
  ];
  
  for (const dir of dirs) {
    await ensureDirectory(join(projectRoot, dir));
    console.log(`📁 Created: ${dir}`);
  }
  
  // Create package.json
  const packageJson = {
    name: 'wingetcord-bot',
    version: '1.0.0',
    description: 'A Discord bot built with WingetCord',
    type: 'module',
    main: 'dist/index.js',
    scripts: {
      dev: 'wingetcord hotreload',
      build: 'tsc',
      start: 'node dist/index.js',
      'make:command': 'wingetcord make:command',
      'make:plugin': 'wingetcord make:plugin',
      'make:event': 'wingetcord make:event',
    },
    dependencies: {
      '@wingetcord/wingetcord': '^1.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
    },
  };
  
  await writeFile(
    join(projectRoot, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('📄 Created: package.json');
  
  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
  
  await writeFile(
    join(projectRoot, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  console.log('📄 Created: tsconfig.json');
  
  // Create main entry file
  const mainFile = `/**
 * Main entry point for WingetCord Bot
 */
import { Client, GatewayIntentBits } from '@wingetcord/wingetcord';
import { Logger } from '@wingetcord/wingetcord';

// Initialize logger
const logger = new Logger({ name: 'main' });

// Create client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  logger: {
    level: 'info',
  },
});

// Load events
await client.events.load('./src/events');

// Load commands
await client.commands.load('./src/commands');

// Load plugins
await client.plugins.load('./src/plugins');

// Ready event
client.on('ready', () => {
  logger.info(\`🤖 Bot is ready! Logged in as \${client.user?.tag}\`);
});

// Login
client.login(process.env.DISCORD_TOKEN || 'your-token-here');
`;
  
  await writeFile(join(projectRoot, 'src', 'index.ts'), mainFile);
  console.log('📄 Created: src/index.ts');
  
  // Create .env.example
  await writeFile(join(projectRoot, '.env.example'), 'DISCORD_TOKEN=your-bot-token-here\n');
  console.log('📄 Created: .env.example');
  
  console.log('\n✅ Project initialized successfully!\n');
  console.log('Next steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Copy .env.example to .env and add your token');
  console.log('  3. Start bot: npm run dev\n');
}

/**
 * Generate a new command
 */
export async function makeCommand(options: CLICommandOptions, cliOptions: CLIOptions = {}): Promise<void> {
  const projectRoot = getProjectRoot(cliOptions.projectPath);
  const commandsDir = join(projectRoot, 'src', 'commands');
  
  await ensureDirectory(commandsDir);
  
  const name = options.name.toLowerCase().replace(/\s+/g, '-');
  const fileName = `${name}.ts`;
  const filePath = join(commandsDir, fileName);
  
  if (existsSync(filePath) && !cliOptions.force) {
    console.error(`❌ Command "${name}" already exists. Use --force to override.`);
    process.exit(1);
  }
  
  const commandContent = `/**
 * ${options.name} Command
 * ${options.description || 'A new slash command'}
 * 
 * Generated by WingetCord CLI
 */
import { Command, CommandContext, Option, StringOption } from '@wingetcord/wingetcord';

@Command({
  name: '${name}',
  description: '${options.description || 'Command description'}',
  ${options.guild ? `guildId: '${options.guild}',` : ''}
  ${options.dm ? 'dmPermission: true,' : ''}
})
@StringOption({
  name: 'input',
  description: 'Input text',
  required: false,
})
export class ${toPascalCase(name)}Command {
  async execute(context: CommandContext): Promise<void> {
    const input = context.getString('input') || 'Hello, WingetCord!';
    
    await context.reply(\`You said: \${input}\`);
  }
}
`;

  await writeFile(filePath, commandContent);
  console.log(`✅ Created command: src/commands/${fileName}`);
  
  // Create index export if exists
  const indexPath = join(commandsDir, 'index.ts');
  if (existsSync(indexPath)) {
    const content = await readFile(indexPath, 'utf-8');
    if (!content.includes(fileName.replace('.ts', ''))) {
      await writeFile(indexPath, content + `export * from './${name}.js';\n`);
      console.log(`📝 Updated: src/commands/index.ts`);
    }
  }
}

/**
 * Generate a new plugin
 */
export async function makePlugin(options: PluginOptions, cliOptions: CLIOptions = {}): Promise<void> {
  const projectRoot = getProjectRoot(cliOptions.projectPath);
  const pluginsDir = join(projectRoot, 'src', 'plugins');
  
  await ensureDirectory(pluginsDir);
  
  const name = options.name.toLowerCase().replace(/\s+/g, '-');
  const fileName = `${name}.ts`;
  const filePath = join(pluginsDir, fileName);
  
  if (existsSync(filePath) && !cliOptions.force) {
    console.error(`❌ Plugin "${name}" already exists. Use --force to override.`);
    process.exit(1);
  }
  
  const pluginContent = `/**
 * ${options.name} Plugin
 * ${options.description || 'A new WingetCord plugin'}
 * 
 * Generated by WingetCord CLI
 * Version: ${options.version || '1.0.0'}
 * Author: ${options.author || 'Unknown'}
 */
import { Plugin, PluginState } from '@wingetcord/wingetcord';

export const ${toCamelCase(name)}Plugin = Plugin.create({
  name: '${name}',
  version: '${options.version || '1.0.0'}',
  description: '${options.description || 'Plugin description'}',
  author: '${options.author || 'Unknown'}',
  ${options.dependencies ? `dependencies: [${options.dependencies.map(d => `'${d}'`).join(', ')}],` : ''}
});

${toCamelCase(name)}Plugin.onLoad(async (plugin) => {
  console.log(\`Loading \${plugin.metadata.name}...\`);
  
  // Initialize your plugin resources here
  // - Load configurations
  // - Connect to databases
  // - Register commands
  
  plugin.setState(PluginState.Loaded);
  console.log(\`\${plugin.metadata.name} loaded!\`);
});

${toCamelCase(name)}Plugin.onUnload(async (plugin) => {
  console.log(\`Unloading \${plugin.metadata.name}...\`);
  
  // Cleanup your plugin resources here
  // - Close connections
  // - Save state
  
  plugin.setState(PluginState.Unloaded);
  console.log(\`\${plugin.metadata.name} unloaded!\`);
});

// Export the plugin
export default ${toCamelCase(name)}Plugin;
`;

  await writeFile(filePath, pluginContent);
  console.log(`✅ Created plugin: src/plugins/${fileName}`);
}

/**
 * Generate a new event handler
 */
export async function makeEvent(options: EventOptions, cliOptions: CLIOptions = {}): Promise<void> {
  const projectRoot = getProjectRoot(cliOptions.projectPath);
  const eventsDir = join(projectRoot, 'src', 'events');
  
  await ensureDirectory(eventsDir);
  
  const eventName = options.name || toPascalCase(options.event.replace(/[^a-zA-Z]/g, ''));
  const fileName = `${options.event}.ts`;
  const filePath = join(eventsDir, fileName);
  
  if (existsSync(filePath) && !cliOptions.force) {
    console.error(`❌ Event "${options.event}" already exists. Use --force to override.`);
    process.exit(1);
  }
  
  const eventContent = `/**
 * ${eventName} Event Handler
 * 
 * Generated by WingetCord CLI
 * Event: ${options.event}
 */
import { On, DiscordEvents } from '@wingetcord/wingetcord';

@On('${options.event}')
export class ${eventName}Event {
  async execute(...args: any[]): Promise<void> {
    console.log('Event triggered:', '${options.event}', args);
    
    // Handle the event
    // Example: const [client, ...rest] = args;
  }
}
`;

  await writeFile(filePath, eventContent);
  console.log(`✅ Created event: src/events/${fileName}`);
}

/**
 * Generate a new middleware
 */
export async function makeMiddleware(options: MiddlewareOptions, cliOptions: CLIOptions = {}): Promise<void> {
  const projectRoot = getProjectRoot(cliOptions.projectPath);
  const middlewareDir = join(projectRoot, 'src', 'middleware');
  
  await ensureDirectory(middlewareDir);
  
  const name = options.name.toLowerCase().replace(/\s+/g, '-');
  const fileName = `${name}.ts`;
  const filePath = join(middlewareDir, fileName);
  
  if (existsSync(filePath) && !cliOptions.force) {
    console.error(`❌ Middleware "${name}" already exists. Use --force to override.`);
    process.exit(1);
  }
  
  const middlewareContent = `/**
 * ${options.name} Middleware
 * Type: ${options.type || 'pre'}
 * 
 * Generated by WingetCord CLI
 */
import { MiddlewareFunction, MiddlewareContext } from '@wingetcord/wingetcord';

export const ${toCamelCase(name)}Middleware: MiddlewareFunction = async (
  context: MiddlewareContext,
  next: () => Promise<void>
): Promise<void> => {
  console.log(\`[${options.name}] Processing request...\`);
  
  try {
    // Pre-processing logic
    // - Validate input
    // - Check permissions
    // - Rate limiting
    
    await next();
    
    // Post-processing logic
    // - Log response
    // - Transform output
    
    console.log(\`[${options.name}] Request completed\`);
  } catch (error) {
    console.error(\`[${options.name}] Error:\`, error);
    throw error;
  }
};
`;

  await writeFile(filePath, middlewareContent);
  console.log(`✅ Created middleware: src/middleware/${fileName}`);
}

/**
 * Helper: Convert to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Helper: Convert to camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * CLI Entry Point - Parse and execute commands
 */
export async function runCLI(args: string[]): Promise<void> {
  const [,, command, ...rest] = args;
  
  const options: CLIOptions = {};
  const subOptions: Record<string, unknown> = {};
  
  // Parse flags
  for (let i = rest.length - 1; i >= 0; i--) {
    const arg = rest[i];
    if (!arg || arg.startsWith('--')) {
      if (arg?.startsWith('--')) {
        const key = arg.replace('--', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const nextArg = rest[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          subOptions[key] = nextArg;
          rest.splice(i, 2);
        } else {
          subOptions[key] = true;
          rest.splice(i, 1);
        }
      }
    }
  }
  
  Object.assign(options, subOptions);
  
  console.log('\n⚡ WingetCord CLI\n');
  
  switch (command) {
    case 'init':
    case 'init:project':
      await initProject(options);
      break;
      
    case 'make:command':
    case 'make:cmd':
      {
        const cmdOpts: CLICommandOptions = { name: '' };
        if (!subOptions.name && rest[0]) {
          cmdOpts.name = rest[0];
        } else if (subOptions.name) {
          cmdOpts.name = String(subOptions.name);
        }
        if (!cmdOpts.name) {
          console.error('❌ Please provide a command name: wingetcord make:command <name>');
          process.exit(1);
        }
        if (subOptions.description) cmdOpts.description = String(subOptions.description);
        if (subOptions.guild) cmdOpts.guild = String(subOptions.guild);
        if (subOptions.dm) cmdOpts.dm = true;
        await makeCommand(cmdOpts, options);
      }
      break;
      
    case 'make:plugin':
      {
        const pluginOpts: PluginOptions = { name: '' };
        if (!subOptions.name && rest[0]) {
          pluginOpts.name = rest[0];
        } else if (subOptions.name) {
          pluginOpts.name = String(subOptions.name);
        }
        if (!pluginOpts.name) {
          console.error('❌ Please provide a plugin name: wingetcord make:plugin <name>');
          process.exit(1);
        }
        if (subOptions.description) pluginOpts.description = String(subOptions.description);
        if (subOptions.author) pluginOpts.author = String(subOptions.author);
        if (subOptions.version) pluginOpts.version = String(subOptions.version);
        await makePlugin(pluginOpts, options);
      }
      break;
      
    case 'make:event':
      {
        const eventOpts: EventOptions = { event: '' };
        if (!subOptions.event && rest[0]) {
          eventOpts.event = rest[0];
        } else if (subOptions.event) {
          eventOpts.event = String(subOptions.event);
        }
        if (!eventOpts.event) {
          console.error('❌ Please provide an event name: wingetcord make:event <event>');
          process.exit(1);
        }
        await makeEvent(eventOpts, options);
      }
      break;
      
    case 'make:middleware':
      {
        const midOpts: MiddlewareOptions = { name: '' };
        if (!subOptions.name && rest[0]) {
          midOpts.name = rest[0];
        } else if (subOptions.name) {
          midOpts.name = String(subOptions.name);
        }
        if (!midOpts.name) {
          console.error('❌ Please provide a middleware name: wingetcord make:middleware <name>');
          process.exit(1);
        }
        if (subOptions.type) midOpts.type = String(subOptions.type) as 'pre' | 'post' | 'error';
        await makeMiddleware(midOpts, options);
      }
      break;
      
    case 'hotreload':
    case 'dev':
      console.log('🔄 Starting hot-reload mode...');
      console.log('   Use tsx or ts-node to watch and reload');
      console.log('   Example: npx tsx --watch src/index.ts');
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}\n`);
      showHelp();
      process.exit(1);
  }
}

/**
 * Show CLI help
 */
function showHelp(): void {
  console.log(`
WingetCord CLI - Discord Bot Framework

Usage:
  wingetcord <command> [options]

Commands:
  init                         Initialize a new WingetCord project
  make:command <name>         Generate a new command
  make:plugin <name>          Generate a new plugin
  make:event <event>          Generate a new event handler
  make:middleware <name>      Generate a new middleware
  hotreload                   Start bot with hot-reload
  help                        Show this help message

Options:
  --force                      Overwrite existing files
  --description <text>        Add description
  --author <name>             Set author name
  --version <version>         Set version number
  --guild <id>               Set guild ID for command
  --dm                        Enable DM for command

Examples:
  wingetcord init
  wingetcord make:command ping --description "Ping command"
  wingetcord make:plugin music --author "MyName"
  wingetcord make:event messageCreate
  `);
}

// Run if called directly
const isMain = process.argv[1]?.includes('cli');
if (isMain) {
  runCLI(process.argv).catch(console.error);
}
