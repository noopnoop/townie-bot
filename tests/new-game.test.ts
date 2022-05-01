import Keyv from 'keyv';
import { Directory, GameDB } from '../lib/types';

import { executeNewGame } from '../lib/commands/new-game';
import { CommandInteraction } from 'discord.js';

const guildlessInteraction = ({
  reply : jest.fn((res) => res.content),
} as unknown) as CommandInteraction;
const optionlessInteraction = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
  },
  options: {
    get: jest.fn(),
  },
} as unknown) as CommandInteraction;
const tooManyPlayers = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
  },
  options: {
    get : jest.fn(() => {return 500;}),
  },
}as unknown) as CommandInteraction;
const namelessInteraction = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17 };
      }
    }),
  },
}as unknown) as CommandInteraction;
const tooShortName = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17 };
      } else if (x === 'game-name') {
        return { value: 'a' };
      }
    }),
  },
}as unknown) as CommandInteraction;
const creatorlessInteraction = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17 };
      } else if (x === 'game-name') {
        return { value: 'mygame' };
      }
    }),
  },
}as unknown) as CommandInteraction;
const properInteraction = ({
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
    channels : {
      fetch : jest.fn(() => {return channel;}),
    },
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17 };
      } else if (x === 'game-name') {
        return { value: 'mygame' };
      }
    }),
  },
  member: {
    user : {
      username: 'steven',
      id : '1',
    },
  },
}as unknown) as CommandInteraction;
const channel = {
  type: 'GUILD_TEXT',
  send: jest.fn(() => {return message;}),
};
const message = {
  id : '1',
};
const directories = new Keyv();
const emptyDirectories = new Keyv();
const directory : Directory = {
  channelId: '1',
  messageIds: [],
};
directories.set('1', directory);
const games : GameDB = new Map();

describe('A valid new-game interaction', () => {
  it('Must take place in a guild', async () => {
    await expect(executeNewGame(guildlessInteraction, directories, games)).rejects.toThrow('bad new-game interaction: not in a guild');
  });
  it('The guild must have a directory set', async () => {
    await expect(executeNewGame(optionlessInteraction, emptyDirectories, games)).rejects.toThrow('bad new-game interaction: no directory');
  });
  it('Should include a "players" option', async () => {
    await expect(executeNewGame(optionlessInteraction, directories, games)).rejects.toThrow('bad new-game interaction: bad number of players');
  });
  it('The number of players must be between 5 and 20', async () => {
    await expect(executeNewGame(tooManyPlayers, directories, games)).rejects.toThrow('bad new-game interaction: bad number of players');
  });
  it('Should include a "game-name" option', async () => {
    await expect(executeNewGame(namelessInteraction, directories, games)).rejects.toThrow('bad new-game interaction: bad game name');
  });
  it('The game name should be between 5 and 30 characters long', async () => {
    await expect(executeNewGame(tooShortName, directories, games)).rejects.toThrow('bad new-game interaction: bad game name');
  });
  it('The game must have a creator', async () => {
    await expect(executeNewGame(creatorlessInteraction, directories, games)).rejects.toThrow('bad new-game interaction: invalid creator');
  });
  it('Can succeed', async () => {
    await executeNewGame(properInteraction, directories, games);
    expect (properInteraction.reply).toReturnWith('New game "mygame" created successfully.');
  });
  it('Should limit to one game per player', async () => {
    const gamesAgain = new Map();
    await executeNewGame(properInteraction, directories, gamesAgain);
    await expect(executeNewGame(properInteraction, directories, gamesAgain)).rejects.toThrow('bad new-game interaction: user already created game');
  });
});
