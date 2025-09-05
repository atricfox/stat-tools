Feature: Next.js Cloudflare Architecture

  Scenario: Pages + Pages Functions deploy
    Given a Next.js project configured for Cloudflare Pages
    When deploying via GitHub Actions
    Then the Pages site and Pages Functions are published and reachable

  Scenario: Use R2 for export storage
    Given an export job produces a CSV
    When the job stores the file to R2
    Then a temporary signed URL is returned
