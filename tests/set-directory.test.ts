import { Collection, CommandInteraction, NonThreadGuildBasedChannel } from 'discord.js';
import { executeSetDirectory } from '../lib/commands/set-directory';

const interaction = ({
  guild: {
    channels: {
      fetch: jest.fn(() => channels),
    },
  },
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
} as unknown) as CommandInteraction;
const channels = new Collection<string, NonThreadGuildBasedChannel>();
const textChannel = ({
  type: 'GUILD_TEXT',
  name: 'nice channel',
  id: '1',
} as unknown) as NonThreadGuildBasedChannel;
const badChannel = ({
  type: 'GUILD_NEWS',
} as unknown) as NonThreadGuildBasedChannel;
channels.set('good', textChannel);
channels.set('bad', badChannel);
const dmInteraction = ({
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
} as unknown) as CommandInteraction;
const unauthorizedInteraction = ({
  memberPermissions: {
    has: jest.fn(() => false),
  },
  reply: jest.fn(res => res.content),
} as unknown) as CommandInteraction;
const sillyInteraction = ({
  reply: jest.fn(res => res.content),
} as unknown) as CommandInteraction;

describe ('Getting the channels from an interaction', () => {
  it('Should not work for non-guild interactions', async () => {
    await expect(executeSetDirectory(dmInteraction)).rejects.toThrow();
  });
});

describe ('The /set-directory command', () => {
  it('Should require administrator privileges', async () => {
    await executeSetDirectory(unauthorizedInteraction);
    expect(unauthorizedInteraction.reply).toReturnWith('You must be an admininstrator to use this command.');
  });
  it('Can actually succeed', async () => {
    await executeSetDirectory(interaction);
    expect(interaction.reply).toReturnWith('Choose a text channel to set as this server\'s mafia directory. It is recommended that users apart from the Townie bot do not have permission to type in this channel.');
  });
  it('Rejects badly formed interactions', async () => {
    await executeSetDirectory(sillyInteraction);
    expect(sillyInteraction.reply).toReturnWith('You must be an admininstrator to use this command.');
  });
});