import math
import cv2
import imutils
from imutils.perspective import four_point_transform
import pytesseract
import easyocr
import deskew as dsk
import re
import numpy as np
from ultralytics import YOLO

#model = YOLO("../receipt_detector/detector.pt")

"""
def inference(file):
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
"""


def zoom_in(img_cpy,bounding_box,ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text_tess(receipt):

    options = "--oem 3 --psm 4"

    text = pytesseract.image_to_string(receipt, config=options).splitLines()

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")
    return text

def bounding_boxes(receipt):
    data = pytesseract.image_to_data(receipt, output_type=pytesseract.Output.DICT)

    # Iterate through the data and print the text and its bounding box
    for i in range(len(data['text'])):
        text = data['text'][i]
        if text.strip():  # Ensure the text is not empty
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            cv2.rectangle([x, y, x + w, y + h], outline="red", width=2)

def find_total(text):
    pattern = r'^(?!.*TVA).*total.*$'

    for i in range(0, len(text)):
        if re.search(pattern, text[i], re.IGNORECASE):
            print("Total price is: " + text[i+1])
            return text[i+1]




def recognize_text_easy(receipt):
    reader = easyocr.Reader(['ro'], gpu=False)
    data = reader.readtext(receipt)
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
    :return: extracted text
    """

    text = ""
    #receipt = inference("../images/img.png")
    #receipt = ocr_pre_process_image(receipt)
    if mode == 0:
        text = recognize_text_easy(receipt)
    elif mode == 1:
        text = recognize_text_tess(receipt)

    print(text)

    return find_total(text)



