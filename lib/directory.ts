import { Guild, MessageOptions, MessagePayload } from 'discord.js';
import { Directory } from './types';

// makes a new message, updates the directory object to hold the new message id, and returns the message.
export async function makeDirectoryMessage (guild : Guild, directory : Directory, message: string | MessagePayload | MessageOptions) {
  const channel = await guild.channels.fetch(directory.channelId);
  if (channel && channel.type === 'GUILD_TEXT') {
    const newMessage = await channel.send(message);
    directory.messageIds.push(newMessage.id);
    return newMessage;
  } else {
    throw new Error('couldnt make directory: invalid channel');
  }
}

export async function makeEmptyDirectoryMessage (guild : Guild, directory : Directory) {
  return makeDirectoryMessage(guild, directory,
    'There are currently no games of mafia in progress. You can use the command "/new-game" to make one.',
  );
}

// delete the messages in a directory. returns an empty string if everything goes well; if theres an error, returns a string with user-facing info.
// errors are likely just the result of someone having already deleted some messages.
export async function deleteDirectoryMessages (guild : Guild, directory : Directory) {
  let deletionError = '';
  try {
    const oldChannel = await guild.channels.fetch(directory.channelId);
    if (oldChannel && oldChannel.type === 'GUILD_TEXT') {
      for (const messageId of directory.messageIds) {
        const oldMessage = await oldChannel.messages.fetch(messageId);
        await oldMessage.delete();
      }
    } else {throw new Error('couldnt delete directory: invalid channel');}
  } catch (error) {
    // if any of those fetches fail it probably means the old directory channel / messages got deleted, which is fine
    deletionError = ' However, something went wrong when deleting the messages created by this bot in the old directory. This likely means they were already deleted somehow, but you might have to go back and delete them manually.';
  }
  directory.messageIds = [];
  return deletionError;
}