# Publish Pace

Pace needs a Python server. A static-only host cannot run the lesson generation and adaptation APIs. Both the frontend and backend should use the same HTTPS origin.

## Recommended initial deployment: local NLP only

No API key is needed. Leave PACE_ALLOW_REMOTE_AI=false. This avoids provider costs and makes the entire judging flow available with the default app.

The included Render Blueprint explicitly selects the free service plan. Verify the plan shown in the dashboard before creating a service; hosting offers can change. The existing HTTPS deployment and learner flow were verified on November 4; [DELIVERY_STATUS.md](DELIVERY_STATUS.md) records those checks. Hosted load testing remains unverified. Allow time for the free server to wake after inactivity.

1. Publish the project in a public GitHub repository after reviewing its contents. Include app, static, tests, scripts, docs, README, requirements files, Dockerfile, render.yaml and pyproject.toml. Keep the dated planning records if included; their provenance is explicit.
2. Exclude .venv, .env, caches, local logs, and downloaded personal progress records. Review the repository before making it public. No credentials are required for the default app.
3. In Render, create a Blueprint from that repository and review render.yaml. Alternatively create a Python Web Service using the configuration below.
4. Wait for a successful build and a healthy service. Open the assigned HTTPS URL.
5. Test sample lessons, a pasted lesson, wrong-answer adaptation, page reload and mobile layout on the public URL.
6. Put the verified public URL in the README and submission. Keep a demo recording available as a fallback.

Manual configuration:

| Setting | Value |
| --- | --- |
| Runtime | Python |
| Python version | 3.12.14 |
| Build command | pip install -r requirements.lock |
| Start command | python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT |
| Health check | /api/health |
| Cloud mode | PACE_ALLOW_REMOTE_AI=false |
| Persistent disk | Not required |

Sources: [Render FastAPI guide](https://render.com/docs/deploy-fastapi), [Blueprint specification](https://render.com/docs/blueprint-spec).

## Optional cloud explanations

An API provider is a service that lets this app request AI-written explanations. You do not need one to use or submit Pace. If adding one later, obtain the key privately in that provider's account and enter it in hosting environment variables or a local .env file. Never put it in frontend code, a screenshot, the README, GitHub, or chat.

The adapter expects an HTTPS chat-completions endpoint supporting JSON-object responses and max_completion_tokens. Compatibility depends on the chosen model and provider.

| Variable | Meaning |
| --- | --- |
| PACE_ALLOW_REMOTE_AI | Set true only when intentionally enabling the cloud option |
| PACE_AI_BASE_URL | Provider API base URL, without /chat/completions |
| PACE_AI_MODEL | Model identifier supported by that provider |
| PACE_AI_API_KEY | Private server-side API key |
| PACE_AI_HOURLY_LIMIT | Optional shared limit; default 12 requests per process per hour |

For Groq-compatible configuration, consult [the provider's compatibility documentation](https://console.groq.com/docs/openai). Choose a current model in that provider's own console; no particular model was live-tested here.

The learner must still check the cloud option in the new-lesson dialog. The app sends the title and source text, not stored learner preferences or practice history. Invalid outputs produce a clear error.

The request limit is an in-memory demo safeguard, shared by all users of one process and reset on restart. It is not a per-user quota or a production cost-control system. Keep the public judging demo in local mode unless cloud use has been tested and appropriate account limits are set.

## Docker alternative

A Dockerfile is included but has not been built in this development run: Docker CLI was present, but no running Docker daemon was available.

~~~sh
docker build -t pace .
docker run --rm -p 8000:8000 pace
~~~

Open http://localhost:8000. The image runs as a non-root user and serves the app on port 8000. Use environment variables for provider configuration if needed; the .dockerignore excludes .env.

## Reproducibility and troubleshooting

- Install requirements.lock for the verified runtime versions. requirements.txt documents broader compatible ranges; it is not the reproduction lock.
- A server restart does not remove browser-local progress. A different browser or domain starts a separate session.
- If no narration is available, try a browser with installed English voices. Text and all practice remain usable.
- If pasted input is rejected, use a coherent English teaching passage with at least 35 words and two complete sentences, within 24,000 characters.
- A provider failure does not disable local processing. Uncheck cloud mode and retry.
- A live hosting result is only verified once the public health check and learner flow pass. A successful local test does not establish hosted availability.

