# Revised Answer: Idempotent

An idempotent operation produces the same result whether you run it once or a hundred times—like a payment button that charges your card only once no matter how many times you click it. This matters in distributed systems where network failures might cause the same request to reach the server multiple times, so idempotent design prevents accidental duplicate charges or records.
