import { enhancePrompt } from "./prompting";

const OPENSAUCED_API_URL = "https://api.opensauced.pizza/v2";
const DEFAULT_STAR_SEARCH_API_BASE_URL = new URL(
  `${OPENSAUCED_API_URL}/star-search`
);

export async function getOpenSaucedUser(username: string, bearerToken: string) {
  const response = await fetch(`${OPENSAUCED_API_URL}/users/${username}`, {
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  return await response.json();
}

export async function createStarSearchThread(bearerToken: string) {
  return fetch(DEFAULT_STAR_SEARCH_API_BASE_URL, {
    method: "POST",
    body: "{}",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  });
}

export async function getStarSearchStream({
  starSeachThreadId,
  bearerToken,
  message,
}: {
  starSeachThreadId: string;
  bearerToken: string;
  message: string;
}) {
  const enhancedPrompt = await enhancePrompt(message, bearerToken);

  return fetch(
    new URL(`${DEFAULT_STAR_SEARCH_API_BASE_URL}/${starSeachThreadId}/stream`),
    {
      method: "POST",
      body: JSON.stringify({
        query_text: enhancedPrompt,
      }),
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}
