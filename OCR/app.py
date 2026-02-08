from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import logging

from utils import extract_receipt_fields

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Billwise OCR Service", version="1.0.0")

# CORS configuration - match your backend settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def health():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "OCR service running ✅",
        "version": "1.0.0"
    }

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """
    Extract receipt information from uploaded image
    Accepts: PNG, JPG, JPEG, PDF
    Returns: place, date, price, mode, rawText
    """
    try:
        # Validate file type
        allowed_types = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Read file contents
        contents = await file.read()
        
        # Validate file size (max 10MB)
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB"
            )
        
        logger.info(f"Processing file: {file.filename}, size: {len(contents)} bytes")
        
        # Convert to image
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            image_np = np.array(image)
        except Exception as e:
            logger.error(f"Image conversion error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail="Invalid image file or corrupted data"
            )
        
        # Extract receipt fields
        result = extract_receipt_fields(image_np)
        
        logger.info(f"Extraction successful: {result.get('place', 'N/A')}")
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )

@app.get("/health")
def health_check():
    """Detailed health check"""
    import pytesseract
    import cv2
    
    try:
        # Test tesseract
        version = pytesseract.get_tesseract_version()
        cv2_version = cv2.__version__
        
        return {
            "status": "healthy",
            "tesseract_version": str(version),
            "opencv_version": cv2_version,
            "service": "OCR",
            "ready": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "ready": False
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")