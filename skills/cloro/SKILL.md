---
name: cloro
description: Monitor how AI assistants and Google answer any prompt with the cloro tools — pick the right provider tool, manage credits, and handle slow synchronous responses.
---

# Using the cloro tools

The cloro plugin exposes seven tools that submit prompts to real provider interfaces and return parsed answers with cited sources as structured JSON. Use them for AI-visibility and brand monitoring, citation analysis, rank tracking, and news monitoring.

## Picking the right tool

- `cloro_chatgpt`, `cloro_perplexity`, `cloro_gemini`, `cloro_copilot`, `cloro_aimode` — ask an AI assistant a prompt and inspect its answer, brand mentions, and cited sources. Pick the tool for the assistant the user names; when they say "AI assistants" generally, query several and compare.
- `cloro_google` — Google Search results: organic ranking, People Also Ask, knowledge graph. Set `aiOverview: true` when the question is about Google's AI Overview.
- `cloro_google_news` — news articles about a brand or topic.

These tools query live provider sessions; they are for observing what providers answer, not a general-purpose web search or a way to chat with the providers.

## Guidance

- **Calls are slow.** Each call drives a real browser session and can take minutes. Don't retry a call that hasn't failed, and prefer one well-formed prompt over many variations.
- **Calls cost credits.** Base costs range from 3 to 5 credits per call; sync requests carry a +2 surcharge, and options like `aiOverview`, `state` targeting, and extra `pages` add +2 each. Don't fan out across all providers unless the user asked for a comparison.
- **Localize deliberately.** `country` defaults to the configured `defaultCountry`. Set it explicitly when the user names a market. `state` (US only) targets a US state on the assistant tools; `location` targets a canonical Google location on `cloro_google` and `cloro_aimode`.
- **Cite from the response.** Answers include the sources the provider itself cited — use those when reporting which domains an assistant references, rather than inferring.

## Example prompts this skill serves

- "Does Google's AI Overview for 'ai visibility tracking' mention cloro? Check the US and Germany."
- "Compare how Perplexity and Copilot answer 'best CRM for startups' and list the sources each cites."
- "Pull the latest Google News articles about our brand."
