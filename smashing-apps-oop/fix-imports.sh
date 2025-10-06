#!/bin/bash

# Fix import paths in Article Smasher
echo "Fixing Article Smasher import paths..."

# Fix paths in services (4 levels up -> 3 levels up)
find src/tools/article-smasher/services -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../shared/|from "../../../shared/|g' "$file"
  sed -i '' 's|from .\{0,1\}../../../../core/|from "../../../../core/|g' "$file"
done

# Fix paths in hooks (4 levels up -> 3 levels up)
find src/tools/article-smasher/hooks -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../shared/|from "../../../shared/|g' "$file"
done

# Fix paths in contexts (4 levels up -> 3 levels up)
find src/tools/article-smasher/contexts -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../shared/|from "../../../shared/|g' "$file"
done

# Fix paths in utils (4 levels up -> 3 levels up)
find src/tools/article-smasher/utils -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../shared/|from "../../../shared/|g' "$file"
done

# Fix paths in admin components (6 levels up -> 5 levels up)
find src/tools/article-smasher/components/admin -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../../shared/|from "../../../../shared/|g' "$file"
done

# Fix paths in step components (7 levels up -> 6 levels up)
find src/tools/article-smasher/components/steps -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../../../shared/|from "../../../../../shared/|g' "$file"
done

# Fix paths in layout components (6 levels up -> 5 levels up)
find src/tools/article-smasher/components/layout -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../../shared/|from "../../../../shared/|g' "$file"
done

# Fix paths in complete components (6 levels up -> 5 levels up)
find src/tools/article-smasher/components/complete -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../../../shared/|from "../../../../shared/|g' "$file"
done

echo "Article Smasher import paths fixed."

# Fix import paths in Task Smasher
echo "Fixing Task Smasher import paths..."

# Task Smasher main app
sed -i '' 's|from .\{0,1\}../../components/|from "../../../components/|g' src/tools/task-smasher/TaskSmasherApp.tsx
sed -i '' 's|from .\{0,1\}../../shared/|from "../../../shared/|g' src/tools/task-smasher/TaskSmasherApp.tsx

# Task Smasher components
find src/tools/task-smasher/components -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's|from .\{0,1\}../../../shared/|from "../../../../shared/|g' "$file"
  sed -i '' 's|from .\{0,1\}../../../components/|from "../../../../components/|g' "$file"
done

echo "Task Smasher import paths fixed."

echo "All import paths fixed!"

