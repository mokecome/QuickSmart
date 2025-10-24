/**
 * Type declarations for external modules
 */

declare module 'openai' {
  export class OpenAI {
    constructor(config: any);
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
  }
  export default OpenAI;
}

declare module '@supabase/ssr' {
  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}
