# from deepface import DeepFace  # type: ignore


# def compare_faces(aadhar_image_path, selfie_image_path):
#     try:
#         result = DeepFace.verify(
#             img1_path=aadhar_image_path,
#             img2_path=selfie_image_path,
#             model_name='Facenet',  
#             enforce_detection=True  
#         )

#         return {
#             "match": result["verified"],
#             "distance": float(result["distance"]),
#             "modelUsed": result["model"],
#             "threshold": result["threshold"],
#             "confidence": float(result.get("similarity_metric", 0)),
#             "message": "Faces match" if result["verified"] else "Faces do not match"
#         }

#     except Exception as e:
#         return {"match": False, "error": str(e)}
# face_verification_service.py

from deepface import DeepFace  # type: ignore
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def compare_faces(aadhar_image_path, selfie_image_path):
    """
    Compare faces between Aadhar card image and selfie using DeepFace
    
    Args:
        aadhar_image_path (str): Path to the Aadhar card image file
        selfie_image_path (str): Path to the selfie image file
        
    Returns:
        dict: Results of face verification
    """
    try:
        # Log file existence and size
        for path, name in [(aadhar_image_path, "Aadhar"), (selfie_image_path, "Selfie")]:
            if os.path.exists(path):
                size = os.path.getsize(path)
                logger.info(f"{name} image found: {path} (Size: {size} bytes)")
            else:
                logger.error(f"{name} image not found: {path}")
                return {
                    "match": False,
                    "error": f"{name} image file not found"
                }
        
        # Perform face verification
        logger.info(f"Starting face verification between {aadhar_image_path} and {selfie_image_path}")
        result = DeepFace.verify(
            img1_path=aadhar_image_path,
            img2_path=selfie_image_path,
            model_name='Facenet',  
            enforce_detection=True,
            detector_backend='opencv'
        )
        
        logger.info(f"Face verification complete: Match={result['verified']}, Distance={result['distance']}")
        
        return {
            "match": result["verified"],  
            "distance": float(result["distance"]),
            "modelUsed": result["model"],
            "threshold": result["threshold"],
            "confidence": 100 - (float(result["distance"]) * 100),
            "message": "Faces match" if result["verified"] else "Faces do not match"
        }

    except Exception as e:
        logger.error(f"Error in face verification: {str(e)}")
        return {
            "match": False, 
            "error": str(e)
        }