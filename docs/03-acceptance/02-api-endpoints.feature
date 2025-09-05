Feature: API Routes FRS

  Scenario: POST /api/mean should be routable and return mean
    Given a POST request to /api/mean with valid numeric payload
    When processed by the API route
    Then the response status is 200 and includes a JSON 'mean' field

  Scenario: POST /api/export/csv initiates export
    Given a POST request to /api/export/csv with entries and export flag
    When the request is accepted
    Then the system queues an export task and returns an export job id
