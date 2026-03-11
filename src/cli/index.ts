#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

const __filename = 'index.ts';

interface PackageJson {
  name?: string;
  version?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface _CommandOptions {
  name: string;
  description?: string;
  guild?: boolean;
  dm?: boolean;
}

interface EventOptions {
  name: string;
  event?: string;
}

interface MakeCommandOptions {
  name: string;
  type?: string;
  description?: string;
}

async function directoryExists(path: string): Promise<boolean> {
  return existsSync(path);
}

async function getPackageJson(dir: string): Promise<PackageJson | null> {
  const packagePath = join(dir, 'package.json');
  try {
    const content = await readFile(packagePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function init(): Promise<void> {
  console.log('Initializing WingetCord project...');
  
  const currentDir = process.cwd();
  const packageJson = await getPackageJson(currentDir);
  
  if (packageJson) {
    console.log('package.json already exists. Adding WingetCord dependency...');
    
    const updated: PackageJson = {
      ...packageJson,
      dependencies: {
        ...packageJson.dependencies,
        '@wingetcord/wingetcord': '^1.0.0',
      },
      scripts: {
        ...packageJson.scripts,
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
      },
    };
    
    await writeFile(
      join(currentDir, 'package.json'),
      JSON.stringify(updated, null, 2) + '\n'
    );
    
    console.log('Added @wingetcord/wingetcord to dependencies.');
  } else {
    console.log('No package.json found. Creating new project...');
    
    const newPackage: PackageJson = {
      name: 'my-wingetcord-bot',
      version: '1.0.0',
      main: 'dist/index.js',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
      },
      dependencies: {
        '@wingetcord/wingetcord': '^1.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        tsx: '^4.0.0',
        '@types/node': '^20.0.0',
      },
    };
    
    await writeFile(
      join(currentDir, 'package.json'),
      JSON.stringify(newPackage, null, 2) + '\n'
    );
    
    // Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
    };
    
    await writeFile(
      join(currentDir, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2) + '\n'
    );
    
    // Create src directory
    await mkdir(join(currentDir, 'src'), { recursive: true });
    
    // Create example index.ts
    const exampleCode = `import { Client, GatewayIntentBits } from '@wingetcord/wingetcord';

const client = new Client({
  token: process.env.DISCORD_TOKEN!,
  intents: [
    GatewayIntentBits.GUILDS,
    GatewayIntentBits.GUILD_MESSAGES,
  ],
});

client.on('ready', () => {
  console.log(\`Logged in as \${client.user?.tag}\`);
});

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply('Pong!');
  }
});

client.login();
`;
    
    await writeFile(join(currentDir, 'src', 'index.ts'), exampleCode);
    
    console.log('Project initialized successfully!');
    console.log('Run npm install to install dependencies.');
    console.log('Run npm run dev to start the bot.');
  }
}

async function makeCommand(options: MakeCommandOptions): Promise<void> {
  const { name, type = 'slash', description = 'A command' } = options;
  
  const currentDir = process.cwd();
  const commandsDir = join(currentDir, 'src', 'commands');
  
  if (!(await directoryExists(commandsDir))) {
    await mkdir(commandsDir, { recursive: true });
  }
  
  const fileName = `${name}.ts`;
  const filePath = join(commandsDir, fileName);
  
  let template: string;
  
  if (type === 'slash') {
    template = `import { CommandBuilder } from '@wingetcord/wingetcord';

export const ${name} = new CommandBuilder()
  .setName('${name}')
  .setDescription('${description}')
  .setExecute(async (interaction) => {
    await interaction.reply('Hello from ${name}!');
  });
`;
  } else if (type === 'context') {
    template = `import { CommandBuilder } from '@wingetcord/wingetcord';

export const ${name} = new CommandBuilder()
  .setName('${name}')
  .setType('MESSAGE' as const)
  .setExecute(async (interaction) => {
    await interaction.reply('Context menu command executed!');
  });
`;
  } else {
    template = `// Command: ${name}
export const ${name} = {
  name: '${name}',
  description: '${description}',
  execute: async (...args: unknown[]) => {
    console.log('Command ${name} executed', args);
  },
};
`;
  }
  
  await writeFile(filePath, template);
  console.log(`Created command: src/commands/${fileName}`);
}

async function makeEvent(options: EventOptions): Promise<void> {
  const { name, event = 'messageCreate' } = options;
  
  const currentDir = process.cwd();
  const eventsDir = join(currentDir, 'src', 'events');
  
  if (!(await directoryExists(eventsDir))) {
    await mkdir(eventsDir, { recursive: true });
  }
  
  const fileName = `${name}.ts`;
  const filePath = join(eventsDir, fileName);
  
  const template = `import { Event } from '@wingetcord/wingetcord';

@Event('${event}')
export class ${name}Event {
  async execute(...args: unknown[]) {
    console.log('Event ${event} triggered', args);
  }
}
`;
  
  await writeFile(filePath, template);
  console.log(`Created event: src/events/${fileName}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'init':
      await init();
      break;
      
    case 'make:command': {
      const name = args[1];
      if (!name) {
        console.error('Error: Command name is required');
        console.log('Usage: wingetcord make:command <name>');
        process.exit(1);
      }
      await makeCommand({ name, ...(args[2] ? { description: args[2] } : {}) });
      break;
    }
    
    case 'make:event': {
      const name = args[1];
      if (!name) {
        console.error('Error: Event name is required');
        console.log('Usage: wingetcord make:event <name>');
        process.exit(1);
      }
      await makeEvent({ name, ...(args[2] ? { event: args[2] } : {}) });
      break;
    }
    
    default:
      console.log('WingetCord CLI');
      console.log('');
      console.log('Usage:');
      console.log('  wingetcord init                    Initialize a new WingetCord project');
      console.log('  wingetcord make:command <name>      Create a new command');
      console.log('  wingetcord make:event <name>       Create a new event handler');
      console.log('');
      console.log('Examples:');
      console.log('  wingetcord init');
      console.log('  wingetcord make:command ping "A simple ping command"');
      console.log('  wingetcord make:event readyHandler ready');
  }
}

main().catch(console.error);
