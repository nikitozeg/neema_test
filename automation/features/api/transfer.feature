Feature: N2N transfer

  #The transfer request has no currencyId, so the currency has to come from the breakdown call before it
  Scenario: Transfer - paid ILS transfer, fee is rounded half up
    Given the funded sender is logged in
    When the following transfer is prepared:
      | amount | currency | recipient | comment |
      | 751.25 | ILS      | approved  | *       |
    When the balances are saved
    When breakdown is requested for the prepared transfer
    When the transfer is sent
    Then the transfer is accepted
    Then the breakdown fee is 3.01
    Then the charged fee is the same as in the breakdown
    Then the sender balance changed by -754.26
    Then the recipient balance changed by 751.25
    Then the transaction is saved:
      | amount | currency | type |
      | 751.25 | ILS      | 3    |
    Then the fee is saved with amount 3.01
