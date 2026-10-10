# Idempotent

An idempotent operation is one that produces the same result whether you run it once or multiple times—calling it five times has the same effect as calling it once. This is crucial in distributed systems where network failures might cause the same request to arrive more than once, because idempotent operations prevent unintended side effects like duplicate charges or duplicate records.

## Sources

- [What does idempotent mean in software systems? • Particular Software](https://particular.net/blog/what-does-idempotent-mean)
- [The Idempotence Principle in Software Architecture | HackerNoon](https://hackernoon.com/the-idempotence-principle-in-software-architecture)
- [What is Idempotency? A guide to API reliability | Google Cloud](https://cloud.google.com/discover/idempotency)
- [What Is an Idempotent Operation? | Baeldung on Computer Science](https://www.baeldung.com/cs/idempotent-operations)
