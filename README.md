# aboutME — Portfolio CMS + Website Generator

File-based portfolio CMS: edit content as JSON, preview, then publish to a static data layer served by Next.js.

Single admin (password login). No database, no multi-user / OAuth.

## Quick start

```bash
cp .env.example .env   # set GITHUB_USERNAME, ADMIN_PASSWORD, ENABLE_AUTH=true
npm install
npm run generate-data  # optional GitHub scrape
npm run dev            # http://localhost:3000
```

1. Login at `/login`
2. Edit content in **Admin → Content**
3. **Publish** copies `private/data` → `public/data` and updates site status
4. Public site at `/`

## Architecture

```text
private/data  (edit / drafts)
      │  Publish
      ▼
public/data   (live JSON)
      │
      ▼
Next.js public portfolio
```

- Content stays in JSON files (no DB)
- Admin APIs need `admin_session` (cookie after password login)
- Theme presets in Appearance: Minimal, Terminal, Editorial
- Agent drafts: `POST /api/agent/ingest` → Admin → Review → Publish

### Agent ingest example

```bash
curl -X POST http://localhost:3000/api/agent/ingest \
  -H 'Content-Type: application/json' \
  --cookie 'admin_session=...' \
  -d '{"type":"blog","title":"Ship notes","content":"...","status":"draft"}'
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Build & run |
| `npm run generate-data` | GitHub → JSON |
| `npm test` | Playwright smoke (server must be running) |

## Docker

```bash
docker compose up -d --build
```

`.env` is loaded through `env_file`, so `ADMIN_PASSWORD` reaches the container
(without it a new random admin password is generated on every start and only
printed to the logs).

Volumes: `private/data` (drafts), `public/data`, `public/uploads`, logs, auth
state, backups. On first start an **empty** `private/data` is seeded from
`public/data`; `Publish` snapshots the published JSON to
`backups/<timestamp>/public-data` before overwriting it (last 10 kept).

## License

MIT
