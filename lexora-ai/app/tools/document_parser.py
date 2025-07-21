import re
import requests
from typing import Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup


class LegalDocumentParser:
    """Parser for lex.uz legal documents to extract clean, structured content"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def convert_url_to_acts_format(self, url: str) -> str:
        """Convert lex.uz URLs to acts format for better content access"""
        doc_id = self._extract_document_id(url)
        if doc_id:
            return f"https://lex.uz/acts/{doc_id}"
        return url
    
    def _extract_document_id(self, url: str) -> Optional[str]:
        """Extract document ID from lex.uz URLs"""
        patterns = [
            r"/docs/(\d+)",
            r"/acts/(\d+)",
            r"id[=:](\d+)",
            r"/(\d+)(?:\?|$)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def fetch_document_html(self, url: str) -> Optional[str]:
        """Fetch HTML content from lex.uz document URL"""
        try:
            acts_url = self.convert_url_to_acts_format(url)
            response = self.session.get(acts_url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching document: {e}")
            return None
    
    def extract_document_metadata(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """Extract metadata from the document"""
        metadata = {
            "source_url": url,
            "document_id": self._extract_document_id(url),
            "parsed_date": datetime.now().isoformat(),
            "title": "",
            "document_type": "",
            "adoption_date": "",
            "effective_date": "",
            "document_number": ""
        }
        
        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            metadata["title"] = title_tag.get_text().strip()
        
        # Try to find document details
        for tag in soup.find_all(['h1', 'h2', 'h3']):
            text = tag.get_text().strip()
            if "№" in text or "от" in text:
                metadata["document_number"] = text
                break
        
        return metadata
    
    def clean_and_structure_content(self, soup: BeautifulSoup) -> str:
        """Extract and clean document content"""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer']):
            element.decompose()
        
        # Find main content
        content_div = soup.find('div', class_='document-content') or soup.find('div', id='content') or soup
        
        # Extract text and maintain structure
        paragraphs = []
        for element in content_div.find_all(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']):
            text = element.get_text().strip()
            if text and len(text) > 10:  # Filter out very short texts
                if element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    paragraphs.append(f"\n## {text}\n")
                else:
                    paragraphs.append(text)
        
        return "\n\n".join(paragraphs)
    
    def parse_legal_document(self, url: str) -> Dict[str, Any]:
        """Parse a legal document from lex.uz and return structured content"""
        try:
            # Fetch HTML
            html_content = self.fetch_document_html(url)
            if not html_content:
                return {"success": False, "error": "Failed to fetch document"}
            
            # Parse HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract metadata
            metadata = self.extract_document_metadata(soup, url)
            
            # Extract and clean content
            content = self.clean_and_structure_content(soup)
            
            if not content:
                return {"success": False, "error": "No content extracted"}
            
            return {
                "success": True,
                "markdown": content,
                "metadata": metadata,
                "parsing_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}


# Create global instance
legal_parser_instance = LegalDocumentParser()