
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljijiepapsbnjnnanmjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaWppZXBhcHNibmpubmFubWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDQ4OTEsImV4cCI6MjA2NDYyMDg5MX0.Cly6G9FpLUYKsrX8OBrepi7Qy8oW6jLx1RhVpU3lhV8'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
