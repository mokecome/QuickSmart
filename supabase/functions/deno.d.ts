/**
 * Deno type declarations for Supabase Edge Functions
 */

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.45.4' {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
