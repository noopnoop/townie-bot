import { Interaction } from 'discord.js';
import { NormalInteraction, NormalMember } from '../types';

export function normalize (interaction : Interaction) : (NormalInteraction | undefined) {
  const guild = interaction.guild;
  if (!guild) return;
  const channel = interaction.channel;
  if (!channel || channel.type !== 'GUILD_TEXT') return;
  const member = interaction.member;
  if ((member as NormalMember).displayName === undefined) return;
  return (interaction as NormalInteraction);
}