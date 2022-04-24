import { SelectMenuInteraction, Permissions } from 'discord.js';
import Keyv from 'keyv';
import { deleteDirectoryMessages, makeEmptyDirectoryMessage } from '../directory';
import { Directory } from '../types';

module.exports = {

  name : 'set-directory',

  async execute (interaction : SelectMenuInteraction, directories : Keyv<Directory>) {
    // validate the interaction
    if (!interaction.memberPermissions || !interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      await interaction.reply({ content: 'You must have administrator privileges to set a new directory.', ephemeral: true });
      return;
    }
    const guild = interaction.guild;
    if (!guild) return;
    const channel = await guild.channels.fetch(interaction.values[0])
      .catch(async error => {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
        return;
      });
    if (!channel || !guild) return;
    if (channel.type !== 'GUILD_TEXT') return;
    // delete all our messages in the old directory.
    const oldDirectory = await directories.get(guild.id);
    let deletionError = '';
    if (oldDirectory) {
      deletionError = await deleteDirectoryMessages(guild, oldDirectory);
    }
    // create the new directory
    const newDirectory = {
      messageIds: [],
      channelId: channel.id,
    };
    await makeEmptyDirectoryMessage(guild, newDirectory);
    await directories.set(guild.id, newDirectory);
    await interaction.reply({ content: 'Directory set successfully.' + deletionError, ephemeral: true });
  },
};