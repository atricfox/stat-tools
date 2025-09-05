Feature: FRS Index and governance

  Scenario: FRS index lists modules and statuses
    Given the FRS index document
    When viewing the index
    Then it shows each module, file path, and current status (Done/Planned)

  Scenario: Acceptance linkage exists
    Given each FRS module
    When inspecting the header
    Then it contains an `acceptance` field pointing to a docs/acceptance/*.feature

  Background:
    Given the repository contains `specs/FRS/` with module markdown files

  Scenario: Validate each FRS header contains governance fields
    Given an FRS markdown file
    When reading the top YAML header
    Then the header includes keys: id, owner, acceptance, version, created, status, reviewers
