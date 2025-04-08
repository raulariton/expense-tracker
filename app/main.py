import math

import imutils
from imutils.perspective import four_point_transform
import pytesseract
import deskew as dsk
from ocr_preprocessing import pre_process_image as ocr_pre_process_image

from app.perspective_transform import detect_corners, perspective_transform
from image_processing import *
from llm_text_extraction import LLM_extraction

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

    image = cv2.imread(r"U:\Projects\receipt-scanner-api\images\scanned_ideal_receipt_skewed.jpg")
    ocr_pre_process_image(image)

    # sleep to see the images
    cv2.waitKey(0)

    # text = recognize_text(receipt)
    # LLM_extraction(text)
    # cv2.waitKey(0)



if __name__ == '__main__':
    main()