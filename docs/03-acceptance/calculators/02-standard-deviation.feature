Feature: Standard Deviation / Variance Calculator
  As a user
  I want to compute standard deviation and variance (sample/population)
  So that I can understand data dispersion

  Scenario: calculate sample stddev for a list
    Given the input numbers [10,12,23,23,16,23,21,16]
    When I submit them to /api/stddev with formula sample and precision 2
    Then the response status should be 200
    And the JSON response should contain "stddev" and "variance"
    And the response should include steps explaining the calculation
