const OPENSAUCED_API_URL = "https://api.opensauced.pizza/v2";
const DEFAULT_STAR_SEARCH_API_BASE_URL = new URL(
  `${OPENSAUCED_API_URL}/star-search`
);

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
  return fetch(
    new URL(`${DEFAULT_STAR_SEARCH_API_BASE_URL}/${starSeachThreadId}/stream`),
    {
      method: "POST",
      body: JSON.stringify({ query_text: message }),
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}
