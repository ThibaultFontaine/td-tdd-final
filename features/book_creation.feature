Feature: Book Creation
  As a registered user
  I want to create a new book
  So that I can manage and publish my titles

  Background:
    Given the following user exists:
      | email             | password  |
      | user@example.com | password123 |
    And the user is logged in

  Scenario: Successful book creation
    When the user sends a request to create a book with:
      | title           | author         | description      |
      | "My First Book" | "John Doe"     | "Description..." |
    Then the response status should be "201"
    And the response should contain the book details:
      | title           | author         | description      |
      | "My First Book" | "John Doe"     | "Description..." |