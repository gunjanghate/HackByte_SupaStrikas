import pytesseract
from PIL import Image
import re
import logging
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
logger = logging.getLogger(__name__)

def extract_aadhar_info(image_path):
    """
    Extract information from an Aadhar card image using OCR
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Extracted information from the Aadhar card
    """
    try:
        # Open image with PIL
        image = Image.open(image_path)
        
        # Use pytesseract to extract text
        text = pytesseract.image_to_string(image)
        
        # Extract information using regex patterns
        aadhar_number = extract_aadhar_number(text)
        name = extract_name(text)
        dob = extract_dob(text)
        gender = extract_gender(text)
        address = extract_address(text)
        
        return {
            "aadhar_number": aadhar_number,
            "name": name,
            "date_of_birth": dob,
            "gender": gender,
            "address": address
        }
    except Exception as e:
        logger.error(f"OCR extraction failed: {str(e)}")
        return {
            "aadhar_number": None,
            "name": None,
            "date_of_birth": None,
            "gender": None,
            "address": None
        }

def extract_aadhar_number(text):
    """Extract Aadhar number using regex"""
    # Typical format: XXXX XXXX XXXX or XXXX-XXXX-XXXX
    pattern = r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'
    matches = re.findall(pattern, text)
    if matches:
        # Clean the matched number by removing spaces/hyphens
        return re.sub(r'[\s-]', '', matches[0])
    return None

def extract_name(text):
    """Extract name from the text"""
    # Usually, the name comes after "Name:" or is near "DOB" or other identifiers
    name_patterns = [
        r'Name[:\s]+([A-Za-z\s]+)',
        r'([A-Za-z\s]+)\s+DOB',
        r'([A-Za-z\s]+)\s+Male',
        r'([A-Za-z\s]+)\s+Female'
    ]
    
    for pattern in name_patterns:
        matches = re.search(pattern, text)
        if matches:
            return matches.group(1).strip()
    
    return None

def extract_dob(text):
    """Extract date of birth using regex"""
    # Format: DD/MM/YYYY or DD-MM-YYYY
    dob_patterns = [
        r'DOB[:\s]+(\d{2}[/-]\d{2}[/-]\d{4})',
        r'Date of Birth[:\s]+(\d{2}[/-]\d{2}[/-]\d{4})',
        r'(\d{2}[/-]\d{2}[/-]\d{4})'
    ]
    
    for pattern in dob_patterns:
        matches = re.search(pattern, text)
        if matches:
            return matches.group(1)
    
    return None

def extract_gender(text):
    """Extract gender from the text"""
    # Look for "MALE" or "FEMALE" keywords
    if re.search(r'\bMALE\b', text, re.IGNORECASE):
        return "Male"
    elif re.search(r'\bFEMALE\b', text, re.IGNORECASE):
        return "Female"
    return None

def extract_address(text):
    """Extract address from the text"""
    # Addresses can be complex - look for patterns like:
    # Address:, Pin code, or after DOB/gender sections
    address_patterns = [
        r'Address[:\s]+(.+?)(?=\n\n|\n[A-Z]|\Z)',
        r'(?:DOB|Gender)[:\s]+.+?\n(.+?)(?=\n\n|\Z)',
        r'(?:Pin|Pincode)[:\s]+\d{6}'
    ]
    
    for pattern in address_patterns:
        matches = re.search(pattern, text, re.DOTALL)
        if matches:
            address = matches.group(1).strip()
            # Clean up multiple whitespaces and newlines
            address = re.sub(r'\s+', ' ', address)
            return address
    
    return None