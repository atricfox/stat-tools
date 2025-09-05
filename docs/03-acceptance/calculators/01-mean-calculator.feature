Feature: Mean Calculator - basic arithmetic mean
  As a user
  I want the Mean Calculator to return the arithmetic mean for numeric input
  So that I can see a correct average and step-by-step explanation

  Scenario: calculate mean for a simple list
    Given the input numbers [90,85,78,92]
    When I submit them to /api/mean with precision 2
    Then the response status should be 200
    And the JSON response should contain "mean"
    And the response should include a "steps" array explaining the calculation
