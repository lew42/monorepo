# Revised Answer: Idempotent

An idempotent operation produces the same result whether you run it once or multiple times—crucial in distributed systems where network failures cause requests to arrive more than once. Idempotent operations prevent unintended side effects like duplicate charges or duplicate records, making them essential for reliability when retries are inevitable.
