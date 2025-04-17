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


def inference(file):
    model = YOLO("receipt_detector/detector.pt")

    results = model(file, save=True, show=True)
    img = results[0].orig_img
    # only one result should be in the image
    for i, box in enumerate(results[0].boxes):
        # Get bounding box in (x1, y1, x2, y2) format
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Convert to int

        # Crop the image
        cropped = img[(y1):(y2), (x1):(x2)]

        # Save or display the crop
        cv2.imwrite(f"crop_{i}.jpg", cropped)

        return cropped


def zoom_in(img_cpy, bounding_box, ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt


def tesseract_ocr(receipt):

    options = "--oem 3 --psm 4"

    text = pytesseract.image_to_string(receipt, config=options).splitlines()

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")

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
    # DEBUG
    # print(data)
    text_data = []

    for bbox, text, score in data:
        pts = np.array(bbox, dtype=np.int32)
        cv2.rectangle(receipt, pts[0], pts[2], (0, 255, 0), 2)
        text_data.append(text)

    return text_data


def extract_text(receipt, mode):
    """
    Extracts text from the receipt using OCR.
    :param receipt: The receipt image in cv2 (numpy array) format.
    :param mode: The OCR engine to use (use constant EASYOCR or TESSERACT).
    :return: Extracted and processed string.
    """

    text = ""
    if mode == EASYOCR:
        text = easy_ocr(receipt)
    elif mode == TESSERACT:
        text = tesseract_ocr(receipt)

    return process_text(text)


def process_text(text):
    """
    Finds the first list element containing total (but not TVA), using regex.
    Assumes amount is at position to the right from total found.
    :param text: list of strings
    :return: the amount
    """

    pattern = r"^(?!.*TVA).*total.*$"
    amount = r"\d[.,]\d{2}"

    for i in range(0, len(text)):
        if re.search(pattern, text[i], re.IGNORECASE):
            modified_text = text[i + 1].replace(" ", "")
            if re.search(amount, modified_text, re.IGNORECASE):
                return modified_text
            return modified_text + "." + text[i + 2]
