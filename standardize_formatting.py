#!/usr/bin/env python3
"""
Script to standardize formatting across all documentation files.
"""

import os
import re
import sys
from pathlib import Path

def standardize_headers(content):
    """Ensure consistent header formatting."""
    # Ensure document starts with a level 1 header
    if not content.startswith('# '):
        content = '# ' + content.split('\n', 1)[0] + '\n\n' + content.split('\n', 1)[1]
    
    # Ensure there's a blank line after headers
    content = re.sub(r'(^|\n)(#{1,6} .+)(\n)(?!\n)', r'\1\2\3\n', content)
    
    return content

def standardize_lists(content):
    """Ensure consistent list formatting."""
    # Ensure there's a blank line before lists
    content = re.sub(r'(\n)(?!\n)(\s*[-*] )', r'\1\n\2', content)
    
    # Ensure there's a blank line after lists
    content = re.sub(r'(\n\s*[-*] .+)(\n)(?![\s*-]|\n)', r'\1\2\n', content)
    
    return content

def standardize_code_blocks(content):
    """Ensure consistent code block formatting."""
    # Ensure there's a blank line before code blocks
    content = re.sub(r'(\n)(?!\n)(```)', r'\1\n\2', content)
    
    # Ensure there's a blank line after code blocks
    content = re.sub(r'(\n```)(\n)(?!\n)', r'\1\2\n', content)
    
    return content

def standardize_blockquotes(content):
    """Ensure consistent blockquote formatting."""
    # Ensure there's a blank line before blockquotes
    content = re.sub(r'(\n)(?!\n)(> )', r'\1\n\2', content)
    
    # Ensure there's a blank line after blockquotes
    content = re.sub(r'(\n> .+)(\n)(?!>|\n)', r'\1\2\n', content)
    
    return content

def standardize_terminology(content):
    """Ensure consistent terminology."""
    # Standardize terminology
    content = re.sub(r'\bLinear process(es)?\b', r'Linear workflow\1', content, flags=re.IGNORECASE)
    content = re.sub(r'\bAI assistant(s)?\b', r'agent\1', content, flags=re.IGNORECASE)
    content = re.sub(r'\bchild agent(s)?\b', r'sub-agent\1', content, flags=re.IGNORECASE)
    content = re.sub(r'\bLinear task(s)?\b', r'Linear issue\1', content, flags=re.IGNORECASE)
    
    return content

def standardize_links(content):
    """Ensure consistent link formatting."""
    # Convert absolute links to relative links within the docs directory
    content = re.sub(r'\]\(https://github\.com/helaix/agient_ops/blob/main/docs/', r'](../', content)
    
    return content

def standardize_file(file_path):
    """Standardize formatting in a single file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply standardization functions
    content = standardize_headers(content)
    content = standardize_lists(content)
    content = standardize_code_blocks(content)
    content = standardize_blockquotes(content)
    content = standardize_terminology(content)
    content = standardize_links(content)
    
    # Write the standardized content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Standardized: {file_path}")

def main():
    """Main function to standardize all markdown files."""
    docs_dir = Path('docs')
    
    # Find all markdown files
    md_files = list(docs_dir.glob('**/*.md'))
    mdc_files = list(Path('.cursor/rules').glob('**/*.mdc'))
    
    all_files = md_files + mdc_files
    
    print(f"Found {len(all_files)} files to standardize")
    
    # Standardize each file
    for file_path in all_files:
        standardize_file(file_path)
    
    print("Standardization complete!")

if __name__ == "__main__":
    main()

