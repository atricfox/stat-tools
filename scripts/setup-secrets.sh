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

    # SENTRY_DSN for Workers
    read -p "Do you want to set SENTRY_DSN for Workers via wrangler secret put? [y/N]: " yn_sentry
    yn_sentry=${yn_sentry:-N}
    if [[ "$yn_sentry" =~ ^[Yy]$ ]]; then
      read -s -p "Enter SENTRY_DSN (production): " SENTRY_DSN_VALUE
      echo
      if [ -n "$SENTRY_DSN_VALUE" ]; then
        printf "%s" "$SENTRY_DSN_VALUE" | wrangler secret put SENTRY_DSN --env production
        echo "SENTRY_DSN written to Worker (production env)."
      fi
    fi

    # Cloudflare Pages variables/secrets (optional)
    read -p "Configure Cloudflare Pages variables/secrets as well? [y/N]: " yn_pages
    yn_pages=${yn_pages:-N}
    if [[ "$yn_pages" =~ ^[Yy]$ ]]; then
      read -p "Enter CF_PAGES_PROJECT (or set CF_PAGES_PROJECT env): " CF_PAGES_PROJECT_VALUE
      CF_PAGES_PROJECT_VALUE=${CF_PAGES_PROJECT_VALUE:-${CF_PAGES_PROJECT:-}}
      if [ -z "$CF_PAGES_PROJECT_VALUE" ]; then
        echo "CF_PAGES_PROJECT empty; skipping Pages variables."
      else
        # Server-side secret for Pages
        read -s -p "Enter SENTRY_DSN for Pages (server-side secret): " PAGES_SENTRY_DSN
        echo
        if [ -n "$PAGES_SENTRY_DSN" ]; then
          printf "%s" "$PAGES_SENTRY_DSN" | wrangler pages project secret put SENTRY_DSN --project-name "$CF_PAGES_PROJECT_VALUE"
          echo "SENTRY_DSN stored for Pages project $CF_PAGES_PROJECT_VALUE."
        fi
        # Public DSN (optional)
        read -p "Enter NEXT_PUBLIC_SENTRY_DSN for Pages (optional): " PAGES_PUBLIC_DSN
        PAGES_PUBLIC_DSN=${PAGES_PUBLIC_DSN:-}
        if [ -n "$PAGES_PUBLIC_DSN" ]; then
          wrangler pages project variable put NEXT_PUBLIC_SENTRY_DSN --project-name "$CF_PAGES_PROJECT_VALUE" --value "$PAGES_PUBLIC_DSN"
          echo "NEXT_PUBLIC_SENTRY_DSN set for Pages project $CF_PAGES_PROJECT_VALUE."
        fi
        # Environment name
        read -p "Set NEXT_PUBLIC_ENVIRONMENT for Pages [production/staging/preview] (default: production): " PAGES_ENV
        PAGES_ENV=${PAGES_ENV:-production}
        wrangler pages project variable put NEXT_PUBLIC_ENVIRONMENT --project-name "$CF_PAGES_PROJECT_VALUE" --value "$PAGES_ENV"
        echo "NEXT_PUBLIC_ENVIRONMENT=$PAGES_ENV set for Pages project $CF_PAGES_PROJECT_VALUE."
      fi
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
