#!/bin/bash

# Migration script for Article Smasher and Task Smasher
# This script copies all original files to the new structure

set -e

echo "Starting migration..."

# Base paths
OLD_BASE="../src/tools"
NEW_BASE="./src/tools"

# Article Smasher Migration
echo "Migrating Article Smasher..."

# Copy contexts
cp -r "$OLD_BASE/article-smasher/src/contexts/"* "$NEW_BASE/article-smasher/contexts/" 2>/dev/null || true

# Copy hooks
cp -r "$OLD_BASE/article-smasher/src/hooks/"* "$NEW_BASE/article-smasher/hooks/" 2>/dev/null || true

# Copy services
cp -r "$OLD_BASE/article-smasher/src/services/"* "$NEW_BASE/article-smasher/services/" 2>/dev/null || true

# Copy components
cp -r "$OLD_BASE/article-smasher/src/components/"* "$NEW_BASE/article-smasher/components/" 2>/dev/null || true

# Copy utils
cp -r "$OLD_BASE/article-smasher/src/utils/"* "$NEW_BASE/article-smasher/utils/" 2>/dev/null || true

# Copy styles
cp -r "$OLD_BASE/article-smasher/src/styles/"* "$NEW_BASE/article-smasher/styles/" 2>/dev/null || true
cp "$OLD_BASE/article-smasher/src/index.css" "$NEW_BASE/article-smasher/" 2>/dev/null || true

# Copy main App
cp "$OLD_BASE/article-smasher/src/App.tsx" "$NEW_BASE/article-smasher/" 2>/dev/null || true

echo "Article Smasher files copied."

# Task Smasher Migration
echo "Migrating Task Smasher..."

# Copy components
cp -r "$OLD_BASE/task-smasher/components/"* "$NEW_BASE/task-smasher/components/" 2>/dev/null || true

# Copy hooks
cp -r "$OLD_BASE/task-smasher/hooks/"* "$NEW_BASE/task-smasher/hooks/" 2>/dev/null || true

# Copy utils
cp -r "$OLD_BASE/task-smasher/utils/"* "$NEW_BASE/task-smasher/utils/" 2>/dev/null || true

# Copy types
cp -r "$OLD_BASE/task-smasher/types/"* "$NEW_BASE/task-smasher/types/" 2>/dev/null || true

# Copy main App
cp "$OLD_BASE/task-smasher/TaskSmasherApp.tsx" "$NEW_BASE/task-smasher/" 2>/dev/null || true
cp "$OLD_BASE/task-smasher/config.ts" "$NEW_BASE/task-smasher/" 2>/dev/null || true

echo "Task Smasher files copied."

echo "Migration complete! Now you need to:"
echo "1. Update imports in all files to use AI-Core"
echo "2. Replace AI service calls with useAICore() hook"
echo "3. Test all features"

