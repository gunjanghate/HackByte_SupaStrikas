import base64
import google.generativeai as genai
from config import Config
import json
import logging

# Configure Google Gemini API
genai.configure(api_key=Config.GEMINI_API_KEY)

logger = logging.getLogger(__name__)

def encode_image_for_gemini(image_path):
    """
    Encode image for Gemini API
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Image content part for Gemini API
    """
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()
        
    return {
        "mime_type": "image/jpeg",
        "data": image_bytes
    }

def analyze_aadhar_with_gemini(image_path, ocr_data):
    """
    Analyze Aadhar card using Google Gemini API
    
    Args:
        image_path (str): Path to the image file
        ocr_data (dict): OCR extracted data
        
    Returns:
        dict: Analysis results
    """
    try:
        # Prepare the image for Gemini
        image_part = encode_image_for_gemini(image_path)
        
        # Create a model instance
        model = genai.GenerativeModel(Config.GEMINI_MODEL)
        
        # Prepare the prompt
        prompt = f"""
        Analyze this Aadhar card image for authentication. An Aadhar card is India's national ID.
        
        Here's OCR-extracted data that you should verify against what's visible in the image:
        Name: {ocr_data.get('name', 'Not extracted')}
        Aadhar Number: {ocr_data.get('aadhar_number', 'Not extracted')}
        Date of Birth: {ocr_data.get('date_of_birth', 'Not extracted')}
        Gender: {ocr_data.get('gender', 'Not extracted')}
        Address: {ocr_data.get('address', 'Not extracted')}
        
        Please analyze the following aspects:
        1. Visual authenticity: Check for signs of tampering, editing, inconsistent fonts, etc.
        2. Structural integrity: Verify the card follows official Aadhar layout with proper hologram positions, UIDAI logo, etc.
        3. Data consistency: Check if the OCR data matches what's visible in the image
        4. Security features: Look for expected security features like QR code, ghost image, etc.
        
        Format your response as a JSON object with these fields:
        - is_authentic (boolean): Whether the document appears authentic
        - confidence (number 0-100): Confidence level in the assessment
        - findings (array): List of observations with 'type' ('positive'/'negative'/'neutral') and 'description'
        - security_issues (array): List of security concerns with 'title' and 'description'
        - ocr_match_results (object): For each OCR field, indicate if it matches what's visible (true/false)
        
        Return only the JSON object, nothing else.
        """
        
        # Generate content
        response = model.generate_content([prompt, image_part])
        
        # Parse the response - expected to be JSON
        response_text = response.text
        
        # Extract JSON from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        
        # Parse JSON
        analysis_results = json.loads(response_text)
        
        # Ensure all expected fields are present
        default_result = {
            "is_authentic": False,
            "confidence": 0,
            "findings": [{"type": "negative", "description": "Failed to analyze document properly"}],
            "security_issues": [{"title": "Analysis Error", "description": "Could not complete security analysis"}],
            "ocr_match_results": {k: False for k in ocr_data.keys() if ocr_data[k] is not None}
        }
        
        for key in default_result:
            if key not in analysis_results:
                analysis_results[key] = default_result[key]
        
        return analysis_results
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        
        # Return default failure result
        return {
            "is_authentic": False,
            "confidence": 0,
            "findings": [
                {"type": "negative", "description": "Failed to analyze document due to an error"}
            ],
            "security_issues": [
                {"title": "Analysis Error", "description": f"Error during document analysis: {str(e)}"}
            ],
            "ocr_match_results": {k: False for k in ocr_data.keys() if ocr_data[k] is not None}
        }

# Import regex here for JSON extraction
import re