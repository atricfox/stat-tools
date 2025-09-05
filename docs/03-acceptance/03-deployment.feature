Feature: Deployment - Cloudflare Pages, R2, Workers

  Scenario: Deploy site to Cloudflare Pages via GitHub Actions
    Given a repository with `wrangler.toml` and Cloudflare API token configured
    When GitHub Actions runs the deploy workflow
    Then the Pages site is published and Pages Functions are available

  Scenario: Export to R2 and return signed URL
    Given an export job writes a CSV to R2
    When the job completes
    Then a short-lived signed URL is returned to the caller
