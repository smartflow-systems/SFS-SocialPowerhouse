
#!/bin/bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 SFS Auto-Commit Starting...${NC}"

# Check if we're in a git repo
if [ ! -d .git ]; then
  echo -e "${RED}❌ Not in a git repository${NC}"
  exit 1
fi

# Get repo name
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
echo -e "${YELLOW}📦 Repository: $REPO_NAME${NC}"

# Stage all changes
git add -A
echo -e "${GREEN}✅ Staged all files${NC}"

# Check if there are changes
if git diff --cached --quiet; then
  echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
  exit 0
fi

# Generate commit message based on changed files
CHANGED_FILES=$(git diff --cached --name-only | head -3 | tr '\n' ', ' | sed 's/,$//')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
BRANCH=$(git branch --show-current)

# Create smart commit message
COMMIT_MSG="feat: Updated $CHANGED_FILES [$REPO_NAME] - $TIMESTAMP"

# Commit
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✅ Committed: $COMMIT_MSG${NC}"

# Pull latest (rebase to avoid merge commits)
echo -e "${BLUE}⬇️  Pulling latest from origin/$BRANCH...${NC}"
if git pull --rebase origin $BRANCH 2>/dev/null; then
  echo -e "${GREEN}✅ Pull successful${NC}"
else
  echo -e "${YELLOW}⚠️  Pull had conflicts, trying standard pull...${NC}"
  git rebase --abort 2>/dev/null || true
  git pull origin $BRANCH || echo -e "${YELLOW}⚠️  Pull failed, will push anyway${NC}"
fi

# Push
echo -e "${BLUE}⬆️  Pushing to origin/$BRANCH...${NC}"
if git push origin $BRANCH; then
  echo -e "${GREEN}🎉 Done! All changes synced to GitHub${NC}"
else
  echo -e "${RED}❌ Push failed - check your credentials or network${NC}"
  exit 1
fi
