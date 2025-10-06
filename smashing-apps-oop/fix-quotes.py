#!/usr/bin/env python3
"""
Fix mismatched quotes in import statements
"""

import os
import re

def fix_file(filepath):
    """Fix mismatched quotes in a single file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix patterns like: from "...path'
    content = re.sub(r'from "([^"]+)\'', r"from '\1'", content)
    
    # Fix patterns like: from '...path"
    content = re.sub(r"from '([^']+)\"", r"from '\1'", content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
        return True
    return False

def main():
    """Fix all TypeScript files in src/tools"""
    fixed_count = 0
    
    for root, dirs, files in os.walk('src/tools'):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed_count += 1
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()

