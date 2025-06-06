import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente para a URL e a chave anônima (anon) do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis de ambiente foram definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.");
}

// Cria e exporta o cliente Supabase para ser usado em todo o aplicativo
export const supabase = createClient(supabaseUrl, supabaseAnonKey);