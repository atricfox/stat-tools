Feature: Hub page and SEO templates

  Scenario: Hub page contains links to tools
    Given the Hub page /statistics-calculators/ exists
    When visiting the Hub page
    Then it shows links to mean, weighted-mean, gpa, and stddev tools

  Scenario: JSON-LD templates are available
    Given a tool page
    When rendering server-side
    Then JSON-LD for HowTo or FAQ is injected into the page head
