import fs from 'node:fs';
import { Client, Collection, Intents, Interaction, SelectMenuInteraction } from 'discord.js';
import Keyv from 'keyv';
import { Command, Directory, GameListing, MenuHandler } from './types';
import { interactionHandler } from './handlers/interaction-handler';
const { token } = require('../config.json');

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const directories : Keyv<Directory> = new Keyv('sqlite://directories.sqlite');
const games : Map<string, GameListing> = new Map();

// gather up a Collection of command handlers
const commands : Collection<string, Command> = new Collection();
const commandFiles = fs.readdirSync('./lib/commands').filter((file:string) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command : Command = require(`./commands/${file}`);
  commands.set(command.data.name, command);
}

const menuHandlers : Collection<string, MenuHandler> = new Collection();
const menuHandlerFiles = fs.readdirSync('./lib/menus').filter((file:string) => file.endsWith('.ts'));

for (const file of menuHandlerFiles) {
  const menuHandler : MenuHandler = require(`./menus/${file}`);
  menuHandlers.set(menuHandler.name, menuHandler);
}

// might use something like this code at some point so im saving it here for now
// const eventFiles = fs.readdirSync('./lib/events').filter((file:string) => file.endsWith('.ts'));

// for (const file of eventFiles) {
//   const event = require(`./events/${file}`);
//   if (event.once) {
//     client.once(event.name, (...args : any[]) => event.execute(...args));
//   } else {
//     client.on(event.name, (...args : any[]) => event.execute(...args));
//   }
// }

// handle interactions
client.once('ready', (client) => console.log('Up and running'));

client.on('interactionCreate', (interaction : Interaction) => interactionHandler(interaction, commands, menuHandlers, directories));
// handle setting a new directory

client.login(token);