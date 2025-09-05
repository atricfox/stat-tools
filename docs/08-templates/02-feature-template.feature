# Gherkin template for acceptance features

Feature: {Feature Title}

  Background:
    Given a user on the {module} page

  Scenario: Basic happy path
    Given valid input for {module}
    When the user triggers the main action
    Then the system returns the expected result

  Scenario: Edge case / validation error
    Given invalid or missing input
    When the user triggers the action
    Then the system returns an error and emits a calc_error event
