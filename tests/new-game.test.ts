import Keyv from "keyv";
import { Directory } from "../lib/types";

const {execute} = require('../lib/commands/new-game.ts');

const guildlessInteraction = {
  reply : jest.fn((res) => res.content)
}
const optionlessInteraction = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1'
  },
  options: {
    get: jest.fn()
  }
}
const tooManyPlayers = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1'
  },
  options: {
    get : jest.fn(() => {return 500;})
  }
}
const namelessInteraction = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1'
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17};
      }
    })
  }
}
const tooShortName = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1'
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return { value: 17};
      } else if (x === 'game-name') {
        return {value: 'a'};
      }
    })
  }
}
const creatorlessInteraction = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1'
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return {value: 17};
      } else if (x === 'game-name') {
        return {value: 'mygame'};
      }
    })
  }
}
const properInteraction = {
  reply : jest.fn((res) => res.content),
  guild : {
    id : '1',
    channels : {
      fetch : jest.fn(() => {return channel;})
    }
  },
  options: {
    get : jest.fn((x) => {
      if (x === 'players') {
        return {value: 17};
      } else if (x === 'game-name') {
        return {value: 'mygame'};
      }
    })
  },
  member: {
    user : {
      username: 'steven'
    }
  }
}
const channel = {
  type: "GUILD_TEXT",
  send: jest.fn(() => {return message})
}
const message = {
  id : '1'
}
const directories = new Keyv();
const emptyDirectories = new Keyv();
const directory : Directory = {
  channelId: '1',
  messageIds: [],
};
directories.set('1',directory);

describe('A valid new-game interaction', () => {
  it('Must take place in a guild', async () => {
    await expect(execute(guildlessInteraction, directories)).rejects.toThrow('bad new-game interaction: not in a guild');
  })
  it('The guild must have a directory set', async () => {
    await expect(execute(optionlessInteraction, emptyDirectories)).rejects.toThrow('bad new-game interaction: no directory');
  })
  it('Should include a "players" option', async () => {
    await expect(execute(optionlessInteraction, directories)).rejects.toThrow('bad new-game interaction: bad number of players')
  });
  it('The number of players must be between 5 and 20', async () => {
    await expect(execute(tooManyPlayers, directories)).rejects.toThrow('bad new-game interaction: bad number of players')
  })
  it('Should include a "game-name" option', async () => {
    await expect(execute(namelessInteraction, directories)).rejects.toThrow('bad new-game interaction: bad game name');
  });
  it('The game name should be between 5 and 30 characters long', async () => {
    await expect(execute(tooShortName, directories)).rejects.toThrow('bad new-game interaction: bad game name');
  })
  it('The game must have a creator', async () => {
    await expect(execute(creatorlessInteraction, directories)).rejects.toThrow('bad new-game interaction: invalid creator');
  })
  it('Can succeed', async () => {
    await execute(properInteraction, directories);
    expect (properInteraction.reply).toReturnWith('New game "mygame" created successfully.')
  })
});
