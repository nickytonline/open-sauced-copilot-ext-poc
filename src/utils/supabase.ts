import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "pkce",
  },
});

const CALLBACK_URL =
  "https://1x76xljf-3000.use.devtunnels.ms/callback/oauth-callback";

// Function to initiate the OAuth flow
export async function signInWithGitHub(username: string) {
  const callbackUrl = new URL("/callback/oauth-callback", CALLBACK_URL);
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

export async function handleAuthCallback() {
  const { data, error } = await supabase.auth.getSession();

  return { data, error };
}
