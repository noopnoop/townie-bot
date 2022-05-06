import { Guild, Message } from 'discord.js';
import Keyv from 'keyv';
import { addMessageIdToDirectory, deleteDirectoryMessages, postDirectoryMessage, postEmptyDirectoryMessage } from '../lib/types/directory';
import { Directory } from '../lib/types';

const guild = ({
  id: '1',
  channels: {
    fetch: jest.fn(() => channel),
  },
} as unknown) as Guild;
const directories = new Keyv();
const directory : Directory = {
  channelId: '1',
  messageIds: [],
};
directories.set('1', directory);
const channel = {
  id: '1',
  type: 'GUILD_TEXT',
  send: jest.fn(() => message),
  messages: {
    fetch: jest.fn(() => message),
  },
};
const message = ({
  id: '1',
  delete: jest.fn(),
} as unknown) as Message;
const badGuild = ({
  id: '1',
  channels: {
    fetch: jest.fn(() => badChannel),
  },
} as unknown) as Guild;
const badChannel = {
  type: 'GUILD_NEWS',
};

// describe('Adding a message to a directory', () => {
//   it('Should be able to succeed', async () => {
//     await addMessageIdToDirectory(guild,directories,'1');
//     expect(directories.get('1')).toBe()
//   });
// })

describe('Making a directory message', () => {
  it('Should return a message', async () => {
    expect(await postDirectoryMessage(guild, directories, '')).toBe(message);
  });
  it('Shouldn\'t work for non-text channels', async () => {
    await expect(postDirectoryMessage(badGuild, directories, '')).rejects.toThrow();
  });
});

describe('Making a directory message when there\'s no games in progress', () => {
  it('Should return a message', async () => {
    expect(await postEmptyDirectoryMessage(guild, directories)).toBe(message);
  });
  it('Shouldn\'t work for non-text channels', async () => {
    await expect(postEmptyDirectoryMessage(badGuild, directories)).rejects.toThrow();
  });
});

describe('Deleting the messages in a directory', () => {
  it('Should delete', async () => {
    await deleteDirectoryMessages(guild, directories);
    expect(message.delete).toBeCalled();
  });
  it('Returns an error message for non-text channels', async () => {
    await expect(deleteDirectoryMessages(badGuild, directories)).resolves.not.toBe('');
  });
});