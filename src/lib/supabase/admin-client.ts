import { createBrowserClient } from '@supabase/ssr'

// Untyped client for admin write operations.
// We use the typed client for reads to get autocomplete; untyped for writes to avoid
// the "never" inference issue when the generated types aren't 1:1 with the schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): ReturnType<typeof createBrowserClient<any>> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
