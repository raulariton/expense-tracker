import math

import imutils
from imutils.perspective import four_point_transform
import pytesseract
import deskew as dsk
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
        cropped = img[y1:y2, x1:x2]

        # Save or display the crop
        cv2.imwrite(f"crop_{i}.jpg", cropped)
        # OR show it
        cv2.imshow(f"Crop {i}", cropped)

        return cropped

def zoom_in(img_cpy,bounding_box,ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text(receipt):

    receipt = pre_process_text(receipt)

    options = "--psm 4"

    text = pytesseract.image_to_string(receipt, config=options)

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")
    return text

def perpective_transform(orig):
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

    receipt = inference("../images/bon3.jpg")
    text = recognize_text(receipt)

    ocr_pre_process_image(receipt)

    cv2.waitKey(0)



if __name__ == '__main__':
    main()