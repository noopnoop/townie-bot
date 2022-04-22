import fs from 'node:fs';
import { Client, Collection, Intents, Interaction } from 'discord.js';
const { token } = require('../config.json');

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const commands : Collection<String, any> = new Collection();
const commandFiles = fs.readdirSync('./lib/commands').filter((file:String) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./lib/events').filter((file:String) => file.endsWith('.ts'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args : any[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args : any[]) => event.execute(...args));
  }
}

client.once('ready', () => {
  console.log('howdy');
});

client.on('interactionCreate', async (interaction : Interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  }
  catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
  }
});

client.login(token);