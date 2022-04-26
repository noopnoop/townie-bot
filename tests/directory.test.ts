import { Guild, Message } from 'discord.js';
import { deleteDirectoryMessages, makeDirectoryMessage, makeEmptyDirectoryMessage } from '../lib/directory';
import { Directory } from '../lib/types';

const guild = ({
  id: '1',
  channels: {
    fetch: jest.fn(() => channel),
  },
} as unknown) as Guild;
const directory : Directory = {
  channelId: '1',
  messageIds: [],
};
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

describe('Making a directory message', () => {
  it('Should return a message', async () => {
    expect(await makeDirectoryMessage(guild, directory, '')).toBe(message);
  });
  it('Shouldn\'t work for non-text channels', async () => {
    await expect(makeDirectoryMessage(badGuild, directory, '')).rejects.toThrow();
  });
});

describe('Making a directory message when there\'s no games in progress', () => {
  it('Should return a message', async () => {
    expect(await makeEmptyDirectoryMessage(guild, directory)).toBe(message);
  });
  it('Shouldn\'t work for non-text channels', async () => {
    await expect(makeEmptyDirectoryMessage(badGuild, directory)).rejects.toThrow();
  });
});

describe('Deleting the messages in a directory', () => {
  it('Should delete', async () => {
    await deleteDirectoryMessages(guild, directory);
    expect(message.delete).toBeCalled();
  });
  it('Returns an error message for non-text channels', async () => {
    await expect(deleteDirectoryMessages(badGuild, directory)).resolves.not.toBe('');
  });
});