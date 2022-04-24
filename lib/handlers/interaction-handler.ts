import { Collection, CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';
import Keyv from 'keyv';
import { Command, Directory, Executable, MenuHandler } from '../types';

// this function just matches an interaction to the right type of handler
export async function interactionHandler (interaction : Interaction, commands : Collection<string, Command>, menuHandlers : Collection<string, MenuHandler>, directories:Keyv<Directory>) {
  if (interaction.isCommand()) {
    await commandHandler(interaction, commands);
  } else if (interaction.isSelectMenu()) {
    await selectMenuHandler(interaction, menuHandlers, directories);
  }
}

// interacting with menus, buttons, slash commands, etc. produces similar but slightly different 'interactions' in the discord.js library
// we use this function to specify how to deal with a specific type of interaction
// in particular, each type of interaction has a slightly different way of getting the 'name' of the interaction, for which we provide an indexFunction
// each type of interaction also has a slightly different way of error handling, for which we provide an errorHandler
async function executablesHandler<i> (interaction : i, executables : Collection<string, Executable<i>>, indexFunction : (_interaction : i) => string, errorHandler : (_error : unknown) => Promise<void>, directories?:Keyv<Directory>) {
  const command = executables.get(indexFunction(interaction));
  if (!command) return;
  await command.execute(interaction, directories)
    .catch(errorHandler);
}

async function commandHandler (interaction : CommandInteraction, commands : Collection<string, Command>) {
  await executablesHandler(
    interaction,
    commands,
    (i : CommandInteraction) => i.commandName,
    async (err : unknown) => {console.error(err); await interaction.reply({ content: 'Something went wrong.', ephemeral: true });},
  );
}

async function selectMenuHandler (interaction : SelectMenuInteraction, menuHandlers : Collection <string, MenuHandler>, directories : Keyv<Directory>) {
  await executablesHandler(
    interaction,
    menuHandlers,
    (i : SelectMenuInteraction) => i.customId,
    async (err : unknown) => {console.error(err); await interaction.reply({ content: 'Something went wrong.', ephemeral: true });},
    directories,
  );
}