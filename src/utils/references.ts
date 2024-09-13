import { CopilotReference } from "@copilot-extensions/preview-sdk";

export function getReferences(message: string): CopilotReference[] {
  const references: CopilotReference[] = [];

  // Match markdown links for issues and pull requests
  const markdownRegex =
    /\[([^\]]+)\]\((https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/(pull|issues)\/(\d+))\)/g;
  let match;

  while ((match = markdownRegex.exec(message))) {
    const [, title, fullUrl, owner, repo, type, number] = match;
    references.push(
      createReference({ owner, repo, type, number, fullUrl, title })
    );
  }

  // If no markdown links found, fall back to plain URL matching
  if (references.length === 0) {
    const urlRegex =
      /https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)\/(pull|issues)\/(\d+)/g;

    while ((match = urlRegex.exec(message))) {
      const [fullUrl, owner, repo, type, number] = match;
      references.push(createReference({ owner, repo, type, number, fullUrl }));
    }
  }

  return references;
}

interface CreateReferenceParams {
  owner: string;
  repo: string;
  type: string;
  number: string;
  fullUrl: string;
  title?: string;
}

function createReference({
  owner,
  repo,
  type,
  number,
  fullUrl,
  title,
}: CreateReferenceParams): CopilotReference {
  return {
    id: `${owner}/${repo}/${number}`,
    type: type === "pull" ? "pullrequest" : "issue",
    data: {
      number: parseInt(number),
    },
    is_implicit: false,
    metadata: {
      display_name: title || `#${number}`,
      display_icon: type === "pull" ? "pr-opened" : "issue-opened",
      display_url: fullUrl,
    },
  };
}
