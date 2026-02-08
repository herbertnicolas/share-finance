-- =============================================
-- LOVINANCE - Schema do Banco de Dados
-- =============================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/[SEU_PROJETO]/sql

-- =============================================
-- TABELA: groups (Grupos/Casais)
-- =============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por código de convite
CREATE INDEX IF NOT EXISTS idx_groups_code ON public.groups(code);

-- =============================================
-- TABELA: group_members (Membros do Grupo)
-- =============================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_initial TEXT NOT NULL DEFAULT 'U',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Um usuário só pode estar em um grupo uma vez
  UNIQUE(group_id, user_id)
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- =============================================
-- TABELA: expenses (Despesas)
-- =============================================
CREATE TYPE expense_category AS ENUM (
  'food',           -- Alimentação (restaurantes, delivery)
  'groceries',      -- Supermercado
  'transport',      -- Transporte (uber, gasolina)
  'entertainment',  -- Entretenimento (cinema, shows)
  'shopping',       -- Compras gerais
  'bills',          -- Contas (luz, água, internet)
  'health',         -- Saúde (farmácia, consultas)
  'travel',         -- Viagens
  'other'           -- Outros
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  paid_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category expense_category NOT NULL DEFAULT 'other',
  split_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.00 CHECK (split_percentage >= 0 AND split_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para listagem e cálculos
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------
-- Policies para GROUPS
-- ---------------------------------------------

-- Usuários podem ver grupos dos quais são membros
CREATE POLICY "Users can view their groups"
  ON public.groups
  FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários autenticados podem criar grupos
CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Apenas o owner pode atualizar o grupo
CREATE POLICY "Owners can update their groups"
  ON public.groups
  FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Apenas o owner pode deletar o grupo
CREATE POLICY "Owners can delete their groups"
  ON public.groups
  FOR DELETE
  USING (
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ---------------------------------------------
-- Policies para GROUP_MEMBERS
-- ---------------------------------------------

-- Membros podem ver outros membros do mesmo grupo
CREATE POLICY "Members can view group members"
  ON public.group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem se adicionar a um grupo (via código)
CREATE POLICY "Users can join groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Membros podem atualizar seu próprio perfil
CREATE POLICY "Members can update own profile"
  ON public.group_members
  FOR UPDATE
  USING (user_id = auth.uid());

-- Membros podem sair do grupo (deletar a si mesmos)
CREATE POLICY "Members can leave groups"
  ON public.group_members
  FOR DELETE
  USING (user_id = auth.uid());

-- ---------------------------------------------
-- Policies para EXPENSES
-- ---------------------------------------------

-- Membros podem ver despesas do seu grupo
CREATE POLICY "Members can view group expenses"
  ON public.expenses
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Membros podem criar despesas no seu grupo
CREATE POLICY "Members can create expenses"
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Quem criou a despesa pode atualizar
CREATE POLICY "Expense creator can update"
  ON public.expenses
  FOR UPDATE
  USING (paid_by_user_id = auth.uid());

-- Quem criou a despesa pode deletar
CREATE POLICY "Expense creator can delete"
  ON public.expenses
  FOR DELETE
  USING (paid_by_user_id = auth.uid());

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para gerar código único de grupo
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar grupo por código
CREATE OR REPLACE FUNCTION find_group_by_code(invite_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    COUNT(gm.id) as member_count
  FROM public.groups g
  LEFT JOIN public.group_members gm ON g.id = gm.group_id
  WHERE g.code = UPPER(invite_code)
  GROUP BY g.id, g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular saldo entre membros
CREATE OR REPLACE FUNCTION calculate_balance(target_group_id UUID, target_user_id UUID)
RETURNS TABLE (
  partner_id UUID,
  partner_name TEXT,
  balance DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH user_expenses AS (
    -- Despesas pagas pelo usuário (outros devem pra ele)
    SELECT 
      e.amount * (e.split_percentage / 100) as credit
    FROM public.expenses e
    WHERE e.group_id = target_group_id 
      AND e.paid_by_user_id = target_user_id
  ),
  partner_expenses AS (
    -- Despesas pagas pelo parceiro (usuário deve pra ele)
    SELECT 
      gm.user_id as partner_user_id,
      gm.display_name as partner_display_name,
      SUM(e.amount * (e.split_percentage / 100)) as debit
    FROM public.expenses e
    JOIN public.group_members gm ON e.paid_by_user_id = gm.user_id AND gm.group_id = target_group_id
    WHERE e.group_id = target_group_id 
      AND e.paid_by_user_id != target_user_id
    GROUP BY gm.user_id, gm.display_name
  )
  SELECT 
    pe.partner_user_id,
    pe.partner_display_name,
    COALESCE((SELECT SUM(credit) FROM user_expenses), 0) - COALESCE(pe.debit, 0) as balance
  FROM partner_expenses pe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
