from fastapi import APIRouter, File, UploadFile

from app.models.receipt_scanning_models import APIResponse
from app.services.receipt_scanning.detect_receipt import detect_receipt
from app.services.receipt_scanning.preprocess_receipt import preprocess_receipt
from app.services.receipt_scanning.ocr import extract_text, TESSERACT
from app.services.receipt_scanning.text_processing import process_text

import numpy as np
import cv2

router = APIRouter()


@router.post("/upload", response_model=APIResponse)
async def upload_file(file: UploadFile = File(...)):
    image = await file.read()

    # convert byte data to a numpy array
    np_array = np.frombuffer(image, np.uint8)
    # decode image for cv2 (openCV)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    # detect receipt, crop it and perspective transform it
    receipt = detect_receipt(image)

    # preprocess for OCR
    preprocessed_receipt = preprocess_receipt(receipt)

    # perform OCR, extract raw text
    text = extract_text(preprocessed_receipt, TESSERACT)

    # process raw text and create an Expense object
    # containing all extracted data
    expense_data = process_text(text)

    # return class
    # FastAPI automatically serializes it to JSON
    return APIResponse(
        status_code=200,
        expense_data=expense_data,
    )
