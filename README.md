# OriginalVoices CLI

Command-line interface for the [OriginalVoices API](https://originalvoices.ai) — ask questions to Digital Twins, manage audiences, and explore projects from your terminal.

## Installation

```bash
npm install -g @originalvoices/cli
```

Or run directly with npx:

```bash
npx @originalvoices/cli ask "What matters most when buying coffee?" --audience "coffee drinkers aged 20-40"
```

Requires Node.js 18+.

## Authentication

```bash
# Interactive login
ov auth login

# Or pass your key directly
ov auth login --key ov_live_abc123

# Use an environment variable (for CI/scripting)
export OV_API_KEY=ov_live_abc123

# Check auth status
ov auth status

# Remove stored key
ov auth logout
```

Your API key is stored at `~/.ov/config.json`. The `OV_API_KEY` environment variable takes priority over the config file.

## Usage

### Ask questions

Ask open-ended questions to an audience:

```bash
ov ask "What factors influence your decision to try a new skincare product?" \
  --audience "women aged 25-45 in the US"
```

Ask multiple questions at once:

```bash
ov ask "What do you look for in a coffee brand?" "How often do you try new brands?" \
  --audience "coffee drinkers aged 20-40"
```

Ask a saved audience by ID:

```bash
ov ask "What would make you switch banks?" --audience-id 550e8400-e29b-41d4-a716-446655440000
```

Ask a multiple choice question:

```bash
ov ask "Which social media platform do you use most?" \
  --audience "Gen Z men 18-25" \
  --type choices \
  --choices "Instagram,TikTok,YouTube,X,Facebook"
```

Ask a project's panel with a filter:

```bash
ov ask "What frustrates you about navigation apps?" \
  --project 550e8400-e29b-41d4-a716-446655440000 \
  --filter "people who use navigation apps daily"
```

Ask a single Digital Twin:

```bash
ov ask "What does your morning routine look like?" --twin 550e8400-e29b-41d4-a716-446655440000
```

Control sample size:

```bash
ov ask "How do you discover new music?" \
  --audience "millennials in urban areas" \
  --sample-size high
```

Available sample sizes: `low`, `medium` (default), `high`, `very_high`.

### Manage audiences

```bash
# List saved audiences
ov audiences list

# Create a new audience
ov audiences create --title "Health-conscious millennials" --prompt "Health-conscious adults aged 25-40"

# Update an audience title
ov audiences update <id> --title "New title"

# Delete an audience
ov audiences delete <id>
```

### List projects

```bash
ov projects list
```

## JSON output

Use the `--json` flag to get raw JSON output, useful for scripting and piping:

```bash
ov ask "What do you think about electric cars?" --audience "car owners 30-50" --json

ov audiences list --json | jq '.data.audiences[].title'
```

## Configuration

| Source | Priority |
|--------|----------|
| `--api-key` flag | Highest |
| `OV_API_KEY` env var | Medium |
| `~/.ov/config.json` | Lowest |

Set a custom API base URL:

```bash
ov auth login --base-url https://your-api-url.com
```

Or via environment variable:

```bash
export OV_BASE_URL=https://your-api-url.com
```
