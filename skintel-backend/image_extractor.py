#!/usr/bin/env python3
"""
Image extraction utility for product recommendations
Extracts product images from Myntra URLs
"""

import requests
from bs4 import BeautifulSoup
import re
import json
from urllib.parse import urljoin
import time
from typing import Optional, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductImageExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def extract_myntra_image(self, product_url: str) -> Optional[str]:
        """
        Extract the main product image URL from a Myntra product page
        """
        try:
            # Add delay to be respectful to the server
            time.sleep(0.5)
            
            response = self.session.get(product_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Method 1: Look for main product image in common Myntra selectors
            image_selectors = [
                'img.image-grid-image',
                'img.image-grid-imageFirst',
                '.image-grid-container img',
                '.pdp-product-image img',
                '.image-grid-image',
                'img[src*="assets.myntassets.com"]'
            ]
            
            for selector in image_selectors:
                img_tag = soup.select_one(selector)
                if img_tag and img_tag.get('src'):
                    img_url = img_tag['src']
                    # Ensure it's a full URL
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        img_url = urljoin(product_url, img_url)
                    
                    logger.info(f"Found image: {img_url}")
                    return img_url
            
            # Method 2: Look for images in script tags (JSON data)
            script_tags = soup.find_all('script', type='application/ld+json')
            for script in script_tags:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'image' in data:
                        image_url = data['image']
                        if isinstance(image_url, list) and image_url:
                            return image_url[0]
                        elif isinstance(image_url, str):
                            return image_url
                except json.JSONDecodeError:
                    continue
            
            # Method 3: Look for og:image meta tag
            og_image = soup.find('meta', property='og:image')
            if og_image and og_image.get('content'):
                return og_image['content']
            
            logger.warning(f"No image found for URL: {product_url}")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting image from {product_url}: {str(e)}")
            return None
    
    def get_fallback_image(self, product_category: str) -> str:
        """
        Return a fallback image URL based on product category
        """
        fallback_images = {
            'serum': 'https://via.placeholder.com/300x300/FFB6C1/000000?text=Serum',
            'facewash': 'https://via.placeholder.com/300x300/87CEEB/000000?text=Face+Wash',
            'sunscreen': 'https://via.placeholder.com/300x300/F0E68C/000000?text=Sunscreen',
            'moisturizer': 'https://via.placeholder.com/300x300/98FB98/000000?text=Moisturizer',
            'others': 'https://via.placeholder.com/300x300/DDA0DD/000000?text=Skincare'
        }
        
        return fallback_images.get(product_category.lower(), fallback_images['others'])

# Global instance
image_extractor = ProductImageExtractor()

def get_product_image_url(product_url: str, product_category: str = 'others') -> str:
    """
    Get product image URL with fallback to placeholder
    """
    if not product_url:
        return image_extractor.get_fallback_image(product_category)
    
    # Try to extract the actual image
    image_url = image_extractor.extract_myntra_image(product_url)
    
    if image_url:
        return image_url
    else:
        # Return fallback image
        return image_extractor.get_fallback_image(product_category)

def test_image_extraction():
    """Test the image extraction with a sample URL"""
    sample_urls = [
        "https://www.myntra.com/face-moisturisers/lakme/lakme-absolute-perfect-radiance-skin-lightening-day-creme-15g/4384871/buy",
        "https://www.myntra.com/face-moisturisers/biotique/biotique-bio-morning-nectar-flawless-sustainable-skin-moisturizer-190ml/1661465/buy"
    ]
    
    for url in sample_urls:
        print(f"Testing URL: {url}")
        image_url = get_product_image_url(url, 'moisturizer')
        print(f"Image URL: {image_url}")
        print("-" * 50)

if __name__ == "__main__":
    test_image_extraction()