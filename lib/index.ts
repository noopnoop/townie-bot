import { Client, Intents, Interaction } from 'discord.js';
import Keyv from 'keyv';
import { Directory, GameDB, PlayerDB } from './types';
import { token } from './config.json';
import { executeNewGame } from './commands/new-game';
import { executeSetDirectory } from './commands/set-directory';
import { executeSetDirectoryMenu } from './menus/set-directory-menu';
import { executeDeleteGame } from './commands/delete-game';
import { executeJoinGameButton } from './buttons/join-game-button';
import { normalize } from './types/normal-interaction';
import { executeLeaveGame } from './commands/leave-game';

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

// if you see a Keyv<Directory> in this bot- know that the keys are guild ids.
// basically, this database maps guilds to their mafia game directories.
const directories : Keyv<Directory> = new Keyv('sqlite://directories.sqlite');
const games : GameDB = new Map();
const players : PlayerDB = new Map();

client.once('ready', () => console.log('Up and running'));
client.on('interactionCreate', async (rawInteraction : Interaction) => {
  const interaction = normalize(rawInteraction);
  if (!interaction) {
    return;
  }
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
    case 'new-game':
      await executeNewGame(interaction, directories, games, players).catch(err => console.error(err));
      return;
    case 'delete-game':
      await executeDeleteGame(interaction, directories, games).catch(err => console.error(err));
      return;
    case 'set-directory':
      await executeSetDirectory(interaction).catch(err => console.error(err));
      return;
    case 'leave-game':
      await executeLeaveGame(interaction, players, games, directories).catch(err => console.error(err));
      return;
    }
  } else if (interaction.isSelectMenu()) {
    switch (interaction.customId) {
    case 'set-directory-menu':
      await executeSetDirectoryMenu(interaction, directories).catch(err => console.error(err));
      return;
    }
  } else if (interaction.isButton()) {
    switch (interaction.customId.split('/')[0]) {
    case 'join-game':
      await executeJoinGameButton(interaction, games, players).catch(err => console.error(err));
      return;
    }
  }
});
client.login(token);