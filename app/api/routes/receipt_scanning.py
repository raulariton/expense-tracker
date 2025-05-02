from fastapi import APIRouter, File, UploadFile, Depends

from app.models.dbmodels import ExpenseCategory
from app.models.receipt_scanning_models import APIResponse, Expense
from app.services.receipt_scanning.detect_receipt import detect_receipt
from app.services.receipt_scanning.preprocess_receipt import preprocess_receipt
from app.services.receipt_scanning.ocr import extract_text, TESSERACT
from app.services.receipt_scanning.text_processing import process_text
from app.services.auth.utils import db_dependency
from app.models import dbmodels as models
from app.api.routes.auth import get_current_user
import datetime

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

# TODO: Any endpoint with a user dependency
# must be appropriately handled in the frontend when token is expired
@router.post("/submit")
def submit_expense(
    expense_data: dict,
    db: db_dependency,
    current_user: dict = Depends(get_current_user),
):
    """
    Submit an expense to the database.
    """

    # TODO: Check if everything is received in correct type
    db.add(
        models.Expense(
            user_id=current_user.get("user_id"),
            amount=float(expense_data.get("amount")),
            vendor=expense_data.get("vendor"),
            category=ExpenseCategory(expense_data.get("category")),
            date_time=datetime.datetime.fromisoformat(expense_data.get("datetime"))
        )
    )

    db.commit()
