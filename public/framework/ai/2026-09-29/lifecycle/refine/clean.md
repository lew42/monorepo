S1. All right, so if there's a bunch of dev servers running that don't need to be, that's a mistake.
S2. File a complaint with the system designer.
S3. This comes down to that whole functionality and having AIs forget to start or stop things.
S4. We don't want to rely on the AIs to remember to do everything because after they get deep in thought, planning and building, they tend to forget to wrap things up.
S5. So we need either a loop or some sort of awaken or you could try and engineer some agentic solution to that.
S6. However, if any task that started has this update kind of loop to it, you could call it a heartbeat.
S7. And maybe each mastermind session that gets spawned is automatically a task in and of itself and could have subtasks, and each task could always have subtasks.
S8. By the way, I want to see something about our task system, our AI task system: we should be able to have nested tasks where any number of steps and the aggregate percentage completion is based on the subtasks.
S9. We can have parallel tasks and series; obviously there are dependencies, so you could have a mixture of both.
S10. You could launch a bunch of parallel tasks at phase one, but then once they're all complete, you embark on phase two which could also be in parallel.
S11. And you could mix sequential systems with parallel systems.
S12. I'm not sure exactly how those should look visually, but hopefully the visual design could indicate clearly whether it's parallel or series and how it all flows and what's in flight and what we're waiting on and the percentage completion and all that stuff.
S13. But yeah, trying in terms of the 22 dev servers running and just keeping things efficient, the system mastermind should be trying to analyze the efficiency of the system.
S14. Maybe he spawns a mastermind to study the efficiency of the system in terms of do we have accurate logs of all the things that are created.
S15. And does that give us a picture of how many things are created that are never finished and how many servers are started that are never shut down properly?
S16. How many work trees do you get orphaned and are just sitting there and don't need to be?
S17. All these things that we're creating, we want to manage the life cycle essentially of all of our systems.
