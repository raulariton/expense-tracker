import imutils
from imutils.perspective import four_point_transform
import pytesseract

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





def main():

    input_image = cv2.imread(r"U:\Projects\receipt-scanner-api\images\stefan_bon.jpg")
    receipt = perspective_transform(input_image)

    # sleep to see the images
    cv2.waitKey(0)

    # text = recognize_text(receipt)
    # LLM_extraction(text)
    # cv2.waitKey(0)



if __name__ == '__main__':
    main()