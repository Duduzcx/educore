import { createClient } from '@supabase/supabase-js';

// Fallbacks seguros para evitar erros durante o build-time no Netlify/Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'qjdcexrirortchemezij';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGNleHJpcm9ydGNoZW1lemlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODg0MzksImV4cCI6MjA4NTk2NDQzOX0.bOnOPy-AkPokgOON6f3KJb7TD2u6HceZ5UL86Xk0Vi0';

export const supabase = createClient(supabaseUrl, supabaseKey);
