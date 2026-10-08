Feature: N2N recipient check

  Scenario Outline: Transfer - <recipient> recipient is rejected
    Given the funded sender is logged in
    When the following transfer is prepared:
      | amount | currency | recipient   | comment |
      | 10     | USD      | <recipient> | *       |
    When the balances are saved
    When the number of the sender's transactions and fees is saved
    When the transfer is sent
    Then the transfer is rejected
    Then the balances are not changed
    Then no transaction and no fee are saved

    Examples:
      | recipient  |
      | pending    |
      | registered |
      | unknown    |
