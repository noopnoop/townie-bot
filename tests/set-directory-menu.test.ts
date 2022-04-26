const { execute } = require('../lib/menus/set-directory-menu.ts');

const unauthorizedInteraction = {
  reply: jest.fn(res => res.content),
};
const guildlessInteraction = {
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
};
const badChannel = {
  type: 'GUILD_NEWS',
};
const badChannelInteraction = {
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
  guild: {
    id: '1',
    channels: {
      fetch: jest.fn(() => badChannel),
    },
  },
  values: ['1'],
};
const goodChannel = {
  type: 'GUILD_TEXT',
  send: jest.fn(() => '1'),
  id: '1',
};
const goodChannelInteraction = {
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
  guild: {
    id: '1',
    channels: {
      fetch: jest.fn(() => goodChannel),
    },
  },
  values: ['1'],
};
const directories = {
  get: jest.fn(),
  set: jest.fn(),
};


describe('Setting a menu directory', () => {
  it('Should not work for users without administrator privileges', async () => {
    await execute(unauthorizedInteraction)
      .catch(() => {
        expect(unauthorizedInteraction.reply).toReturnWith('You must have administrator privileges to set a new directory.');
      });
  });
  it('Should only work in a guild', async () => {
    await expect(execute(guildlessInteraction)).rejects.toThrow('bad set-directory menu interaction: no guild');
  });
  it('Should only work with a text channel', async () => {
    await expect(execute(badChannelInteraction)).rejects.toThrow('bad set-directory menu interaction: invalid channel');
  });
  it('Can possibly work', async () => {
    await execute(goodChannelInteraction, directories)
      .catch((err:unknown) => console.error(err));
    expect(goodChannelInteraction.reply).toReturnWith('Directory set successfully.');
  });
});