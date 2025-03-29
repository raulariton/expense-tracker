
from PIL import Image
from imutils.perspective import four_point_transform
import imutils
import numpy as np
import cv2
import pytesseract
import re


ORIGINAL_IMAGE = cv2.imread("images/bon.jpg") #KEEP IN MIND THERE IS A TRIAL JPG AND PNG



def pre_process_image(image):


    # ratio used to scale when countour is found
    ratio = ORIGINAL_IMAGE.shape[1] / float(image.shape[1])

    # Grey Scale (Black and white)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Blur it (to lose nose or unwanted detail)
    blurred = cv2.GaussianBlur(gray, (5, 5,), 0)

    edged = cv2.Canny(blurred, 75, 200)

    cv2.imwrite("blurred_debug.png",blurred)
    cv2.imwrite("edged_debug.png",edged)

    cv2.imshow("blurred", blurred)
    cv2.imshow("edged", edged)




    return edged,ratio

def pre_process_text(receipt):

    receipt = cv2.resize(receipt, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(receipt, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 110, 255,cv2.THRESH_BINARY)[1]



    cv2.imwrite("grey_debug.png", gray)

    return gray

def extract_receipt_bounding_box(edged,image):

    #get countours
    cnts = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)

    img_c = image.copy()
    cv2.drawContours(img_c, cnts, -1, (0, 255, 0), 1)
    cv2.imshow("countour", img_c)
    cv2.imwrite("countour.png", img_c)


    img_box = image.copy()

    bounding_boxes = []
    for contour in cnts:
        x, y, w, h = cv2.boundingRect(contour)
        bounding_boxes.append((x, y, w, h))
        cv2.rectangle(img_box, (x, y), (x + w, y + h), (0, 255, 0), 2)

    # Sort bounding boxes by area (w * h)
    bounding_boxes = sorted(bounding_boxes, key=lambda b: b[2] * b[3], reverse=True)

    rect_contour = None
    if bounding_boxes:
        x, y, w, h = bounding_boxes[0]
        coord_1 = [x,y]
        coord_2 = [x + w,y]
        coord_3 = [x + w,y + h]
        coord_4 = [x,y + h]


        # Convert bounding box to contour
        rect_contour = np.array([
            coord_1, coord_2, coord_3, coord_4
        ], dtype="float32")

        #Write the coords so they can be used by drawContours
        rect_contour2 = np.array([
            coord_1, coord_2, coord_3, coord_4
        ], dtype=np.int32).reshape(-1,1,2)

    img_rec = image.copy()
    cv2.drawContours(img_rec, [rect_contour2], -1, (0, 255, 0), 1)

    print(rect_contour)
    cv2.imshow("Image", image)
    cv2.imwrite("Image_debug.png", image)
    cv2.imshow("bounding_boxes", img_box)
    cv2.imwrite("bounding_boxes_debug.png", img_box)
    cv2.imshow("rect_contour", img_rec)
    cv2.imwrite("rect_contour_debug.png", img_rec)


    return rect_contour

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


def extract_receipt(orig):

    image = imutils.resize(orig.copy(), width=500)  # Resise image to 500 width

    edged,ratio = pre_process_image(image.copy())
    bounding_box = extract_receipt_bounding_box(edged, image.copy())

    receipt = zoom_in(orig,bounding_box,ratio)  #Pass the original image

    return receipt





def main():

    #take the iamge

    receipt = extract_receipt(ORIGINAL_IMAGE)
    recognize_text(receipt)
    cv2.waitKey(0)










if __name__ == '__main__':
    main()