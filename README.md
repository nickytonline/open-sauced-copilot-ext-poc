# OpenSauced Copilot Extension Proof of Concept (POC)

A very rough POC of a GitHub Copilot Extension using OpenSauced that leverages the [GitHub Copilot SDK Preview](https://github.com/copilot-extensions/preview-sdk.js).

Better instructions eventually, but for now:

```
npm install
npm run dev
open http://localhost:3000
```

Use tunneling to expose your localhost to the internet via [VS Code's Port forwarding](https://code.visualstudio.com/docs/editor/port-forwarding), [ngrok](https://ngrok.com), or similar.

You'll need to create a GitHub app for the Copilot extension to work and use the URL from the from the tunneling above in your GitHub app configuration.

Check out https://github.blog/news-insights/product-news/introducing-github-copilot-extensions/ for more info.
