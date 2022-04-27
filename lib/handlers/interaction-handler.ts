import { Collection, CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';
import Keyv from 'keyv';
import { Command, Directory, Executable, MenuHandler } from '../types';

// this function just matches an interaction to the right type of handler
export async function interactionHandler (
  interaction : Interaction,
  commands : Collection<string, Command>,
  menuHandlers : Collection<string, MenuHandler>,
  directories:Keyv<Directory>,
) {
  if (interaction.isCommand()) {
    await commandHandler(interaction, commands, directories);
  } else if (interaction.isSelectMenu()) {
    await selectMenuHandler(interaction, menuHandlers, directories);
  }
}

// interacting with menus, buttons, slash commands, etc. produces similar but slightly different 'interactions' in the discord.js library
// we use this function to specify how to deal with a specific type of interaction
// in particular, each type of interaction has a slightly different way of getting the 'name' of the interaction, for which we provide an indexFunction
// each type of interaction also has a slightly different way of error handling, for which we provide an errorHandler
async function executablesHandler<InteractionType> (
  interaction : InteractionType,
  executables : Collection<string, Executable<InteractionType>>,
  indexFunction : (_interaction : InteractionType) => string,
  errorHandler : (_error : unknown) => Promise<void>,
  directories? : Keyv<Directory>,
) {
  const command = executables.get(indexFunction(interaction));
  if (!command) return;
  await command.execute(interaction, directories)
    .catch(errorHandler);
}

async function commandHandler (interaction : CommandInteraction, commands : Collection<string, Command>, directories : Keyv<Directory>) {
  await executablesHandler(
    interaction,
    commands,
    (i : CommandInteraction) => i.commandName,
    defaultErrorHandler(interaction),
    directories,
  );
}

async function selectMenuHandler (interaction : SelectMenuInteraction, menuHandlers : Collection <string, MenuHandler>, directories : Keyv<Directory>) {
  await executablesHandler(
    interaction,
    menuHandlers,
    (i : SelectMenuInteraction) => i.customId,
    defaultErrorHandler(interaction),
    directories,
  );
}

function defaultErrorHandler (interaction : CommandInteraction | SelectMenuInteraction) {
  return async (error : unknown) => {
    console.error(error);
    await interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true },
    )
      .catch(() => {return;});
  };
}