from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import tempfile
from services.ocr_service import extract_aadhar_info
from services.gemini_service import analyze_aadhar_with_gemini
from utils.image_utils import save_base64_image, validate_image
from config import Config
from services.face_verification_service import compare_faces

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})
# CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"}), 200

@app.route('/api/compare-faces', methods=['POST'])
def compare_faces_only():
    """
    Compares selfie with Aadhar image and returns match result.
    """
    if not request.json or 'aadharImage' not in request.json or 'selfieImage' not in request.json:
        return jsonify({"error": "Missing Aadhar or Selfie image data"}), 400

    try:
        aadhar_image = request.json['aadharImage']
        selfie_image = request.json['selfieImage']

        if not validate_image(aadhar_image) or not validate_image(selfie_image):
            return jsonify({"error": "Invalid or corrupted image(s)"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_aadhar, \
             tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_selfie:

            aadhar_path = temp_aadhar.name
            selfie_path = temp_selfie.name

            save_base64_image(aadhar_image, aadhar_path)
            save_base64_image(selfie_image, selfie_path)

        try:
            face_match_result = compare_faces(aadhar_path, selfie_path)
            return jsonify(face_match_result), 200

        finally:
            os.unlink(aadhar_path)
            os.unlink(selfie_path)

    except Exception as e:
        app.logger.error(f"Error comparing faces: {str(e)}")
        return jsonify({"error": "Face verification failed", "details": str(e)}), 500

# @app.route('/api/verify-aadhar-face', methods=['POST'])
# def verify_aadhar_with_face():
#     """
#     Endpoint to verify Aadhar and match user's selfie with the Aadhar card photo
#     """
#     if not request.json or 'aadharImage' not in request.json or 'selfieImage' not in request.json:
#         return jsonify({"error": "Missing Aadhar or Selfie image data"}), 400

#     try:
#         aadhar_image = request.json['aadharImage']
#         selfie_image = request.json['selfieImage']

#         # Validate images
#         if not validate_image(aadhar_image) or not validate_image(selfie_image):
#             return jsonify({"error": "Invalid or corrupted image(s)"}), 400

#         with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_aadhar, \
#              tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_selfie:

#             aadhar_path = temp_aadhar.name
#             selfie_path = temp_selfie.name

#             save_base64_image(aadhar_image, aadhar_path)
#             save_base64_image(selfie_image, selfie_path)

#         try:
#             # Step 1: OCR & Gemini analysis
#             ocr_data = extract_aadhar_info(aadhar_path)
#             analysis_results = analyze_aadhar_with_gemini(aadhar_path, ocr_data)

#             # Step 2: Face Verification
#             face_match_result = compare_faces(aadhar_path, selfie_path)

#             # Combine everything
#             return jsonify({
#                 "ocrData": ocr_data,
#                 "analysis": {
#                     "isAuthentic": analysis_results["is_authentic"],
#                     "confidence": analysis_results["confidence"],
#                     "findings": analysis_results["findings"],
#                     "securityIssues": analysis_results["security_issues"],
#                     "ocrMatchResults": analysis_results["ocr_match_results"]
#                 },
#                 "faceMatch": face_match_result
#             }), 200

#         finally:
#             # Clean up temp files
#             os.unlink(aadhar_path)
#             os.unlink(selfie_path)

#     except Exception as e:
#         app.logger.error(f"Error in Aadhar-face verification: {str(e)}")
#         return jsonify({"error": "Failed to process the verification"}), 500
    
@app.route('/api/verify-aadhar', methods=['POST'])
def verify_aadhar():
    """Endpoint to verify an Aadhar card image"""
    if not request.json or 'image' not in request.json:
        return jsonify({"error": "Missing image data"}), 400
    
    try:
        # Get the base64 image data
        base64_image = request.json['image']
        
        # Validate image before processing
        if not validate_image(base64_image):
            return jsonify({"error": "Invalid image format or corrupted image"}), 400
        
        # Save the image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_path = temp_file.name
            save_base64_image(base64_image, temp_path)
        
        try:
            # Extract information using OCR
            ocr_data = extract_aadhar_info(temp_path)
            
            # Analyze the document using Google Gemini AI
            analysis_results = analyze_aadhar_with_gemini(temp_path, ocr_data)
            
            # Combine results
            results = {
                "isAuthentic": analysis_results["is_authentic"],
                "confidence": analysis_results["confidence"],
                "findings": analysis_results["findings"],
                "securityIssues": analysis_results["security_issues"],
                "ocrData": ocr_data,
                "ocrMatchResults": analysis_results["ocr_match_results"]
            }
            
            return jsonify(results), 200
            
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Failed to process the document"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=Config.DEBUG)

