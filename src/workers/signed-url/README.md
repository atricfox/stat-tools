Signed URL Worker (example)

This is a minimal Cloudflare Worker example that writes export files to R2 and returns a simple HMAC-signed download URL.

Files:
- `index.mjs` — the Worker entrypoint (handles `/generate` and `/download/:key`).
- `wrangler.toml` — top-level wrangler config binding this worker to `EXPORT_BUCKET`.

Deploy with wrangler (install wrangler first):

```bash
# install wrangler globally or use npx
npm install -g wrangler
# login or set API token
wrangler login
# publish
wrangler publish --name stat-tools-worker
```

Environment notes:
- Set `SIGN_SECRET` in `wrangler.toml` (or use environment-specific secrets via `wrangler secret put SIGN_SECRET`).
- Ensure `EXPORT_BUCKET` binding matches your R2 bucket name.

Security note: This example uses HMAC with a shared secret as a simple pattern for signed URLs and is for educational/demo purposes only. For production, prefer Cloudflare's recommended signed URL mechanisms or proxy downloads through a verified backend with stricter controls.

Cross-shell examples for `wrangler secret put`:

macOS / Linux (bash / zsh):

```bash
echo -n "your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

Windows PowerShell:

```powershell
[System.Text.Encoding]::UTF8.GetBytes("your-very-secure-secret") | wrangler secret put SIGN_SECRET
```

Windows cmd (note: may include newline):

```cmd
echo|set /p="your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

Quick commands (copy & run locally):

Quick commands (copy & run locally):

```bash
# login once (opens browser)
wrangler login

# create R2 bucket via Cloudflare dashboard or wrangler (dashboard recommended)
# set SIGN_SECRET for this worker
echo -n "your-very-secure-secret" | wrangler secret put SIGN_SECRET

# publish worker (will use bindings from wrangler.toml)
wrangler publish --name stat-tools-worker

# test generate (example using curl)
curl -X POST "https://<your-worker-domain>/generate" -H 'Content-Type: application/json' -d '{"content":"col1,col2\n1,2"}'
```