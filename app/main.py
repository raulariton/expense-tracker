import math
import cv2
import imutils
from imutils.perspective import four_point_transform
import pytesseract
import easyocr
import deskew as dsk
import re


from ocr_preprocessing import pre_process_image as ocr_pre_process_image

from app.perspective_transform import detect_corners, perspective_transform
from image_processing import *
from llm_text_extraction import LLM_extraction
from ultralytics import YOLO

model = YOLO("../receipt_detector/detector.pt")


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

def zoom_in(img_cpy,bounding_box,ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text_tess(receipt):

    options = "--oem 3 --psm 4"

    text = pytesseract.image_to_string(receipt, config=options)

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

def recognize_text_easy(receipt):
    reader = easyocr.Reader(['ro'], gpu=False)
    data = reader.readtext(receipt)
    print(data)
    text_data = ""

    for bbox, text, score in data:
        pts = np.array(bbox, dtype=np.int32)
        cv2.rectangle(receipt, pts[0], pts[2], (0, 255, 0), 2)
        text_data += text + "\n"

    pattern = r'^(?!.*TVA).*total.*$'

    for _ in range(0,len(data)):
        if re.search(pattern, data[_][1], re.IGNORECASE):
            print("Total price is: "+data[_+1][1])

    return text_data

def perspective_transform(orig):
    '''

    :param orig:
    :return the image zoomed in on the receipt (not always):
    '''

    image = imutils.resize(orig.copy(), width=500)

    edged, ratio = pre_process_image(image.copy())
    bounding_box = extract_receipt_bounding_box(edged, image.copy())

    receipt = zoom_in(orig,bounding_box,ratio)  #Pass the original image

    return receipt


def rotate(image: np.ndarray, angle: float, background) -> np.ndarray:
    old_width, old_height = image.shape[:2]
    angle_radian = math.radians(angle)
    width = abs(np.sin(angle_radian) * old_height) + abs(np.cos(angle_radian) * old_width)
    height = abs(np.sin(angle_radian) * old_width) + abs(np.cos(angle_radian) * old_height)

    image_center = tuple(np.array(image.shape[1::-1]) / 2)
    rot_mat = cv2.getRotationMatrix2D(image_center, angle, 1.0)
    rot_mat[1, 2] += (width - old_width) / 2
    rot_mat[0, 2] += (height - old_height) / 2
    return cv2.warpAffine(image, rot_mat, (int(round(height)), int(round(width))), borderValue=background)

def main():

    #receipt = inference("../images/img.png")
    #receipt = ocr_pre_process_image(receipt)
    receipt = cv2.imread("../images/rotated.jpg")
    text = recognize_text_easy(receipt)
    print(text)
    cv2.imshow("receipt",receipt)


    LLM_extraction(text)

    cv2.imwrite("../debug_images/detect.png",receipt)

    cv2.waitKey()


if __name__ == '__main__':
    main()