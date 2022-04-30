import Keyv from 'keyv';
import { Directory } from '../lib/types';

import { executeSetDirectoryMenu } from '../lib/menus/set-directory-menu';
import { SelectMenuInteraction } from 'discord.js';

const unauthorizedInteraction = ({
  reply: jest.fn(res => res.content),
}as unknown) as SelectMenuInteraction;
const guildlessInteraction = ({
  reply: jest.fn(res => res.content),
  memberPermissions: {
    has: jest.fn(() => true),
  },
}as unknown) as SelectMenuInteraction;
const badChannel = {
  type: 'GUILD_NEWS',
};
const badChannelInteraction = ({
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
}as unknown) as SelectMenuInteraction;
const goodChannel = {
  type: 'GUILD_TEXT',
  send: jest.fn(() => '1'),
  id: '1',
};
const goodChannelInteraction = ({
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
}as unknown) as SelectMenuInteraction;
const directories = new Keyv();
const directory : Directory = {
  channelId: '1',
  messageIds: [],
};
directories.set('1', directory);

describe('Setting a menu directory', () => {
  it('Should not work for users without administrator privileges', async () => {
    await executeSetDirectoryMenu(unauthorizedInteraction, directories)
      .catch(() => {
        expect(unauthorizedInteraction.reply).toReturnWith('You must have administrator privileges to set a new directory.');
      });
  });
  it('Should only work in a guild', async () => {
    await expect(executeSetDirectoryMenu(guildlessInteraction, directories)).rejects.toThrow('bad set-directory menu interaction: no guild');
  });
  it('Should only work with a text channel', async () => {
    await expect(executeSetDirectoryMenu(badChannelInteraction, directories)).rejects.toThrow('bad set-directory menu interaction: invalid channel');
  });
  it('Can possibly work', async () => {
    await executeSetDirectoryMenu(goodChannelInteraction, directories)
      .catch((err:unknown) => console.error(err));
    expect(goodChannelInteraction.reply).toReturnWith('Directory set successfully.');
  });
});