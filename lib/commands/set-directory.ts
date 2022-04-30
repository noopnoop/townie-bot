import { SlashCommandBuilder } from '@discordjs/builders';
import { Permissions, MessageActionRow, MessageSelectMenu, CommandInteraction, NonThreadGuildBasedChannel, Collection } from 'discord.js';

const getChannels = async (interaction : CommandInteraction) => {
  if (interaction.guild) {
    const channels = await interaction.guild.channels.fetch();
    return channels.filter(channel => channel.type === 'GUILD_TEXT');
  }
  interaction.reply('You can only use this command in a guild.');
  throw new Error('bad set-directory interaction: not in a guild');
};

const makeChannelSelect = (channels : Collection<string, NonThreadGuildBasedChannel>) => {
  return new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('set-directory-menu')
        .setPlaceholder('Nothing selected')
        .addOptions(channels.map((channel : NonThreadGuildBasedChannel) => {
          return {
            label: channel.name,
            value: channel.id,
          };
        })),
    );
};

export const setDirectoryData = new SlashCommandBuilder()
  .setName('set-directory')
  .setDescription('Designate a channel to be a directory for mafia games.');

export async function executeSetDirectory (interaction : CommandInteraction) {
  if (interaction.memberPermissions?.has(Permissions.FLAGS.ADMINISTRATOR)) {
    const channelSelect = makeChannelSelect(await getChannels(interaction));
    if (channelSelect) {
      await interaction.reply({ components: [channelSelect], ephemeral: true, content: 'Choose a text channel to set as this server\'s mafia directory. It is recommended that users apart from the Townie bot do not have permission to type in this channel.' });
    }
  } else {
    await interaction.reply({ ephemeral: true, content: 'You must be an admininstrator to use this command.' });
  }
}
