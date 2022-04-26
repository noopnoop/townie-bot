import { Collection, NonThreadGuildBasedChannel } from 'discord.js';
const { execute, SET_DIRECTORY_HELP } = require('../lib/commands/set-directory.ts');


const interaction = {
  guild: {
    channels: {
      fetch: jest.fn(() => channels),
    },
  },
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
};
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
const dmInteraction = {
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
};
const unauthorizedInteraction = {
  memberPermissions: {
    has: jest.fn(() => false),
  },
  reply: jest.fn(res => res.content),
};
const sillyInteraction = {
  reply: jest.fn(res => res.content),
};

describe ('Getting the channels from an interaction', () => {
  it('Should not work for non-guild interactions', async () => {
    await expect(execute(dmInteraction)).rejects.toThrow();
  });
});

describe ('The /set-directory command', () => {
  it('Should require administrator privileges', async () => {
    await execute(unauthorizedInteraction);
    expect(unauthorizedInteraction.reply).toReturnWith('You must be an admininstrator to use this command.');
  });
  it('Can actually succeed', async () => {
    await execute(interaction);
    expect(interaction.reply).toReturnWith(SET_DIRECTORY_HELP);
  });
  it('Rejects badly formed interactions', async () => {
    await execute(sillyInteraction);
    expect(sillyInteraction.reply).toReturnWith('You must be an admininstrator to use this command.');
  });
});