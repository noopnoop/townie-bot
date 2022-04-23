import { Client, CommandInteraction, Interaction, MessageComponentInteraction, MessageOptions, MessagePayload, TextChannel } from 'discord.js';
import { Game, Directory } from './types';

// makes a new message, updates the directory object to hold the new message id, and returns the message.
export async function makeDirectoryMessage (interaction : CommandInteraction | MessageComponentInteraction, client : Client, directory : Directory, message: string | MessagePayload | MessageOptions) {
  const channel = await client.channels.fetch(directory.channelId);
  if (channel instanceof TextChannel) {
    try {
      const newMessage = await channel.send(message);
      directory.messageIds.push(newMessage.id);
      return newMessage;
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Something went wrong when adding a message to a directory. Maybe Townie doesn\'t have permission to text in that channel?', ephemeral: true });
    }
  }
  return undefined;
}

export async function makeEmptyDirectoryMessage (interaction : CommandInteraction | MessageComponentInteraction, client : Client, directory : Directory) { 
  return makeDirectoryMessage(interaction, client, directory,
    'There are currently no games of mafia in progress. You can use the command "/new-game" to make one.'
  );
};

// delete the messages in a directory. returns an empty string if everything goes well; if theres an error, returns a string with user-facing info.
// errors are likely just the result of someone having already deleted some messages.
export async function deleteDirectoryMessages (client : Client, directory : Directory) {
  let deletionError = ''
  try {
    const oldChannel = await client.channels.fetch(directory.channelId);
    if (oldChannel instanceof TextChannel) {
      for (const messageId of directory.messageIds) {
          const oldMessage = await oldChannel.messages.fetch(messageId);
          await oldMessage.delete();
      }
    }
  } catch (error) {
    // if any of those fetches fail it means the old directory channel / messages got deleted, which is fine
    deletionError = ' However, something went wrong when deleting the messages in the old directory. This likely means they were already deleted somehow, but you may have to go back and delete them manually.'
  }
  return deletionError;
};