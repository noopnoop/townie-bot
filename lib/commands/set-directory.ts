import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions, MessageActionRow, MessageSelectMenu, CommandInteraction } from 'discord.js';

const getChannels = async (interaction : CommandInteraction) => {
  if (interaction.guild) {
    const channels = await interaction.guild.channels.fetch();
    return channels.filter(channel => channel.type === 'GUILD_TEXT');
  }
};

const makeChannelSelect = async (interaction : CommandInteraction) => {
  const channels = await getChannels(interaction);
  if (channels === undefined) return;
  return new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('set-directory')
        .setPlaceholder('Nothing selected')
        .addOptions(channels.map((channel) => {
          return {
            label: channel.name,
            value: channel.id,
          };
        })),
    );
};

module.exports = {

  data: new SlashCommandBuilder()
    .setName('set-directory')
    .setDescription('Designate a channel to be a directory for mafia games.'),

  async execute (interaction : CommandInteraction) {
    if (interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const channelSelect = await makeChannelSelect(interaction);
      if (channelSelect) {
        await interaction.reply({ components: [channelSelect], ephemeral: true, content: 'Choose a text channel to set as this server\'s mafia directory. It is recommended that users apart from the Townie bot do not have permission to type in this channel.' });
      }
    } else {
      await interaction.reply({ ephemeral: true, content: 'You must be an admininstrator to use this command.' });
    }
  },

};