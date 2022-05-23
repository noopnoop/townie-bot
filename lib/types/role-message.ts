import { NormalMember } from '../types';

export function makeRoleMessage () {
  return 'You are a **Townie**! You don\'t do anything special during the night. During the day, you will vote with everyone else to kick someone out of the town.\n\nYou are trying to kick the mafia out of town- however, you don\'t know who the mafia are. Do your best to figure out who\'s on your side based on how people act. \n\nYou (and your townie friends) win when all the mafia have been kicked out. The mafia will kill someone every night, and win when all the townies have been killed or kicked out. Good luck!';
}

export async function sendRoleMessage (player : NormalMember) {
  const dm = await player.createDM();
  dm.send(makeRoleMessage());
}