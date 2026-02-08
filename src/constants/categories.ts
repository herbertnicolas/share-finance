import { LucideIcon } from 'lucide-react-native';
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Film,
  ShoppingBag,
  Receipt,
  Heart,
  Plane,
  HelpCircle,
} from 'lucide-react-native';
import type { ExpenseCategory } from '@/types';

/**
 * Mapeamento de categorias para ícones Lucide
 */
export const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  food: UtensilsCrossed,
  groceries: ShoppingCart,
  transport: Car,
  entertainment: Film,
  shopping: ShoppingBag,
  bills: Receipt,
  health: Heart,
  travel: Plane,
  other: HelpCircle,
};

/**
 * Mapeamento de categorias para labels em português
 */
export const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Alimentação',
  groceries: 'Supermercado',
  transport: 'Transporte',
  entertainment: 'Entretenimento',
  shopping: 'Compras',
  bills: 'Contas',
  health: 'Saúde',
  travel: 'Viagem',
  other: 'Outros',
};

/**
 * Lista de todas as categorias para seleção
 */
export const expenseCategories: ExpenseCategory[] = [
  'food',
  'groceries',
  'transport',
  'entertainment',
  'shopping',
  'bills',
  'health',
  'travel',
  'other',
];
