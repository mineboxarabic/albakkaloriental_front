import type { AdminResult } from './catalog-admin-types';

/** Server Action transport can reject before the action's own error handler runs. */
export async function callAdmin<T>(action: () => Promise<AdminResult<T>>): Promise<AdminResult<T>> {
  try { return await action(); }
  catch { return { ok: false, error: 'Opération impossible pour le moment.' }; }
}
