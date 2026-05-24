// One-time (or idempotent) init for single-node replica set rs0.
// Usage: mongosh "mongodb://127.0.0.1:27017" --file scripts/init-mongo-replica-set.js

const cfg = {
  _id: "rs0",
  members: [{ _id: 0, host: "127.0.0.1:27017" }],
};

try {
  const s = rs.status();
  if (s.ok === 1) {
    print(`Replica set already running: ${s.set}`);
    quit(0);
  }
} catch (_) {
  /* not initiated yet */
}

const res = rs.initiate(cfg);
printjson(res);
print("Waiting for PRIMARY...");
let attempts = 0;
while (attempts < 30) {
  try {
    const st = rs.status();
    const primary = st.members?.find((m) => m.stateStr === "PRIMARY");
    if (primary) {
      print(`Ready: PRIMARY on ${primary.name}`);
      quit(0);
    }
  } catch (_) {
    /* retry */
  }
  sleep(1000);
  attempts++;
}
print("Init sent; if not PRIMARY yet, run rs.status() in a few seconds.");
quit(attempts < 30 ? 0 : 1);
