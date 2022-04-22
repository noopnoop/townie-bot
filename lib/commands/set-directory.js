const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageSelectMenu } = require('discord.js');

const getChannels = async (interaction) => {
  const channels = await interaction.member.guild.channels.fetch();
  return channels.filter(channel => channel.type === 'GUILD_TEXT');
};

const makeChannelSelect = async (interaction) => {
  const channels = await getChannels(interaction);
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
  async execute (interaction) {
    if (interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      await interaction.reply({ components: [await makeChannelSelect(interaction)], ephemeral: true, content: 'Choose a text channel to set as this server\'s mafia directory. Ideally, users apart from the Townie bot should not have permission to type in this channel.' });
    } else {
      await interaction.reply({ ephemeral: true, content: 'You must be an admininstrator to use this command.' });
    }
  },
};