import { Client, Intents, Interaction } from 'discord.js';
import Keyv from 'keyv';
import { Directory, GameDB } from './types';
import { token } from './config.json';
import { executeNewGame } from './commands/new-game';
import { executeSetDirectory } from './commands/set-directory';
import { executeSetDirectoryMenu } from './menus/set-directory-menu';

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

// if you see a Keyv<Directory> in this bot- know that the keys are guild ids.
// basically, this database maps guilds to their mafia game directories.
const directories : Keyv<Directory> = new Keyv('sqlite://directories.sqlite');
const games : GameDB = new Map();

client.once('ready', () => console.log('Up and running'));
client.on('interactionCreate', (interaction : Interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
    case 'new-game':
      executeNewGame(interaction, directories);
      return;
    case 'set-directory':
      executeSetDirectory(interaction);
      return;
    }
  } else if (interaction.isSelectMenu()) {
    switch (interaction.customId) {
    case 'set-directory-menu':
      executeSetDirectoryMenu(interaction, directories);
      return;
    }
  }
});
client.login(token);