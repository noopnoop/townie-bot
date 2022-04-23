import fs from 'node:fs';
import { Client, Collection, Intents, Interaction, Permissions, TextChannel } from 'discord.js';
import Keyv from 'keyv';
import { makeDirectoryMessage } from './directory';
const { token } = require('../config.json');

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const directories = new Keyv('sqlite://directories.sqlite');

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
    // validate the interaction
    if (!interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) return;
    const guild = interaction.guild?.id;
    const channel = await client.channels.fetch(interaction.values[0]);
    if (!channel || !guild) return;
    if (channel.type !== 'GUILD_TEXT') return;
    // delete the old directory, if it exists
    const oldDirectory = await directories.get(guild);
    if (oldDirectory) {
      try {
        const oldChannel = await client.channels.fetch(oldDirectory.channelId);
        if (oldChannel instanceof TextChannel) {
          const oldMessage = await oldChannel.messages.fetch(oldDirectory.messageId);
          await oldMessage.delete();
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Something went wrong when deleting the old directory. You may have to delete it manually.', ephemeral: true });
      }
    }
    // create the new directory
    try {
      const directoryMessage = await channel.send(makeDirectoryMessage());
      await directories.set(guild, {
        messageId: directoryMessage.id,
        channelId: channel.id,
      });
      await interaction.reply({ content: 'Directory set successfully.', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Something went wrong; no new directory created.', ephemeral: true });
    }
  } else {return;}
});

client.login(token);