import math
import cv2
import imutils
from imutils.perspective import four_point_transform
import pytesseract
import easyocr
import re
import numpy as np
from ultralytics import YOLO




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



def zoom_in(img_cpy,bounding_box,ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text_tess(receipt):

    options = "--oem 3 --psm 4"

    text = pytesseract.image_to_string(receipt, config=options).splitlines()

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")

    bounding_boxes(receipt)

    return text

def bounding_boxes(receipt):
    """
    Draws text bounding boxes for tesseract.
    :param receipt: cv2 image
    :return:
    """
    data = pytesseract.image_to_data(receipt, output_type=pytesseract.Output.DICT)

    # Iterate through the data and print the text and its bounding box
    for i in range(len(data['text'])):
        text = data['text'][i]
        if text.strip():  # Ensure the text is not empty
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            cv2.rectangle(receipt, (x, y), (x + w, y + h), (0, 0, 255), 2)

def recognize_text_easy(receipt):
    """
    Uses easyOCR to recognize and draw bounding boxes.
    :param receipt: cv2 image
    :return: list of strings (recognized text)
    """

    reader = easyocr.Reader(['ro'], gpu=False)
    data = reader.readtext(receipt,decoder='beamsearch',link_threshold=0.8)
    print(data)
    text_data = []

    for bbox, text, score in data:
        pts = np.array(bbox, dtype=np.int32)
        cv2.rectangle(receipt, pts[0], pts[2], (0, 255, 0), 2)
        text_data.append(text)

    return text_data

def extract_text(receipt,mode):
    """

    :param receipt: cv2 image
    :param mode: 0 - uses easyOCR, 1 - uses tesseract
    :return: string: Extracted amount.
    """

    text = ""
    if mode == 0:
        text = recognize_text_easy(receipt)
    elif mode == 1:
        text = recognize_text_tess(receipt)


    print(text)

    return find_total(text)

def find_total(text):
    """
    Finds the first list element containing total (but not TVA), using regex.
    Assumes amount is at position to the right from total found.
    :param text: list of strings
    :return: the amount
    """

    pattern = r'^(?!.*TVA).*total.*$'
    amount = r'\d[.,]\d{2}'

    for i in range(0, len(text)):
        if re.search(pattern, text[i], re.IGNORECASE):
            modified_text = text[i+1].replace(" ", "")
            if re.search(amount,modified_text,re.IGNORECASE):
                print("Total price is: " + text[i+1])
                return modified_text
            else:
                print("Total price is: "+text[i+1]+"."+text[i+2])
            return modified_text+"."+text[i+2]


