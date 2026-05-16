#!/usr/bin/env bash
set -u

REPORT="SFS_SOCIAL_POWERHOUSE_HEALTH_$(date +%Y%m%d_%H%M%S).md"

say() {
  echo -e "$1" | tee -a "$REPORT"
}

run() {
  say "\n### $1"
  shift
  {
    echo "\`\`\`"
    "$@" 2>&1
    echo "\`\`\`"
  } | tee -a "$REPORT"
}

say "# SFS Social PowerHouse Health Check"
say ""
say "- Date: $(date)"
say "- Folder: $(pwd)"
say "- User: $(whoami)"
say ""

say "## 1. Repo status"
run "git status" git status --short
run "git branch" git branch --show-current
run "latest commits" git log --oneline -8

say ""
say "## 2. Runtime"
run "node version" node -v
run "npm version" npm -v

say ""
say "## 3. Package scripts"
run "package scripts" node -e "const p=require('./package.json'); console.log(p.scripts)"

say ""
say "## 4. Required secret names only — values hidden"
node <<'NODE' | tee -a "$REPORT"
const keys = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
  "OPENAI_API_KEY",
  "SFS_JWT_SECRET",
  "FRONTEND_URL",
  "USE_PG_SESSIONS",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FACEBOOK_APP_ID",
  "FACEBOOK_APP_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "INSTAGRAM_CLIENT_ID",
  "INSTAGRAM_CLIENT_SECRET",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "YOUTUBE_API_KEY",
  "YOUTUBE_CLIENT_ID",
  "YOUTUBE_CLIENT_SECRET",
  "PINTEREST_APP_ID",
  "PINTEREST_APP_SECRET"
];

for (const k of keys) {
  const v = process.env[k];
  if (!v) {
    console.log(`❌ ${k}=missing`);
  } else {
    console.log(`✅ ${k}=set length:${v.length}`);
  }
}
NODE

say ""
say "## 5. Install check"
run "npm install check" npm install --dry-run

say ""
say "## 6. Build check"
run "npm run build" npm run build

say ""
say "## 7. Test check"
run "npm test" npm test

say ""
say "## 8. Database connection check"
node <<'NODE' | tee -a "$REPORT"
(async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.log("❌ DATABASE_URL missing");
      process.exit(0);
    }
    const { neonConfig, Pool } = await import("@neondatabase/serverless");
    const ws = (await import("ws")).default;
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query("select now() as now");
    console.log("✅ DB connected:", result.rows[0].now);
    await pool.end();
  } catch (err) {
    console.log("❌ DB failed:", err.message);
  }
})();
NODE

say ""
say "## 9. Local API boot smoke test"
PORT_TO_TEST="${PORT:-5000}"
TMPLOG="/tmp/sfs-socialpowerhouse-health-server.log"

if lsof -i :"$PORT_TO_TEST" >/dev/null 2>&1; then
  say "Port $PORT_TO_TEST already in use. Testing existing app."
else
  say "Starting app on port $PORT_TO_TEST..."
  npm start > "$TMPLOG" 2>&1 &
  APP_PID=$!
  sleep 8
fi

say ""
say "### /api/health"
{
  echo '```'
  curl -i "http://127.0.0.1:${PORT_TO_TEST}/api/health" --max-time 10 || true
  echo '```'
} | tee -a "$REPORT"

say ""
say "### public page"
{
  echo '```'
  curl -I "http://127.0.0.1:${PORT_TO_TEST}/" --max-time 10 || true
  echo '```'
} | tee -a "$REPORT"

if [ "${APP_PID:-}" != "" ]; then
  kill "$APP_PID" >/dev/null 2>&1 || true
fi

say ""
say "## DONE"
say "Report saved to: $REPORT"
