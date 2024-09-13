import { getOpenSaucedUser } from "./agent";
import { getTopPercent } from "./user";

const PRS_ISSUES_ADDITIONAL_CONTEXT = `THE RESPONSE HAS TO RETURN FULL URLS FOR PULL REQUESTS AND FULL URLS FOR ISSUES IF THEY ARE A PART OF THE RESPONSE AND INCLUDE THE TITLE OF THE ISSUE IF IT'S AN ISSUE AND THE TITLE OF THE PULL REQUEST IF IT'S A PULL REQUEST. IT SHOULS BE IN THIS FORMAT:

          [title OF ISSUE OR PULL REQUEST](url OF ISSUE OR PULL REQUEST)

          , WHERE 'title OF ISSUE OR PULL REQUEST' IS THE TITLE OF THE ISSUE OR PULL REQUEST AND 'url OF ISSUE OR PULL REQUEST' IS THE URL OF THE ISSUE OR PULL REQUEST. ONLY RENDER IT WITH THE TITLE AS A MARKDOWN LINK IF YOU ARE 100% CERAINTY THAT THE TITLE IS THE TITLE OF THE ISSUE OR PULL REQUEST. SPECIAL CHARACTERS IN THE TITLE HAVE TO BE ESCAPED SO THE MARKDOWN DOES NOT BREAK.

          ONE THING TO NOTE IS THAT THE URLS HAVE TO BE UNIQUE, SO ONLY SHOW THE URL ONCE.`;

const LOTTERY_FACTOR_ADDITIONAL_CONTEXT = `          IF LOTTERY FACTOR INFORMATION IS RETURNED, IT HAS TO BE IN A MARKDOWN TABLE  WITH A HEADING ABOVE IT THAT SAYS "The lottery factor for owner/repo is high", WHERE owner/repo IS THE REPOSITORY AND "high" REPRESENTS IF THE LOTTERY FACTOR IS HIGH, MEDIUM OR LOW. ONLY SHOW THE FIRST 5 CONTRIBUTORS, AND IF THERE ARE MORE THAN 5 CONTRIBUTORS, GROUP THE REMAINDER INTO A SINGLE ROW AND CALL THEM "Other Contributors".

          THERE MUST BE ONLY TWO COLUMNS IN THE MARKDOWN TABLE.

          THE FIRST COLUMN ABSOLUTELY MUST HAVE THIS FORMAT FOR EACH ROW:

          '
          [![](https://github.com/some-user.png?size=40)](https://github.com/some-user) [@some-user](https://github.com/some-user)
          '

          WHERE 'some-user' IS THE CONTRIBUTOR AND CAN BE DEDUCED FROM @some-user IN THE RETURNED RESPONSE.

          THE SECOND COLUMN IS THE PERCENTAGE THEY ARE FOR THE LOTTERY FACTOR AND HAS TO HAVE A % SIGN AFTER THE PERCENTAGE.

          AFTER THE LOTTERY FACTOR TABLE, THERE MUST BE A LINE BREAK AND THEN THIS MARKDOWN MUST BE RENDERED:

            View the [owner/repo repository page](https://app.opensauced.pizza/s/owner/repo) on OpenSauced to see more details about the repository.

          WHERE 'owner/repo' IS THE REPOSITORY AND 'https://app.opensauced.pizza/s/owner/repo' IS THE URL OF THE REPOSITORY PAGE.`;

const SBOM_ADDITIONAL_CONTEXT = `IF ASKING ABOUT SBOM OR SOFTWARE BILL OF MATERIALS, RETURN A RESPONSE WITH THIS URL  https://app.opensauced.pizza/workspaces/new?sbom=true&repo=google%2Fzx, WHERE 'google%2Fzx' IS ENCODED REPOSITORY, I.E. google%2Fzx IS google/zx.`;

async function getOscrAdditionalContext(username: string, bearerToken: string) {
  username = "nick";
  const userInfo = await getOpenSaucedUser(username, bearerToken);
  let oscrScore = userInfo.oscr ? Math.ceil(userInfo.oscr) : 0;
  let topPercent = `(in the top ${getTopPercent(oscrScore)}%)`;

  return `IF ASKING ABOUT OSCR OR OSCR SCORE, ONLY RETURN INFORMATION ABOUT OSCR, NOTHING ELSE. NOTHING ABOUT PULL REQUESTS OR ISSUES. YOU MUST HAVE THIS MARKDOWN RENDERED IN THE RESPONSE:

            The OSCR score for some-username is ${Math.ceil(
              oscrScore
            )} ${topPercent}.
            View [@some-username's full profile on OpenSauced](https://app.opensauced.pizza/s/some-username).
            For more information on the OSCR score, view the [Introducing OSCR](https://opensauced.pizza/blog/introducing-OSCR) blog post.


          WHERE 'some-username' IS THE USER'S USERNAME.
          USE THE BING SERVICE TO EXPLAIN OSCR FROM THE BLOG POST IN ONE SENTENCE MAX!`;
}

export async function enhancePrompt(
  message: string,
  bearerToken: string
): Promise<string> {
  let userInfo: { oscr?: number } = {};
  let username = "";
  let oscrAdditionalContext = "";

  if (message.toLowerCase().includes("oscr")) {
    oscrAdditionalContext = await getOscrAdditionalContext(
      username,
      bearerToken
    );
  }

  return `${message}.

          ADDITIONAL CONTEXT:

          ${PRS_ISSUES_ADDITIONAL_CONTEXT}

          ${LOTTERY_FACTOR_ADDITIONAL_CONTEXT}

          IF ASKING ABOUT SCORE CARD, OPENSSF SCORE CARD, OR CONTRIBUTOR CONFIDENCE, RETURN A RESPONSE WITH THIS URL  https://app.opensauced.pizza/s/owner/repo, WHERE 'owner/repo' IS THE REPOSITORY AND 'https://app.opensauced.pizza/s/owner/repo' IS THE URL OF THE REPOSITORY PAGE.

          ${SBOM_ADDITIONAL_CONTEXT}

          ${oscrAdditionalContext}
          `;
}
