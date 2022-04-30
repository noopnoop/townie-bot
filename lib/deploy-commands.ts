import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, guildId, token } from './config.json';
import { newGameData } from './commands/new-game';
import { setDirectoryData } from './commands/set-directory';

const commands = [];
commands.push(newGameData.toJSON());
commands.push(setDirectoryData.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body : commands })
  .then(() => console.log('Registered application commands.'))
  .catch(console.error);