import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

interface User extends SupabaseUser {
  image?: string | null;
}

export interface Session extends Omit<SupabaseSession, 'user'> {
  user?: User | null;
}
