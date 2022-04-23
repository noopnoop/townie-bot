import fs from 'node:fs';
import { Client, Collection, Intents, Interaction } from 'discord.js';
import Keyv from 'keyv';
const { token } = require('../config.json');

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const directories = new Keyv('sqlite://../directories.sqlite');

// gather up a Collection of command handlers
const commands : Collection<string, any> = new Collection();
const commandFiles = fs.readdirSync('./lib/commands').filter((file:string) => file.endsWith('.ts'));

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

  } else {return;}
});

client.login(token);