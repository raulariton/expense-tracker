import imutils
from imutils.perspective import four_point_transform
import cv2
import pytesseract
from image_processing import *
from llm_text_extraction import LLM_extraction



def zoom_in(img_cpy,bounding_box,ratio):

    # some functions to zoom in on the image
    epsilon = 0.05 * cv2.arcLength(bounding_box, True)  # You can adjust this parameter for more/less approximation
    approx = cv2.approxPolyDP(bounding_box, epsilon, True)


    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text(receipt):

    receipt = pre_process_text(receipt)

    options = "--psm 4"
    text = pytesseract.image_to_string(
        cv2.cvtColor(receipt, cv2.COLOR_BGR2RGB),
        config=options)

    cv2.imshow("Text",receipt)
    # show the raw output of the OCR process
    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")
    return text

def extract_receipt(orig):

    image = imutils.resize(orig.copy(), width=500)  # Resise image to 500 width

    edged,ratio = pre_process_image(image.copy())
    bounding_box = extract_receipt_bounding_box(edged, image.copy())

    receipt = zoom_in(orig,bounding_box,ratio)  #Pass the original image

    return receipt





def main():

    #take the iamge

    receipt = extract_receipt(ORIGINAL_IMAGE)
    text = recognize_text(receipt)
    LLM_extraction(text)
    cv2.waitKey(0)










if __name__ == '__main__':
    main()