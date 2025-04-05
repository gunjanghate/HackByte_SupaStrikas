import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration settings for the Flask application"""
    
    # Flask configuration
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key-for-dev')
    
    # Google Gemini API
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-pro-vision')
    
    # OCR Configuration
    OCR_ENGINE = os.environ.get('OCR_ENGINE', 'tesseract')  # Default to tesseract
    
    # Image validation
    MAX_IMAGE_SIZE_MB = int(os.environ.get('MAX_IMAGE_SIZE_MB', 5))  # 5MB default
    ALLOWED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png']