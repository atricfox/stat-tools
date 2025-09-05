Feature: Weighted Mean Calculator
  As a user
  I want the Weighted Mean Calculator to compute weights-corrected average
  So that I can see weighted result and steps

  Scenario: calculate weighted mean for pair input
    Given the input pairs [[90,3],[85,4],[78,2],[92,1]]
    When I submit them to /api/weighted-mean with precision 2
    Then the response status should be 200
    And the JSON response should contain "weighted_mean"
    And the response should include a "steps" array explaining the calculation
