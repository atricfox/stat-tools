Feature: Unweighted GPA Calculator
  As a student, teacher, or academic counselor
  I want to calculate unweighted GPA using standard 4.0 scale
  So that I can assess academic performance fairly without course difficulty bias

  Background:
    Given I am on the Unweighted GPA Calculator page
    And the calculator interface is loaded
    And the default 4.0 Standard grading system is selected

  @gpa @basic-calculation
  Scenario: Calculate basic unweighted GPA
    Given I have the following courses:
      | Course Name | Credits | Letter Grade |
      | Mathematics | 4       | A            |
      | English Lit | 3       | B            |
      | Chemistry   | 4       | A-           |
      | History     | 3       | B+           |
    When I review the calculated results
    Then I should see the unweighted GPA as "3.55"
    And I should see total credits as "14"
    And I should see total quality points as "49.7"

  @gpa @grade-systems
  Scenario: Switch between grading systems
    Given I have added courses with standard grades
    When I switch from "4.0 Standard" to "4.0 Plus/Minus" grading system
    Then the system should recalculate all grade point values
    And the GPA result should update accordingly
    And all plus/minus grade options should be available

  @gpa @plus-minus-grades
  Scenario: Calculate GPA with plus/minus grades
    Given I select "4.0 Plus/Minus" grading system
    And I add the following courses:
      | Course Name | Credits | Letter Grade |
      | Biology     | 3       | A+           |
      | Physics     | 4       | A-           |
      | Calculus    | 3       | B+           |
    When the GPA is calculated
    Then the grade points should be mapped correctly:
      | Letter Grade | Grade Points |
      | A+           | 4.0          |
      | A-           | 3.7          |
      | B+           | 3.3          |
    And the unweighted GPA should be "3.67"

  @gpa @course-management
  Scenario: Add and remove courses dynamically
    Given I start with an empty course list
    When I add a course "Algebra" with 3 credits and grade "A"
    Then I should see 1 course in the list
    And the GPA should be "4.00"
    When I add another course "Biology" with 4 credits and grade "B"
    Then I should see 2 courses in the list
    And the GPA should be recalculated to "3.43"
    When I remove the "Algebra" course
    Then I should see 1 course in the list
    And the GPA should be "3.00"

  @gpa @data-validation
  Scenario Outline: Validate course input data
    Given I am adding a new course
    When I enter course name as "<course_name>"
    And I enter credits as "<credits>"
    And I select grade as "<grade>"
    Then the validation result should be "<result>"
    And I should see "<message>" if validation fails

    Examples:
      | course_name | credits | grade | result  | message                    |
      | Mathematics | 4       | A     | valid   |                            |
      | Math        | 0.5     | B+    | valid   |                            |
      |             | 3       | A     | invalid | Course name is required    |
      | Biology     | 0       | A     | invalid | Credits must be at least 0.5 |
      | Chemistry   | 15      | A     | invalid | Credits cannot exceed 10   |
      | Physics     | 3       |       | invalid | Grade selection required   |

  @gpa @grade-distribution
  Scenario: View grade distribution analysis
    Given I have courses with mixed grades:
      | Course Name | Credits | Letter Grade |
      | Math        | 4       | A            |
      | English     | 3       | A            |
      | Science     | 4       | B            |
      | History     | 3       | C            |
    When I view the grade distribution
    Then I should see:
      | Grade | Count | Percentage |
      | A     | 2     | 50%        |
      | B     | 1     | 25%        |
      | C     | 1     | 25%        |
    And the distribution chart should display correctly

  @gpa @academic-status
  Scenario Outline: Display academic status based on GPA
    Given I have courses that result in a GPA of "<gpa>"
    When I view the academic status
    Then I should see status as "<status>"
    And the status color should be "<color>"
    And the description should include "<description>"

    Examples:
      | gpa  | status       | color  | description          |
      | 3.8  | Excellent    | green  | Outstanding          |
      | 3.2  | Good         | blue   | Good standing        |
      | 2.5  | Satisfactory | yellow | Satisfactory progress|
      | 1.8  | Poor         | red    | improvement needed   |

  @gpa @calculation-steps
  Scenario: View detailed calculation steps
    Given I have calculated a GPA with multiple courses
    When I expand the "Calculation Steps" section
    Then I should see step-by-step breakdown including:
      | Step | Description                    |
      | 1    | Course Grade Points Conversion |
      | 2    | Totals Calculation             |
      | 3    | GPA Calculation                |
    And each step should show the mathematical formula
    And intermediate values should be displayed with proper precision

  @gpa @precision-control
  Scenario: Adjust calculation precision
    Given I have calculated a GPA
    When I change precision from 2 to 4 decimal places
    Then all displayed numbers should update to 4 decimal places
    And the GPA result should show increased precision
    And calculation steps should reflect the new precision

  @gpa @example-data
  Scenario: Load example course data
    Given I have an empty course list
    When I click "Load Example" button
    Then the system should populate with sample courses
    And the sample should demonstrate various grade levels
    And the GPA should be calculated automatically
    And I should see realistic course names and credits

  @gpa @export-functionality
  Scenario Outline: Export calculation results
    Given I have completed a GPA calculation
    When I choose to export in "<format>" format
    Then a file should be generated and downloaded
    And the file should contain course data, GPA results, and calculation steps
    And the file format should be valid "<format>"

    Examples:
      | format |
      | CSV    |
      | JSON   |
      | PDF    |

  @gpa @csv-export
  Scenario: Export detailed CSV report
    Given I have courses with calculated GPA
    When I export to CSV format
    Then the CSV should include headers:
      | Course Name | Credits | Letter Grade | Grade Points | Quality Points |
    And it should include a summary row with totals
    And the GPA value should be clearly indicated

  @gpa @share-results
  Scenario: Share GPA calculation results
    Given I have calculated a GPA of "3.45"
    When I click the share button
    Then I should see sharing options for social media
    And the share text should include key statistics
    And a link to the calculator should be included

  @gpa @copy-results
  Scenario: Copy results to clipboard
    Given I have completed a GPA calculation
    When I click the "Copy" button
    Then the results should be copied to clipboard
    And the copied text should include:
      | Data Type      | Example           |
      | GPA            | GPA: 3.45         |
      | Total Credits  | Credits: 14       |
      | Quality Points | Points: 48.3      |

  @gpa @help-documentation
  Scenario: Access help and documentation
    Given I am using the calculator
    When I expand the help section
    Then I should see explanations for:
      | Topic                          |
      | How to use the calculator      |
      | Unweighted vs Weighted GPA     |
      | Supported grading systems      |
      | Tips for students              |
    And the help should include practical examples

  @gpa @responsive-design
  Scenario: Use calculator on mobile device
    Given I access the calculator on a mobile device
    Then the interface should adapt to small screen size
    And all input fields should be easily accessible
    And the results should remain clearly visible
    And touch interactions should work smoothly

  @gpa @keyboard-navigation
  Scenario: Navigate using keyboard only
    Given I am using keyboard navigation
    When I tab through the interface
    Then all interactive elements should be reachable
    And the tab order should be logical
    And I should be able to complete all operations using only keyboard

  @gpa @error-handling
  Scenario: Handle calculation errors gracefully
    Given I have entered course data
    When a calculation error occurs
    Then I should see a user-friendly error message
    And the interface should remain stable
    And I should be able to correct the issue easily

  @gpa @data-persistence
  Scenario: Maintain data during session
    Given I have entered several courses
    When I refresh the page
    Then my course data should be preserved (if browser supports it)
    And the calculation should be restored

  @gpa @clear-all-data
  Scenario: Clear all course data
    Given I have multiple courses entered
    When I click "Clear All" button
    Then I should see a confirmation dialog
    When I confirm the action
    Then all course data should be removed
    And the GPA results should be reset
    And the interface should return to initial state

  @gpa @grade-system-compatibility
  Scenario: Handle grading system changes with existing data
    Given I have courses entered with standard grades (A, B, C)
    When I switch to plus/minus grading system
    Then existing grades should remain compatible
    And new grade options should be available
    When I switch to a completely different scale
    Then I should see a compatibility warning
    And options to clear or convert data

  @gpa @bulk-operations
  Scenario: Perform bulk operations on courses
    Given I have 10 courses in my list
    When I select multiple courses
    Then I should see bulk action options
    And I should be able to delete selected courses
    And the GPA should recalculate after bulk changes

  @gpa @performance-large-dataset
  Scenario: Handle large number of courses
    Given I add 50+ courses to the calculator
    Then the interface should remain responsive
    And calculations should complete within reasonable time
    And the UI should handle scrolling smoothly

  @gpa @accessibility-compliance
  Scenario: Meet accessibility standards
    Given I am using assistive technology
    Then all form elements should have proper labels
    And calculation results should be announced
    And color should not be the only means of conveying information
    And the interface should work with screen readers