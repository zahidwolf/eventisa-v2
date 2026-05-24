// Docker init: member host must match what apps use from the host machine.
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

printjson(rs.initiate(cfg));
