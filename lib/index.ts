import fs from 'node:fs';
import { Client, Collection, Intents, Interaction, Permissions, TextChannel } from 'discord.js';
import Keyv from 'keyv';
import { deleteDirectoryMessages, makeDirectoryMessage, makeEmptyDirectoryMessage } from './directory';
import { Directory, Game } from './types';
const { token } = require('../config.json');

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const directories : Keyv<Directory> = new Keyv('sqlite://directories.sqlite');

// gather up a Collection of command handlers
const commands : Collection<string, any> = new Collection();
const commandFiles = fs.readdirSync('./lib/commands').filter((file:string) => file.endsWith('.ts'));

const games : Map<String, Game> = new Map();
games.set('1', {
  max_players: 20,
  current_players: 3,
  name: 'test game #1',
  creator: 'noops#6056',
  players : ['ralph', 'walph', 'balph'],
})
games.set('2', {
  max_players: 5,
  current_players: 1,
  name: 'test game #2',
  creator: 'noops#6056',
  players : ['sydney'],
})

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.data.name, command);
}

// use event handlers
const eventFiles = fs.readdirSync('./lib/events').filter((file:string) => file.endsWith('.ts'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args : any[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args : any[]) => event.execute(...args));
  }
}

// handle interactions
client.on('interactionCreate', async (interaction : Interaction) => {
  // we try and use our Collection of command handlers for slash commands
  if (interaction.isCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    }
    catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
  // handle setting a new directory
  } else if (interaction.isSelectMenu()) {
    // validate the interaction
    if (!interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
      await interaction.reply({ content: 'You must have administrator privileges to set a new directory.', ephemeral: true });
      return;
    }
    const guild = interaction.guild?.id;
    const channel = await client.channels.fetch(interaction.values[0])
      .catch(async error => {
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
        return; 
    });
    if (!channel || !guild) return;
    if (channel.type !== 'GUILD_TEXT') return;
    // delete all our messages in the old directory.
    const oldDirectory = await directories.get(guild);
    let deletionError = '';
    if (oldDirectory) {
      deletionError = await deleteDirectoryMessages(client, oldDirectory);
    }
    // create the new directory
    const newDirectory = {
      messageIds: [],
      channelId: channel.id,
    }
    try {
      await makeEmptyDirectoryMessage(interaction, client, newDirectory)
      await directories.set(guild, newDirectory);
      await interaction.reply({ content: 'Directory set successfully.' + deletionError, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Something went wrong; no new directory created.', ephemeral: true });
    }
  } else {return;}
});

client.login(token);