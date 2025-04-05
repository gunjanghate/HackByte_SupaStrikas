import base64
import io
from PIL import Image
import re
import magic
from config import Config

def save_base64_image(base64_data, output_path):
    """
    Save a base64 encoded image to a file
    
    Args:
        base64_data (str): Base64 encoded image data
        output_path (str): Path where to save the image
    """
    # Decode the base64 data
    image_data = base64.b64decode(base64_data)
    
    # Write the binary data to a file
    with open(output_path, 'wb') as f:
        f.write(image_data)

def validate_image(base64_data):
    """
    Validate that the base64 data is a valid image
    
    Args:
        base64_data (str): Base64 encoded image data
        
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        # Decode the base64 data
        image_data = base64.b64decode(base64_data)
        
        # Check file size
        file_size_mb = len(image_data) / (1024 * 1024)
        if file_size_mb > Config.MAX_IMAGE_SIZE_MB:
            return False
        
        # Check the file type
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(image_data)
        
        # Check if it's an allowed image format
        if not any(fmt in file_type for fmt in ["jpeg", "jpg", "png"]):
            return False
        
        # Try to open it with PIL to verify it's a valid image
        Image.open(io.BytesIO(image_data))
        
        return True
    except Exception:
        return False

def extract_exif_data(image_path):
    """
    Extract EXIF data from an image
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: EXIF data
    """
    try:
        image = Image.open(image_path)
        exif_data = {}
        
        if hasattr(image, '_getexif'):
            exif_info = image._getexif()
            if exif_info:
                for tag, value in exif_info.items():
                    exif_data[tag] = value
        
        return exif_data
    except Exception:
        return {}

def detect_image_tampering(image_path):
    """
    Basic checks for potential image tampering
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        list: List of potential tampering indicators
    """
    tampering_indicators = []
    
    try:
        # Open the image
        image = Image.open(image_path)
        
        # Check for EXIF data anomalies
        exif_data = extract_exif_data(image_path)
        if not exif_data:
            tampering_indicators.append("No EXIF data found - possible sign of editing")
        
        # Additional checks can be added here:
        # - Error Level Analysis (ELA)
        # - Noise inconsistencies
        # - Compression artifacts analysis
        
        return tampering_indicators
    except Exception:
        return ["Failed to analyze image for tampering"]


