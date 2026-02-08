// =============================================
// Tipos do Banco de Dados - Lovinance
// =============================================

/**
 * Categorias de despesa disponíveis
 */
export type ExpenseCategory =
  | 'food'           // Alimentação (restaurantes, delivery)
  | 'groceries'      // Supermercado
  | 'transport'      // Transporte (uber, gasolina)
  | 'entertainment'  // Entretenimento (cinema, shows)
  | 'shopping'       // Compras gerais
  | 'bills'          // Contas (luz, água, internet)
  | 'health'         // Saúde (farmácia, consultas)
  | 'travel'         // Viagens
  | 'other';         // Outros

/**
 * Papel do membro no grupo
 */
export type MemberRole = 'owner' | 'member';

/**
 * Grupo (Casal)
 */
export interface Group {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

/**
 * Dados para criar um novo grupo
 */
export interface CreateGroupInput {
  name: string;
}

/**
 * Membro de um grupo
 */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  display_name: string;
  avatar_initial: string;
  role: MemberRole;
  created_at: string;
}

/**
 * Dados para criar um membro
 */
export interface CreateGroupMemberInput {
  group_id: string;
  user_id: string;
  display_name: string;
  avatar_initial?: string;
  role?: MemberRole;
}

/**
 * Despesa
 */
export interface Expense {
  id: string;
  group_id: string;
  paid_by_user_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  split_percentage: number;
  created_at: string;
  updated_at: string;
}

/**
 * Despesa com dados do pagador (para exibição)
 */
export interface ExpenseWithPayer extends Expense {
  payer: {
    display_name: string;
    avatar_initial: string;
  };
}

/**
 * Dados para criar uma nova despesa
 */
export interface CreateExpenseInput {
  group_id: string;
  paid_by_user_id: string;
  description: string;
  amount: number;
  category?: ExpenseCategory;
  split_percentage?: number;
}

/**
 * Dados para atualizar uma despesa
 */
export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  split_percentage?: number;
}

/**
 * Resumo do saldo entre parceiros
 */
export interface BalanceSummary {
  /** ID do parceiro */
  partnerId: string;
  /** Nome do parceiro */
  partnerName: string;
  /** Inicial do avatar do parceiro */
  partnerInitial: string;
  /**
   * Saldo líquido:
   * - Positivo: parceiro deve para você
   * - Negativo: você deve para o parceiro
   * - Zero: estão quites
   */
  balance: number;
  /** Status do saldo para UI */
  status: 'you_owe' | 'they_owe' | 'settled';
}

/**
 * Resultado da busca de grupo por código
 */
export interface GroupSearchResult {
  id: string;
  name: string;
  member_count: number;
}
