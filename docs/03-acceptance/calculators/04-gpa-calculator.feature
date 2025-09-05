Feature: GPA Calculator

  Background:
    Given a user on the GPA Calculator page

  Scenario: Calculate semester GPA from score:credit list
    Given the user pastes "90:3,85:4,78:2" into the input
    When the user triggers calculation
    Then the page shows a GPA with precision 2 and total credits 9

  Scenario: Paste two-column values and credits
    Given the user pastes two columns of values and credits
    When the user triggers calculation
    Then the page shows the expected GPA and per-course details

  Scenario: Export CSV after user consent
    Given the user has provided consent to export
    When the user requests CSV export
    Then the system returns an export link and emits export_csv event
