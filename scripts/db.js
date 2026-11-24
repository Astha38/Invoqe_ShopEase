const { spawn } = require("child_process");
const path = require("path");

const pgPath = "C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe";
const dataDir = path.join(__dirname, "..", "pgdata");

const pg = spawn(pgPath, ["-D", dataDir, "-p", "5434"], { stdio: "inherit" });

pg.on("error", (err) => {
  console.error("Failed to start PostgreSQL:", err.message);
  process.exit(1);
});

pg.on("exit", (code) => {
  if (code !== null && code !== 0) {
    console.error(`PostgreSQL exited with code ${code}`);
  }
});

process.on("SIGINT", () => {
  pg.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  pg.kill();
  process.exit(0);
});
