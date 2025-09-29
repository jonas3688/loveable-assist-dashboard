-- Enable Row Level Security on tables containing sensitive personal data
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Create policies for clientes table
-- Only authenticated IT staff can access customer data
CREATE POLICY "Only authenticated users can view customer data" 
ON public.clientes 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can insert customer data" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update customer data" 
ON public.clientes 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete customer data" 
ON public.clientes 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create policies for funcionarios table
-- Only authenticated IT staff can access employee data
CREATE POLICY "Only authenticated users can view employee data" 
ON public.funcionarios 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can insert employee data" 
ON public.funcionarios 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update employee data" 
ON public.funcionarios 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete employee data" 
ON public.funcionarios 
FOR DELETE 
USING (auth.role() = 'authenticated');