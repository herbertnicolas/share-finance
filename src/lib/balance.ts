import { supabase } from './supabase';
import type { BalanceSummary, GroupMember } from '@/types';

/**
 * Calcula o saldo entre o usuário e seu parceiro no grupo
 */
export async function calculateBalance(
  groupId: string,
  userId: string
): Promise<BalanceSummary | null> {
  // Busca todos os membros do grupo
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId);

  if (membersError || !members || members.length < 2) {
    console.log('Grupo sem parceiro ainda');
    return null;
  }

  // Encontra o parceiro (o outro membro que não é o usuário atual)
  const partner = members.find((m) => m.user_id !== userId);
  if (!partner) {
    return null;
  }

  // Busca todas as despesas do grupo
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId);

  if (expensesError) {
    console.error('Erro ao buscar despesas:', expensesError);
    return null;
  }

  // Calcula o saldo
  // Positivo = parceiro deve para você
  // Negativo = você deve para o parceiro
  let balance = 0;

  for (const expense of expenses || []) {
    // Quanto da despesa é do parceiro (a parte que ele deve)
    const partnerShare =
      expense.amount * ((100 - expense.split_percentage) / 100);
    // Quanto da despesa é sua
    const yourShare = expense.amount * (expense.split_percentage / 100);

    if (expense.paid_by_user_id === userId) {
      // Você pagou, então o parceiro te deve a parte dele
      balance += partnerShare;
    } else {
      // O parceiro pagou, então você deve a sua parte
      balance -= yourShare;
    }
  }

  // Arredonda para 2 casas decimais
  balance = Math.round(balance * 100) / 100;

  // Determina o status
  let status: BalanceSummary['status'];
  if (balance > 0) {
    status = 'they_owe'; // Parceiro te deve
  } else if (balance < 0) {
    status = 'you_owe'; // Você deve pro parceiro
  } else {
    status = 'settled'; // Estão quites
  }

  return {
    partnerId: partner.user_id,
    partnerName: partner.display_name,
    partnerInitial: partner.avatar_initial,
    balance: Math.abs(balance), // Valor absoluto para exibição
    status,
  };
}

/**
 * Formata o valor em reais
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Retorna a mensagem de saldo para exibição
 */
export function getBalanceMessage(balance: BalanceSummary): string {
  const formattedValue = formatCurrency(balance.balance);

  switch (balance.status) {
    case 'you_owe':
      return `Você deve ${formattedValue} para ${balance.partnerName}`;
    case 'they_owe':
      return `${balance.partnerName} te deve ${formattedValue}`;
    case 'settled':
      return 'Tudo acertado! 🎉';
  }
}
