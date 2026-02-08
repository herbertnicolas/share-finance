import { supabase } from './supabase';
import type {
  Expense,
  ExpenseWithPayer,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '@/types';

/**
 * Cria uma nova despesa
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: input.group_id,
      paid_by_user_id: input.paid_by_user_id,
      description: input.description,
      amount: input.amount,
      category: input.category || 'other',
      split_percentage: input.split_percentage ?? 50,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar despesa:', error);
    return null;
  }

  return data;
}

/**
 * Busca despesas de um grupo com paginação
 */
export async function getGroupExpenses(
  groupId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<ExpenseWithPayer[]> {
  const { limit = 20, offset = 0 } = options;

  const { data, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      payer:group_members!paid_by_user_id (
        display_name,
        avatar_initial
      )
    `
    )
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Erro ao buscar despesas:', error);
    return [];
  }

  // Transforma o resultado para o formato esperado
  return (data || []).map((expense) => ({
    ...expense,
    payer: Array.isArray(expense.payer) ? expense.payer[0] : expense.payer,
  }));
}

/**
 * Busca uma despesa por ID
 */
export async function getExpenseById(
  expenseId: string
): Promise<ExpenseWithPayer | null> {
  const { data, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      payer:group_members!paid_by_user_id (
        display_name,
        avatar_initial
      )
    `
    )
    .eq('id', expenseId)
    .single();

  if (error) {
    console.error('Erro ao buscar despesa:', error);
    return null;
  }

  return {
    ...data,
    payer: Array.isArray(data.payer) ? data.payer[0] : data.payer,
  };
}

/**
 * Atualiza uma despesa
 */
export async function updateExpense(
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar despesa:', error);
    return null;
  }

  return data;
}

/**
 * Deleta uma despesa
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Erro ao deletar despesa:', error);
    return false;
  }

  return true;
}

/**
 * Conta o total de despesas de um grupo
 */
export async function countGroupExpenses(groupId: string): Promise<number> {
  const { count, error } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  if (error) {
    console.error('Erro ao contar despesas:', error);
    return 0;
  }

  return count || 0;
}
