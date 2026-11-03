/* One of the two processes in proof 6. Fires N appends at Servex's `/log/<name>`
 * door, one at a time (await each), so its OWN lines have a real send order for
 * the proof to check. Two of these run at once. */

const [base, name, who, count] = process.argv.slice(2);

for (let i = 0; i < Number(count); i++){
    const res = await fetch(`${base}/log/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who, i, msg: `line ${i} from poster ${who}` })
    });
    if (!res.ok){
        console.error(`poster ${who} got ${res.status} on line ${i}`);
        process.exit(1);
    }
}
