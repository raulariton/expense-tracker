from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.classes.exceptions import (
    SegmentationModelError,
    EdgeDetectionError,
    PerspectiveTransformationError,
    OCRProcessingError,
)
from app.classes.receipt_models import APIResponse
from app.detect_receipt import detect_receipt
from app.preprocess_receipt import preprocess_receipt
from app.ocr import extract_text, EASYOCR
from app.text_processing import process_text


import numpy as np
import cv2
from pydantic import BaseModel


# TODO:
# make sure to remove any DEBUG comments
# these are just made for visualization purposes


# classes
class ReceiptData(BaseModel):
    total_amount: float


# initialize FastAPI object
app = FastAPI()

origins = [
    # here we can add the list of domains
    # that are allowed to access the server
    # (anything that will use the API)
    "http://localhost:5173",
]

# add the middleware to the FastAPI object
# to allow CORS, which controls who can access
# the API (in our case, the frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # allow sending JWT tokens (?)
    allow_credentials=True,
    # allow all methods (GET, POST, PUT, etc.)
    allow_methods=["*"],
    # allow all headers
    allow_headers=["*"],
)


# define exception handlers
@app.exception_handler(SegmentationModelError)
async def segmentation_model_exception_handler(request, exc: SegmentationModelError):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "details": exc.message,
        },
    )


@app.exception_handler(EdgeDetectionError)
async def edge_detection_exception_handler(request, exc: EdgeDetectionError):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Bad image; unable to detect any contours",
            "details": exc.message,
        },
    )


@app.exception_handler(PerspectiveTransformationError)
async def perspective_transformation_exception_handler(
    request, exc: PerspectiveTransformationError
):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Bad image; unable to perform perspective transformation",
            "details": exc.message,
        },
    )


@app.exception_handler(OCRProcessingError)
async def ocr_processing_exception_handler(request, exc: OCRProcessingError):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Bad image; did not find necessary text",
            "details": exc.message,
        },
    )


@app.post("/upload")
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
    text = extract_text(preprocessed_receipt, EASYOCR)

    # process raw text and create an Expense object
    # containing all extracted data
    receipt_data = process_text(text)

    # return class
    # FastAPI automatically serializes it to JSON
    return APIResponse(
        status_code=200,
        receipt_data=receipt_data,
    )
