Feature: N2N amount screen

  Scenario Outline: Amount screen - fee for <amount> <currency> is the same as in the API
    Given the funded sender is logged in
    When the sender is signed in to the app
    When the N2N amount screen is open for the approved recipient
    When <amount> <currency> is typed on the amount screen
    When breakdown is requested for <amount> <currency>
    Then the fee on the screen is the same as in the breakdown

    Examples:
      | currency | amount |
      | USD      | 10     |
      | ILS      | 20     |
      | USD      | 100.01 |
      | ILS      | 700.01 |
      | ILS      | 751.25 |
