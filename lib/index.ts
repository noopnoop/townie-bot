import { Client, Intents, Interaction } from 'discord.js';
import { Games, Listings, PlayerDB } from './types';
import { token } from './config.json';
import { executeNewGame } from './commands/new-game';
import { executeDeleteGame } from './commands/delete-game';
import { executeJoinGameButton } from './buttons/join-game-button';
import { normalize } from './types/normal-interaction';
import { executeLeaveGame } from './commands/leave-game';

const client = new Client ({ intents: [Intents.FLAGS.GUILDS] });

const listings : Listings = new Map();
const games : Games = new Map();
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
      await executeNewGame(interaction, listings, players, games).catch(err => console.error(err));
      return;
    case 'delete-game':
      await executeDeleteGame(interaction, listings).catch(err => console.error(err));
      return;
    case 'leave-game':
      await executeLeaveGame(interaction, players, listings).catch(err => console.error(err));
      return;
    }
  } else if (interaction.isButton()) {
    switch (interaction.customId.split('/')[0]) {
    case 'join-game':
      await executeJoinGameButton(interaction, listings, players, games).catch(err => console.error(err));
      return;
    }
  }
});
client.login(token);