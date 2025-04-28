import math
import cv2
import imutils
from imutils.perspective import four_point_transform
import pytesseract
import easyocr
import re
import numpy as np
from ultralytics import YOLO

EASYOCR = 0
TESSERACT = 1


def tesseract_ocr(receipt):

    options = "--oem 3 --psm 4"

    text = pytesseract.image_to_string(receipt, config=options).splitlines()

    # DEBUG
    print(text)

    # DEBUG
    draw_tesseract_bounding_boxes(receipt)

    return text


# DEBUG
#  for visualization purposes (understanding the ocr)
def draw_tesseract_bounding_boxes(receipt):
    """
    Draws text bounding boxes for Tesseract.
    :param receipt: Receipt image in cv2 (numpy array) format
    """

    data = pytesseract.image_to_data(receipt, output_type=pytesseract.Output.DICT)

    # Iterate through the data and print the text and its bounding box
    for i in range(len(data["text"])):
        text = data["text"][i]
        if text.strip():  # Ensure the text is not empty
            x, y, w, h = (
                data["left"][i],
                data["top"][i],
                data["width"][i],
                data["height"][i],
            )
            cv2.rectangle(receipt, (x, y), (x + w, y + h), (0, 0, 255), 2)


def easy_ocr(receipt):
    """
    Uses EasyOCR to recognize and draw bounding boxes.
    :param receipt: cv2 image
    :return: list of strings (recognized text)
    """

    reader = easyocr.Reader(["ro"], gpu=False)
    data = reader.readtext(receipt, decoder="beamsearch", link_threshold=0.8)

    text_data = []

    # draw bounding boxes
    # this modifies the original image in place
    for bbox, text, score in data:
        pts = np.array(bbox, dtype=np.int32)
        cv2.rectangle(receipt, pts[0], pts[2], (0, 255, 0), 2)
        text_data.append(text)

    # DEBUG
    print(text_data)

    return text_data


def extract_text(receipt, mode):
    """
    Extracts text from the receipt using OCR.
    :param receipt: The receipt image in cv2 (numpy array) format.
    :param mode: The OCR engine to use (use constant EASYOCR or TESSERACT).
    :return: The raw text extracted from the receipt.
    """

    text = ""
    if mode == EASYOCR:
        text = easy_ocr(receipt)
    elif mode == TESSERACT:
        text = tesseract_ocr(receipt)

    return text
