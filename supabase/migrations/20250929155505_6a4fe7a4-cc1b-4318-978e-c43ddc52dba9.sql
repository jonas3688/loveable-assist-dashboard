-- Rollback: Remove RLS policies and disable RLS on tables
-- Drop all policies created for clientes table
DROP POLICY IF EXISTS "Only authenticated users can view customer data" ON public.clientes;
DROP POLICY IF EXISTS "Only authenticated users can insert customer data" ON public.clientes;
DROP POLICY IF EXISTS "Only authenticated users can update customer data" ON public.clientes;
DROP POLICY IF EXISTS "Only authenticated users can delete customer data" ON public.clientes;

-- Drop all policies created for funcionarios table
DROP POLICY IF EXISTS "Only authenticated users can view employee data" ON public.funcionarios;
DROP POLICY IF EXISTS "Only authenticated users can insert employee data" ON public.funcionarios;
DROP POLICY IF EXISTS "Only authenticated users can update employee data" ON public.funcionarios;
DROP POLICY IF EXISTS "Only authenticated users can delete employee data" ON public.funcionarios;

-- Disable Row Level Security on both tables (returning to original state)
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;