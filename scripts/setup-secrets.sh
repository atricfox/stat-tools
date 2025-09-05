#!/usr/bin/env bash
set -euo pipefail

echo "Setup secrets helper - requires 'wrangler' and/or 'gh' CLI installed"

usage() {
  cat <<EOF
Usage: $0 [--no-wrangler] [--no-gh]
Options:
  --no-wrangler   Skip wrangler secret put step
  --no-gh         Skip gh secret set step
EOF
  exit 1
}

NO_WRANGLER=0
NO_GH=0

while [[ ${1:-} != "" ]]; do
  case "$1" in
    --no-wrangler) NO_WRANGLER=1; shift ;;
    --no-gh) NO_GH=1; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

# Read SIGN_SECRET from env or prompt
if [ -n "${SIGN_SECRET:-}" ]; then
  SIGN_SECRET_VALUE="$SIGN_SECRET"
else
  read -s -p "Enter SIGN_SECRET (will be used with wrangler secret put): " SIGN_SECRET_VALUE
  echo
fi

if [ "$NO_WRANGLER" -eq 0 ]; then
  if command -v wrangler >/dev/null 2>&1; then
    read -p "Run 'wrangler secret put SIGN_SECRET' now? [y/N]: " yn
    yn=${yn:-N}
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      printf "%s" "$SIGN_SECRET_VALUE" | wrangler secret put SIGN_SECRET --env production
      echo "SIGN_SECRET written to Worker (production env)."
    else
      echo "Skipping wrangler secret put. You can run the command manually (see README)."
    fi
  else
    echo "wrangler not found in PATH; skipping wrangler secret step. Install wrangler to use this feature." >&2
  fi
fi

if [ "$NO_GH" -eq 0 ]; then
  if command -v gh >/dev/null 2>&1; then
    read -p "Do you want to set GitHub repository secrets via gh CLI? [y/N]: " yn2
    yn2=${yn2:-N}
    if [[ "$yn2" =~ ^[Yy]$ ]]; then
      read -p "Enter CF_API_TOKEN (or set CF_API_TOKEN env): " CF_API_TOKEN_VALUE
      CF_API_TOKEN_VALUE=${CF_API_TOKEN_VALUE:-${CF_API_TOKEN:-}}
      if [ -z "$CF_API_TOKEN_VALUE" ]; then echo "CF_API_TOKEN empty; skipping"; else gh secret set CF_API_TOKEN --body "$CF_API_TOKEN_VALUE"; fi

      read -p "Enter CF_PAGES_TOKEN (or set CF_PAGES_TOKEN env): " CF_PAGES_TOKEN_VALUE
      CF_PAGES_TOKEN_VALUE=${CF_PAGES_TOKEN_VALUE:-${CF_PAGES_TOKEN:-}}
      if [ -n "$CF_PAGES_TOKEN_VALUE" ]; then gh secret set CF_PAGES_TOKEN --body "$CF_PAGES_TOKEN_VALUE"; fi

      read -p "Enter CF_ACCOUNT_ID (or set CF_ACCOUNT_ID env): " CF_ACCOUNT_ID_VALUE
      CF_ACCOUNT_ID_VALUE=${CF_ACCOUNT_ID_VALUE:-${CF_ACCOUNT_ID:-}}
      if [ -n "$CF_ACCOUNT_ID_VALUE" ]; then gh secret set CF_ACCOUNT_ID --body "$CF_ACCOUNT_ID_VALUE"; fi

      read -p "Enter CF_PAGES_PROJECT (or set CF_PAGES_PROJECT env): " CF_PAGES_PROJECT_VALUE
      CF_PAGES_PROJECT_VALUE=${CF_PAGES_PROJECT_VALUE:-${CF_PAGES_PROJECT:-}}
      if [ -n "$CF_PAGES_PROJECT_VALUE" ]; then gh secret set CF_PAGES_PROJECT --body "$CF_PAGES_PROJECT_VALUE"; fi

      read -p "Also store SIGN_SECRET in GitHub Secrets? (not recommended; prefer wrangler secret put) [y/N]: " store_sign
      store_sign=${store_sign:-N}
      if [[ "$store_sign" =~ ^[Yy]$ ]]; then
        gh secret set SIGN_SECRET --body "$SIGN_SECRET_VALUE"
      else
        echo "Did not store SIGN_SECRET in GitHub Secrets."
      fi
    else
      echo "Skipping gh CLI secret setup."
    fi
  else
    echo "gh CLI not found; skipping GitHub secret setup." >&2
  fi
fi

echo "Done. Review README.md for manual commands and CI instructions."
