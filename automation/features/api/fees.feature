Feature: N2N fee

  Background:
    Given the funded sender is logged in

  Scenario Outline: Breakdown - fee for <amount> <currency> is <fee>
    When breakdown is requested for <amount> <currency>
    Then the breakdown fee is <fee>

    Examples:
      | currency | amount  | fee   |
      | ILS      | 700     | 0.00  |
      | ILS      | 700.01  | 2.80  |
      | ILS      | 751.25  | 3.01  |
      | ILS      | 1000    | 4.00  |
      | ILS      | 1000.01 | 10.00 |
      | ILS      | 1001    | 10.01 |
      | USD      | 100     | 0.00  |
      | USD      | 100.01  | 0.40  |
      | USD      | 1000    | 4.00  |
      | USD      | 1000.01 | 10.00 |
      | USD      | 1001    | 10.01 |
