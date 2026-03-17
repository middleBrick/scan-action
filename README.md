# middleBrick Scan Action

GitHub Action that scans API endpoints for security vulnerabilities and assigns risk scores. Add security gates to your CI/CD pipelines.

## Quick Start

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

Get your API key at: [middlebrick.com/dashboard](https://middlebrick.com/dashboard)

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | Yes | — | middleBrick API key |
| `url` | Yes | — | API endpoint URL to scan |
| `method` | No | `GET` | HTTP method |
| `threshold` | No | — | Minimum score (0-100). Fails if below. |
| `comment` | No | `false` | Post/update PR comment with results |
| `base-url` | No | — | API base URL override |

## Outputs

| Output | Description |
|--------|-------------|
| `score` | Security score (0-100) |
| `grade` | Letter grade (A-F) |
| `findings-count` | Number of findings |
| `scan-id` | Scan ID |
| `result` | Full result as JSON |

## Examples

### Threshold Gate

```yaml
- uses: middlebrick/scan-action@v1
  with:
    api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
    url: https://api.example.com/v1/users
    threshold: 70
```

### PR Comment

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

### Multiple Endpoints

```yaml
strategy:
  matrix:
    endpoint:
      - { url: "https://api.example.com/v1/users", method: "GET" }
      - { url: "https://api.example.com/v1/data", method: "POST" }
steps:
  - uses: middlebrick/scan-action@v1
    with:
      api-key: ${{ secrets.MIDDLEBRICK_API_KEY }}
      url: ${{ matrix.endpoint.url }}
      method: ${{ matrix.endpoint.method }}
```

## License

MIT — [Zevlat Intelligence](https://zev.lat)
