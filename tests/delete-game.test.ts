import { CommandInteraction } from 'discord.js';
import Keyv from 'keyv';
import { executeDeleteGame } from '../lib/commands/delete-game';
import { Directory, GameListing, GuildId, PlayerId } from '../lib/types';

const playerlessInteraction = ({

} as unknown) as CommandInteraction;
const guildlessInteraction = ({
  member: {
    user: {
      id: '1',
    },
  },
} as unknown) as CommandInteraction;
const emptyGamesInteraction = ({
  member: {
    user: {
      id: '1',
    },
  },
  guild: {
    id: '1',
    channels: {
      fetch: jest.fn(() => channel),
    },
  },
  reply: jest.fn(res => res.content),
} as unknown) as CommandInteraction;
const directories = new Keyv<Directory>();
const emptyGames = new Map<GuildId, Map<PlayerId, GameListing>>();
const games = new Map<GuildId, Map<PlayerId, GameListing>>();
const listings = new Map<PlayerId, GameListing>();
const listing = ({
  messageId : '1',
} as unknown) as GameListing;
const directory : Directory = {
  channelId: '1',
  messageIds: ['1'],
};
const channel = {
  type: 'GUILD_TEXT',
  send: jest.fn(() => message),
  messages: {
    fetch: jest.fn(() => message),
  },
};
const message = {
  id: '1',
  delete: jest.fn(),
};
listings.set('1', listing);
games.set('1', listings);
directories.set('1', directory);

describe('The delete-game command', () => {
  it('Must correspond to a discord user', async () => {
    await expect(executeDeleteGame(playerlessInteraction, directories, emptyGames)).rejects.toThrow('bad delete-game interaction: no guild or player');
  });
  it('Must correspond to a discord guild', async () => {
    await expect(executeDeleteGame(guildlessInteraction, directories, emptyGames)).rejects.toThrow('bad delete-game interaction: no guild or player');
  });
  it('Can handle a missing message', async () => {
    await executeDeleteGame(emptyGamesInteraction, directories, emptyGames);
    expect(emptyGamesInteraction.reply).toReturnWith('Something went wrong. The directory message for this game was likely already deleted, but if not, you may have to delete it manually.');
  });
  it('Can succeed', async () => {
    await executeDeleteGame(emptyGamesInteraction, directories, games);
    expect(emptyGamesInteraction.reply).toReturnWith('Message deleted.');
  });
});