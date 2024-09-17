import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ibcwmlhcimymasokhgvn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliY3dtbGhjaW15bWFzb2toZ3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyOTU1MzMsImV4cCI6MjAxNDg3MTUzM30.Mr-ucuNDBjy9BC7NJzOBBi0Qz8WYiKI4n0JtWr4_woY",
  {
    auth: {
      flowType: "pkce",
    },
  }
);

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
