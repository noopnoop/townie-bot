import { SelectMenuInteraction, Permissions } from 'discord.js';
import Keyv from 'keyv';
import { deleteDirectoryMessages, makeEmptyDirectoryMessage } from '../directory';
import { Directory } from '../types';

// makes sure the interaction corresponds to a valid guild and channel.
// if not, we error out and stop trying to set our directory.
// if so, return the guild and channel.
async function validateInteraction (interaction : SelectMenuInteraction) {
  if (!interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
    await interaction.reply({ content: 'You must have administrator privileges to set a new directory.', ephemeral: true });
    throw new Error('bad set-directory menu interaction: not an administrator');
  }
  const guild = interaction.guild;
  if (!guild) throw new Error('bad set-directory menu interaction: no guild');
  const selectedChannel = interaction.values[0];
  const channel = await guild.channels.fetch(selectedChannel);
  if (!channel || channel.type !== 'GUILD_TEXT') throw new Error('bad set-directory menu interaction: invalid channel');
  return { guild, channel };
}

module.exports = {

  name : 'set-directory',

  async execute (interaction : SelectMenuInteraction, directories : Keyv<Directory>) {
    const { guild, channel } = await validateInteraction(interaction);
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