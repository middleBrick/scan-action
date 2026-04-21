# middleBrick Scan Action

> Security gate for your APIs, in your CI, in under 60 seconds.

middleBrick scans any API endpoint — REST, GraphQL, LLM/AI, and Web3 JSON-RPC — and returns a security risk score (A–F) with actionable findings. Use this Action to fail pipelines that drop below a score threshold, post results as PR comments, and surface findings as line annotations.

## Quickstart

```yaml
name: API Security
on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: middlebrick/scan-action@v1
        with:
          api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
          url: https://api.staging.example.com/v1/users
```

Get your API key at [middlebrick.com/dashboard](https://middlebrick.com/dashboard). Free tier includes 3 scans/month — no credit card.

## Why use it in CI

- **Threshold gate.** Fail the job if overall score falls below a number you set.
- **PR comment.** Post or update a single comment on every pull request with grade, score, findings count, and top issues.
- **Line annotations.** Findings surface as GitHub annotations so reviewers see them inline.
- **Authenticated scanning.** Scan protected endpoints via `headers` (Bearer, API key, Basic, Cookie). Requires one-time domain verification.
- **Job summary.** Full breakdown written to `GITHUB_STEP_SUMMARY` for every run.

## Coverage

14 security categories across 4 surfaces:

- **OWASP API Top 10 (12 checks)** — Authentication, BOLA/IDOR, BFLA, Property Authorization, Input Validation, Rate Limiting, Data Exposure, Encryption, SSRF, Inventory Management, Unsafe Consumption.
- **LLM / AI Security** — system prompt leakage, prompt injection, jailbreaks, data exfiltration, excessive agency. Adversarial probing across 3 tiers.
- **Web3 / JSON-RPC Security** — EVM-RPC, Solana-RPC, Cosmos-RPC. Privileged module exposure (`personal_*`, `admin_*`, `debug_*`), chain identity mismatch, wildcard CORS on RPC.
- **DeFi Application Security** — unauthenticated price oracles, swap quotes without slippage guards, WalletConnect v1 bridges, leaked RPC provider keys, GraphQL introspection on subgraph indexers.

Protocols auto-detected: REST, GraphQL, gRPC-Web, SOAP, JSON-RPC, EVM-RPC, Solana-RPC, Cosmos-RPC.

Compliance mapping: **PCI-DSS 4.0**, **SOC 2 Type II**, **OWASP API Top 10 2023** — branded PDF export per regulation.

Validated against industry-standard vulnerable-API benchmark suites.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | Yes | — | middleBrick API key (store in a repo secret) |
| `url` | Yes | — | API endpoint URL to scan |
| `method` | No | `GET` | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`) |
| `headers` | No | — | Auth headers as JSON string. Allowlist: `Authorization`, `X-API-Key`, `Cookie`, `X-Custom-*`. Requires domain verification. |
| `threshold` | No | — | Minimum acceptable score (0-100). Action fails if score is below. |
| `comment` | No | `false` | Post or update a PR comment with results |
| `base-url` | No | — | middleBrick API base URL override (self-hosted / enterprise) |

## Outputs

| Output | Description |
|--------|-------------|
| `score` | Overall security score (0-100) |
| `grade` | Letter grade (A / B / C / D / F) |
| `findings-count` | Total number of findings |
| `scan-id` | Scan ID for dashboard cross-reference |
| `result` | Full scan result as JSON string |

## Examples

### Threshold gate

Fail the job if overall score drops below 70.

```yaml
- uses: middlebrick/scan-action@v1
  with:
    api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
    url: https://api.example.com/v1/users
    threshold: 70
```

### PR comment

Post a single auto-updating comment with results on every pull request.

```yaml
permissions:
  pull-requests: write

steps:
  - uses: middlebrick/scan-action@v1
    with:
      api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
      url: https://api.example.com/v1/users
      comment: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Authenticated scanning

Scan endpoints protected by Bearer, API key, or custom auth. Domain must be verified once in the dashboard (DNS TXT or HTTP well-known).

```yaml
- uses: middlebrick/scan-action@v1
  with:
    api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
    url: https://api.example.com/v1/me
    headers: |
      {"Authorization": "Bearer ${{ secrets.STAGING_API_TOKEN }}"}
    threshold: 80
```

### Matrix of endpoints

Scan multiple endpoints in parallel.

```yaml
jobs:
  scan:
    strategy:
      fail-fast: false
      matrix:
        endpoint:
          - { url: "https://api.example.com/v1/users",  method: "GET" }
          - { url: "https://api.example.com/v1/orders", method: "POST" }
          - { url: "https://api.example.com/graphql",   method: "POST" }
    runs-on: ubuntu-latest
    steps:
      - uses: middlebrick/scan-action@v1
        with:
          api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
          url: ${{ matrix.endpoint.url }}
          method: ${{ matrix.endpoint.method }}
          threshold: 70
```

### Consume outputs

```yaml
- uses: middlebrick/scan-action@v1
  id: scan
  with:
    api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
    url: https://api.example.com/v1/users

- name: Route by grade
  run: |
    echo "Score: ${{ steps.scan.outputs.score }}"
    echo "Grade: ${{ steps.scan.outputs.grade }}"
    echo "Findings: ${{ steps.scan.outputs.findings-count }}"
    if [[ "${{ steps.scan.outputs.grade }}" == "F" ]]; then
      echo "::error::Grade F — blocking merge"
      exit 1
    fi
```

## Safety

- **Read-only by default.** GET and HEAD for general scanning. POST is used only for LLM adversarial probes (text-only, no tool calls) and read-only JSON-RPC queries from a hard-coded allowlist. State-mutating calls (`eth_sendRawTransaction`, `personal_*`, `miner_start`, etc.) are never transmitted.
- **SSRF protection.** Private IPs, localhost, and cloud metadata endpoints are blocked at three independent layers.
- **Header allowlist.** Only `Authorization`, `X-API-Key`, `Cookie`, and `X-Custom-*` headers are forwarded. Everything else is stripped.
- **Domain verification gate.** Authenticated scanning requires verified ownership of the target domain (DNS TXT or HTTP well-known) — only the operator can scan with credentials.
- **Throttled probes.** LLM adversarial probes run sequentially with 500ms delays and a 30-second total cap.
- **Data ownership.** Scan results belong to you. Deletable on demand. Purged within 30 days of cancellation. Never sold, never used for model training.

## Links

- **Website:** [middlebrick.com](https://middlebrick.com)
- **Dashboard:** [middlebrick.com/dashboard](https://middlebrick.com/dashboard)
- **Pricing:** [middlebrick.com/#pricing](https://middlebrick.com/#pricing) — Free / Starter ($99) / Pro ($499) / Enterprise
- **CLI:** [`@middlebrick/cli`](https://www.npmjs.com/package/@middlebrick/cli) — same engine, local scans
- **MCP Server:** [`@middlebrick/mcp-server`](https://www.npmjs.com/package/@middlebrick/mcp-server) — scan from Claude / Cursor / any MCP-compatible AI tool

## License

Apache 2.0 — [Zevlat Intelligence](https://zvlint.com)
