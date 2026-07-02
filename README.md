# cloro plugin for OpenClaw

[![cloro](https://img.shields.io/badge/Powered%20by-cloro-blue?style=for-the-badge)](https://cloro.dev/)

The cloro plugin for [OpenClaw](https://openclaw.ai) lets your OpenClaw agent see what AI assistants and Google actually answer. It adds seven tools backed by the [cloro API](https://cloro.dev/docs/) that submit prompts to the real ChatGPT, Perplexity, Gemini, Copilot, and Google AI Mode interfaces — plus Google Search and Google News — and return parsed responses with cited sources as structured JSON.

Typical uses: AI-visibility and brand monitoring ("does ChatGPT recommend us?"), checking which sources AI assistants cite for a query, tracking Google AI Overviews, rank tracking, and news monitoring — all from a chat with your agent.

## Tools

| Tool | What it does | Base cost |
| ------------------- | ---------------------------------------------------------------------------- | -------------- |
| `cloro_chatgpt` | Prompt the real ChatGPT web app, get the answer plus cited sources | 5 credits |
| `cloro_perplexity` | Prompt Perplexity, get the answer plus cited sources | 3 credits |
| `cloro_gemini` | Prompt Google Gemini, get the answer plus cited sources | 4 credits |
| `cloro_copilot` | Prompt Microsoft Copilot, get the answer plus cited sources | 5 credits |
| `cloro_aimode` | Prompt Google AI Mode, get the answer plus cited sources | 4 credits |
| `cloro_google` | Google Search: organic results, People Also Ask, optional AI Overview (+2) | 3 credits |
| `cloro_google_news` | Google News articles with titles, snippets, sources, and dates | 3 credits |

Sync monitor requests carry a +2 credit surcharge on top of the base cost. See the [providers guide](https://cloro.dev/docs/guides/providers) for full, current pricing, including feature add-ons like US state targeting (+2 credits) and extra Google pages (+2 credits per page).

## Installation

You need a cloro API key — sign up at [dashboard.cloro.dev](https://dashboard.cloro.dev) to get one with free credits included.

Install the plugin straight from GitHub:

```bash
openclaw plugins install git:github.com/cloro-dev/openclaw-plugin
openclaw plugins enable cloro
openclaw gateway restart
```

During development, clone the repo and link it instead:

```bash
git clone https://github.com/cloro-dev/openclaw-plugin.git
openclaw plugins install --link ./openclaw-plugin
```

## Configuration

Set your API key either as an environment variable:

```bash
export CLORO_API_KEY="YOUR_API_KEY"
```

or in `openclaw.json` under the plugin's config block:

```json
{
  "plugins": {
    "entries": {
      "cloro": {
        "enabled": true,
        "config": {
          "apiKey": "YOUR_API_KEY",
          "defaultCountry": "us",
          "timeoutSeconds": 300
        }
      }
    }
  }
}
```

| Option | Description | Default |
| ---------------- | ------------------------------------------------------------------------ | ------------------------ |
| `apiKey` | cloro API key (falls back to the `CLORO_API_KEY` environment variable) | – |
| `baseUrl` | cloro API base URL | `https://api.cloro.dev` |
| `defaultCountry` | ISO 3166-1 alpha-2 country code used when a tool call omits `country` | `us` |
| `timeoutSeconds` | Per-request timeout. Monitor requests drive real provider sessions and can take a while | `300` |

## Usage

Once enabled, just ask your agent. Examples:

- "Ask ChatGPT what the best SERP APIs are and list which vendors it cites."
- "Check whether Google's AI Overview for 'best ai seo tools' mentions cloro."
- "Compare how Perplexity and Copilot answer 'best CRM for startups' — which sources do they cite?"
- "Pull the latest Google News articles about our brand in Germany."

Each tool returns the parsed cloro result as JSON — response text, sources with URLs and titles, and provider-specific extras — so the agent can quote, compare, and summarize directly.

### Tool parameters

All assistant tools (`cloro_chatgpt`, `cloro_perplexity`, `cloro_gemini`, `cloro_copilot`) accept:

| Parameter | Description | Default |
| ---------- | ------------------------------------------------------------------------------ | ------------------ |
| `prompt`\* | The prompt to send to the assistant | – |
| `country` | ISO 3166-1 alpha-2 country code for a localized response | `defaultCountry` |
| `state` | US state code (e.g. `CA`, `TX`) for state-level geo-targeting (+2 credits) | – |

`cloro_aimode` accepts `prompt`, `country`, and an optional Google canonical `location` (e.g. `Austin,Texas,United States`).

`cloro_google` accepts `query`, `country`, `location`, `device` (`desktop`/`mobile`), `pages` (1–10), and `aiOverview` (include Google's AI Overview as markdown with sources, +2 credits).

`cloro_google_news` accepts `query`, `country`, and `pages`.

\* Mandatory parameters

## FAQ

### Why not use the agent's built-in web search?

Built-in web search returns links. These tools return what AI assistants actually *answer* — the exact response text a real user sees in ChatGPT, Perplexity, Gemini, Copilot, or Google AI Mode, with the sources each assistant cited. That is the data you need for AI-visibility and brand monitoring, and it isn't available from a search API.

### How long do requests take?

Monitor requests drive real provider sessions, so they take noticeably longer than a plain HTTP API — often tens of seconds. The plugin's default timeout is 300 seconds; raise `timeoutSeconds` if needed. cloro retries failures internally.

### What about Grok?

Grok is temporarily unavailable upstream (anonymous access is blocked), so the plugin doesn't expose a Grok tool. See the [providers guide](https://cloro.dev/docs/guides/providers) for current status.

### How is this different from running the cloro API directly?

Nothing is hidden — the plugin is a thin client over `POST https://api.cloro.dev/v1/monitor/*`. It exists so OpenClaw agents can call cloro as first-class tools with typed parameters instead of hand-writing HTTP requests. For batch workloads, use the [async API](https://cloro.dev/docs/guides/making-requests) directly.

## Learn more

- **API documentation:** [cloro.dev/docs](https://cloro.dev/docs/)
- **OpenClaw integration guide:** [cloro.dev/docs/guides/openclaw](https://cloro.dev/docs/guides/openclaw)
- **Provider pricing:** [cloro.dev/docs/guides/providers](https://cloro.dev/docs/guides/providers)

## Contact us

If you have questions or need support, reach out to us at [support@cloro.dev](mailto:support@cloro.dev).

---

Built with ❤️ by the cloro team
