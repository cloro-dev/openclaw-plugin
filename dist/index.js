import { Type } from "typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
const DEFAULT_BASE_URL = "https://api.cloro.dev";
const DEFAULT_COUNTRY = "us";
const DEFAULT_TIMEOUT_SECONDS = 300;
async function cloroRequest(cfg, path, body) {
  const apiKey = cfg.apiKey ?? process.env.CLORO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'cloro API key missing. Set the CLORO_API_KEY environment variable or "plugins.entries.cloro.config.apiKey" in openclaw.json. Get a key at https://dashboard.cloro.dev.'
    );
  }
  const controller = new AbortController();
  const timeoutSeconds = cfg.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS;
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1e3);
  try {
    const res = await fetch(`${cfg.baseUrl ?? DEFAULT_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`cloro API error (HTTP ${res.status}): ${text.slice(0, 2e3)}`);
    }
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `cloro request timed out after ${timeoutSeconds}s. Monitor requests drive real provider sessions and can take a while; raise "plugins.entries.cloro.config.timeoutSeconds" if this happens often.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
function toToolResult(data) {
  const payload = typeof data === "object" && data !== null && "result" in data ? data.result : data;
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }]
  };
}
const ASSISTANT_PROVIDERS = [
  {
    tool: "cloro_chatgpt",
    path: "/v1/monitor/chatgpt",
    description: "Ask the real ChatGPT web app a prompt via cloro and get the parsed answer with cited sources. Use for AI-visibility monitoring: how ChatGPT answers a question, which brands it mentions, and which sources it cites."
  },
  {
    tool: "cloro_perplexity",
    path: "/v1/monitor/perplexity",
    description: "Ask Perplexity a prompt via cloro and get the parsed answer with cited sources. Use for AI-visibility monitoring of Perplexity answers, brand mentions, and citations."
  },
  {
    tool: "cloro_gemini",
    path: "/v1/monitor/gemini",
    description: "Ask Google Gemini a prompt via cloro and get the parsed answer with cited sources. Use for AI-visibility monitoring of Gemini answers, brand mentions, and citations."
  },
  {
    tool: "cloro_copilot",
    path: "/v1/monitor/copilot",
    description: "Ask Microsoft Copilot a prompt via cloro and get the parsed answer with cited sources. Use for AI-visibility monitoring of Copilot answers, brand mentions, and citations."
  }
];
var index_default = definePluginEntry({
  id: "cloro",
  name: "cloro",
  description: "Monitor how AI assistants and Google answer any prompt \u2014 real ChatGPT, Perplexity, Gemini, Copilot, Google AI Mode, Google Search, and Google News responses with parsed text and cited sources.",
  register(api) {
    const cfg = api.pluginConfig ?? {};
    const defaultCountry = cfg.defaultCountry ?? DEFAULT_COUNTRY;
    for (const provider of ASSISTANT_PROVIDERS) {
      api.registerTool({
        name: provider.tool,
        description: provider.description,
        parameters: Type.Object({
          prompt: Type.String({ description: "The prompt to send to the assistant" }),
          country: Type.Optional(
            Type.String({
              description: `ISO 3166-1 alpha-2 country code for a localized response (default: ${defaultCountry})`
            })
          ),
          state: Type.Optional(
            Type.String({
              description: "US state code (e.g. CA, TX) for state-level geo-targeting. Only valid with country 'us'. Adds +2 credits."
            })
          )
        }),
        async execute(_id, params) {
          const body = {
            prompt: params.prompt,
            country: params.country ?? defaultCountry
          };
          if (params.state) body.state = params.state;
          return toToolResult(await cloroRequest(cfg, provider.path, body));
        }
      });
    }
    api.registerTool({
      name: "cloro_aimode",
      description: "Ask Google AI Mode a prompt via cloro and get the parsed answer with cited sources. Use for AI-visibility monitoring of Google's AI Mode answers, brand mentions, and citations.",
      parameters: Type.Object({
        prompt: Type.String({ description: "The prompt to send to Google AI Mode" }),
        country: Type.Optional(
          Type.String({
            description: `ISO 3166-1 alpha-2 country code for a localized response (default: ${defaultCountry})`
          })
        ),
        location: Type.Optional(
          Type.String({
            description: "Google canonical location for geo-targeted results, e.g. 'Austin,Texas,United States'"
          })
        )
      }),
      async execute(_id, params) {
        const body = {
          prompt: params.prompt,
          country: params.country ?? defaultCountry
        };
        if (params.location) body.location = params.location;
        return toToolResult(await cloroRequest(cfg, "/v1/monitor/aimode", body));
      }
    });
    api.registerTool({
      name: "cloro_google",
      description: "Run a Google Search via cloro and get structured results: organic results, People Also Ask, related searches, knowledge graph, and optionally the AI Overview with its cited sources. Use to check rankings or whether a brand appears in Google's AI Overview.",
      parameters: Type.Object({
        query: Type.String({ description: "The search query to execute on Google" }),
        country: Type.Optional(
          Type.String({
            description: `ISO 3166-1 alpha-2 country code for localized results (default: ${defaultCountry})`
          })
        ),
        location: Type.Optional(
          Type.String({
            description: "Google canonical location for geo-targeted results, e.g. 'Austin,Texas,United States'"
          })
        ),
        device: Type.Optional(
          Type.String({ description: "Device type: 'desktop' (default) or 'mobile'" })
        ),
        pages: Type.Optional(
          Type.Number({
            description: "Number of result pages to fetch, 1-10 (default 1; +2 credits per extra page)"
          })
        ),
        aiOverview: Type.Optional(
          Type.Boolean({
            description: "Include Google's AI Overview as markdown with sources (+2 credits)"
          })
        )
      }),
      async execute(_id, params) {
        const body = {
          query: params.query,
          country: params.country ?? defaultCountry
        };
        if (params.location) body.location = params.location;
        if (params.device) body.device = params.device;
        if (params.pages) body.pages = params.pages;
        if (params.aiOverview) body.include = { aioverview: { markdown: true } };
        return toToolResult(await cloroRequest(cfg, "/v1/monitor/google", body));
      }
    });
    api.registerTool({
      name: "cloro_google_news",
      description: "Search Google News via cloro and get structured news articles with titles, snippets, sources, and publish dates. Use for news and media monitoring.",
      parameters: Type.Object({
        query: Type.String({ description: "The search query to execute on Google News" }),
        country: Type.Optional(
          Type.String({
            description: `ISO 3166-1 alpha-2 country code for localized results (default: ${defaultCountry})`
          })
        ),
        pages: Type.Optional(
          Type.Number({
            description: "Number of result pages to fetch, 1-10 (default 1; +2 credits per extra page)"
          })
        )
      }),
      async execute(_id, params) {
        const body = {
          query: params.query,
          country: params.country ?? defaultCountry
        };
        if (params.pages) body.pages = params.pages;
        return toToolResult(await cloroRequest(cfg, "/v1/monitor/google/news", body));
      }
    });
  }
});
export {
  index_default as default
};
