import { supabase } from './supabase';
import type {
  Group,
  GroupMember,
  CreateGroupInput,
  CreateGroupMemberInput,
  GroupSearchResult,
} from '@/types';

/**
 * Gera um código único de 6 caracteres para convite
 */
function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Cria um novo grupo e adiciona o usuário como owner
 */
export async function createGroup(
  input: CreateGroupInput,
  userId: string,
  userDisplayName: string
): Promise<{ group: Group; member: GroupMember } | null> {
  // Gera código único
  let code = generateGroupCode();
  let attempts = 0;
  const maxAttempts = 5;

  // Tenta gerar um código único (evita colisões)
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('code', code)
      .single();

    if (!existing) break;
    code = generateGroupCode();
    attempts++;
  }

  // Cria o grupo
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: input.name,
      code,
    })
    .select()
    .single();

  if (groupError || !group) {
    console.error('Erro ao criar grupo:', groupError);
    return null;
  }

  // Adiciona o criador como owner
  const { data: member, error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: userId,
      display_name: userDisplayName,
      avatar_initial: userDisplayName.charAt(0).toUpperCase(),
      role: 'owner',
    })
    .select()
    .single();

  if (memberError || !member) {
    console.error('Erro ao adicionar membro:', memberError);
    // Rollback: deleta o grupo criado
    await supabase.from('groups').delete().eq('id', group.id);
    return null;
  }

  return { group, member };
}

/**
 * Busca um grupo pelo código de convite
 */
export async function findGroupByCode(
  code: string
): Promise<GroupSearchResult | null> {
  const { data, error } = await supabase.rpc('find_group_by_code', {
    invite_code: code.toUpperCase(),
  });

  if (error || !data || data.length === 0) {
    console.error('Erro ao buscar grupo:', error);
    return null;
  }

  return data[0];
}

/**
 * Entra em um grupo existente usando o código
 */
export async function joinGroup(
  code: string,
  userId: string,
  displayName: string
): Promise<GroupMember | null> {
  // Busca o grupo pelo código
  const group = await findGroupByCode(code);
  if (!group) {
    return null;
  }

  // Verifica se já é membro
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    console.log('Usuário já é membro deste grupo');
    return null;
  }

  // Adiciona como membro
  const { data: member, error } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: userId,
      display_name: displayName,
      avatar_initial: displayName.charAt(0).toUpperCase(),
      role: 'member',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao entrar no grupo:', error);
    return null;
  }

  return member;
}

/**
 * Busca o grupo do usuário atual
 */
export async function getUserGroup(userId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.groups as unknown as Group;
}

/**
 * Busca os membros de um grupo
 */
export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar membros:', error);
    return [];
  }

  return data || [];
}

/**
 * Atualiza o nome de exibição do membro
 */
export async function updateMemberDisplayName(
  memberId: string,
  displayName: string
): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .update({
      display_name: displayName,
      avatar_initial: displayName.charAt(0).toUpperCase(),
    })
    .eq('id', memberId);

  return !error;
}

/**
 * Sai de um grupo
 */
export async function leaveGroup(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('user_id', userId);

  return !error;
}

/**
 * Busca o membro atual do usuário em seu grupo
 */
export async function getCurrentMember(
  userId: string
): Promise<GroupMember | null> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
