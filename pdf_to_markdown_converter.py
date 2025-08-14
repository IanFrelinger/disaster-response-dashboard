#!/usr/bin/env python3
"""
PDF to Markdown Converter
Converts PDF files to well-formatted Markdown with structure preservation.
"""

import argparse
import os
import sys
from pathlib import Path
import re

try:
    import PyPDF2
    import pdfplumber
    import fitz  # PyMuPDF
except ImportError:
    print("Required packages not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2", "pdfplumber", "PyMuPDF"])
    import PyPDF2
    import pdfplumber
    import fitz

def clean_text(text):
    """Clean and format extracted text."""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Fix common PDF extraction issues
    text = text.replace('ﬁ', 'fi')
    text = text.replace('ﬂ', 'fl')
    text = text.replace('ﬀ', 'ff')
    text = text.replace('ﬃ', 'ffi')
    text = text.replace('ﬄ', 'ffl')
    
    # Clean up line breaks
    text = re.sub(r'([a-z])\n([a-z])', r'\1 \2', text)
    
    return text.strip()

def extract_with_pdfplumber(pdf_path):
    """Extract text using pdfplumber for better formatting."""
    text_content = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    cleaned_text = clean_text(text)
                    if cleaned_text:
                        text_content.append(f"## Page {page_num}\n\n{cleaned_text}\n")
    except Exception as e:
        print(f"Warning: pdfplumber extraction failed: {e}")
        return None
    
    return text_content

def extract_with_pymupdf(pdf_path):
    """Extract text using PyMuPDF as fallback."""
    text_content = []
    
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            if text:
                cleaned_text = clean_text(text)
                if cleaned_text:
                    text_content.append(f"## Page {page_num + 1}\n\n{cleaned_text}\n")
        doc.close()
    except Exception as e:
        print(f"Warning: PyMuPDF extraction failed: {e}")
        return None
    
    return text_content

def extract_with_pypdf2(pdf_path):
    """Extract text using PyPDF2 as last resort."""
    text_content = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text:
                    cleaned_text = clean_text(text)
                    if cleaned_text:
                        text_content.append(f"## Page {page_num}\n\n{cleaned_text}\n")
    except Exception as e:
        print(f"Warning: PyPDF2 extraction failed: {e}")
        return None
    
    return text_content

def detect_structure(text_content):
    """Detect and enhance document structure."""
    enhanced_content = []
    
    for page_content in text_content:
        # Extract page header
        page_match = re.match(r'## Page (\d+)\n\n(.*)', page_content, re.DOTALL)
        if page_match:
            page_num = page_match.group(1)
            content = page_match.group(2)
            
            # Try to detect headers
            lines = content.split('\n')
            enhanced_lines = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect potential headers (all caps, short lines, etc.)
                if (len(line) < 100 and 
                    line.isupper() and 
                    not line.isdigit() and
                    len(line.split()) <= 8):
                    enhanced_lines.append(f"### {line}")
                else:
                    enhanced_lines.append(line)
            
            enhanced_content.append(f"## Page {page_num}\n\n" + "\n".join(enhanced_lines) + "\n")
    
    return enhanced_content

def convert_pdf_to_markdown(pdf_path, output_path=None, preserve_structure=True):
    """Convert PDF to Markdown with multiple extraction methods."""
    
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    if output_path is None:
        output_path = Path(pdf_path).with_suffix('.md')
    
    print(f"Converting {pdf_path} to {output_path}...")
    
    # Try different extraction methods in order of preference
    text_content = None
    
    # Method 1: pdfplumber (best formatting)
    print("Trying pdfplumber extraction...")
    text_content = extract_with_pdfplumber(pdf_path)
    
    # Method 2: PyMuPDF (good fallback)
    if not text_content:
        print("Trying PyMuPDF extraction...")
        text_content = extract_with_pymupdf(pdf_path)
    
    # Method 3: PyPDF2 (basic fallback)
    if not text_content:
        print("Trying PyPDF2 extraction...")
        text_content = extract_with_pymupdf(pdf_path)
    
    if not text_content:
        raise RuntimeError("All PDF extraction methods failed")
    
    # Enhance structure if requested
    if preserve_structure:
        print("Enhancing document structure...")
        text_content = detect_structure(text_content)
    
    # Create markdown header
    pdf_name = Path(pdf_path).stem
    markdown_content = f"# {pdf_name}\n\n"
    markdown_content += f"*Converted from PDF: {pdf_path}*\n\n"
    markdown_content += "---\n\n"
    
    # Add content
    markdown_content += "".join(text_content)
    
    # Write output file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"Successfully converted to {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Convert PDF files to Markdown format")
    parser.add_argument("pdf_path", help="Path to the input PDF file")
    parser.add_argument("-o", "--output", help="Output markdown file path (optional)")
    parser.add_argument("--no-structure", action="store_true", help="Disable structure enhancement")
    
    args = parser.parse_args()
    
    try:
        output_file = convert_pdf_to_markdown(
            args.pdf_path, 
            args.output, 
            preserve_structure=not args.no_structure
        )
        print(f"\n✅ Conversion complete! Output saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
