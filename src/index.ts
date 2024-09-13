import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Octokit } from "@octokit/core";
import { stream } from "hono/streaming";
import {
  createAckEvent,
  createDoneEvent,
  createErrorsEvent,
  createReferencesEvent,
  createTextEvent,
  getUserMessage,
} from "@copilot-extensions/preview-sdk";
import { getReferences } from "./utils/references";
import { BEARER_TOKEN } from "./utils/tokens";
import {
  createStarSearchThread,
  getStarSearchStream,
} from "./utils/star-search";

const app = new Hono();

app.get("/", (c) => {
  return c.text(
    "Welcome to the OpenSauced GitHub Copilot extension proof of concept! 🍕👩‍✈️"
  );
});

// This is a rough POC of the GitHub Copilot extension for OpenSauced. 🍕

app.post("/", async (c) => {
  return stream(c, async (stream) => {
    stream.write(createAckEvent());

    // Identify the user, using the GitHub API token provided in the request headers.
    const tokenForUser = c.req.header("X-GitHub-Token");

    if (!tokenForUser) {
      stream.write(
        createErrorsEvent([
          {
            type: "agent",
            message: "No GitHub token provided in the request headers.",
            code: "MISSING_GITHUB_TOKEN",
            identifier: "missing_github_token",
          },
        ])
      );
      return;
    }

    const octokit = new Octokit({ auth: tokenForUser });
    const user = await octokit.request("GET /user");
    console.log("User:", user.data.login);

    // Parse the request payload and log it.
    const payload = await c.req.json();
    console.log("Payload:", payload);

    const currentMessage = getUserMessage(payload);

    // Create a new StarSearch thread.
    const starSearchThreadResponse = await createStarSearchThread(BEARER_TOKEN);

    if (starSearchThreadResponse.status !== 201) {
      stream.write(
        createErrorsEvent([
          {
            type: "agent",
            message:
              "Failed to create a new OpenSauced StarSearch thread. Maybe your OpenSauced session has expired?",
            code: `HTTP_STATUS_CODE_${starSearchThreadResponse.status}`,
            identifier: "star_search_thread_creation_failed",
          },
        ])
      );
      return;
    }

    const { id: starSeachThreadId } = await starSearchThreadResponse.json();

    const response = await getStarSearchStream({
      starSeachThreadId,
      bearerToken: BEARER_TOKEN,
      message: currentMessage,
    });

    if (response.status !== 200) {
      stream.write(
        createErrorsEvent([
          {
            type: "agent",
            message: "Failed to start OpenSauced StarSearch stream.",
            code: `HTTP_STATUS_CODE_${response.status}`,
            identifier: "star_search_stream_failed",
          },
        ])
      );
      return;
    }

    if (!response.body) {
      stream.write(
        createErrorsEvent([
          {
            type: "agent",
            message: "OpenSauced StarSearch response body is missing.",
            code: `HTTP_STATUS_CODE_${response.status}`,
            identifier: "star_search_incomplete_response",
          },
        ])
      );
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let lastLine = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        getReferences(lastLine).forEach((reference) => {
          stream.write(createReferencesEvent([reference]));
        });
        stream.write(createDoneEvent());
        break;
      }

      const chunk = decoder.decode(value);
      const [, line] = chunk.split("\n");

      if (line?.trim() !== "") {
        const serializedPayload = line.replace("data: ", "");
        const payload = JSON.parse(serializedPayload);

        if (
          payload.content.type === "content" &&
          payload.content.parts[0] !== ""
        ) {
          stream.write(
            createTextEvent(
              payload.content.parts[0].replace(
                new RegExp(`^${escapeRegExp(lastLine)}`, "g"),
                ""
              )
            )
          );

          lastLine = payload.content.parts[0];
        }
      }
    }
  });
});

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
