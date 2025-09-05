Feature: Technical Architecture Overview

  Scenario: Architecture covers frontend, edge, storage and CI/CD
    Given the architecture document exists
    When reviewing for MVP readiness
    Then it lists Next.js frontend, Pages Functions/Workers, R2, KV/Durable Objects, and CI steps

  Scenario: Security & compliance checklist present
    Given the architecture document
    When reviewing compliance
    Then it includes GDPR, logging, and key management notes
