import { supabase } from '@/lib/supabase';

/** Permanently deletes the signed-in user's own account — see supabase/functions/delete-account. */
export async function deleteOwnAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ success: boolean }>('delete-account');
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      const body = await context.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  if (!data?.success) throw new Error('Could not delete account.');
}
