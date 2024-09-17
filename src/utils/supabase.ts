import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, BASE_URL } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !BASE_URL) {
  throw new Error("Missing required environment variables for Supabase.");
}

export const RELATIVE_CALLBACK_URL = "/oauth-callback";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
  },
});

// Function to initiate the OAuth flow
export async function signInWithGitHub(username: string) {
  const callbackUrl = new URL(RELATIVE_CALLBACK_URL, BASE_URL);
  callbackUrl.searchParams.append("username", username);

  const response = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: callbackUrl.toString(),

      queryParams: {
        prompt: "consent",
      },
    },
  });

  return response;
}

export async function getSession(code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}
