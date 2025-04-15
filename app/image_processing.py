import cv2
import numpy as np

def pre_process_image(image):


    blurred = cv2.GaussianBlur(image, (5, 5,), 0)

    gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)

    edged = cv2.Canny(gray, 75, 200)

    cv2.imwrite("../debug_images/blurred_debug.png", blurred)
    cv2.imwrite("../debug_images/edged_debug.png", edged)

    cv2.imshow("blurred", blurred)
    cv2.imshow("edged", edged)

    return edged

def pre_process_text(receipt):

    receipt = cv2.resize(receipt, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    blurred = cv2.GaussianBlur(receipt, (5, 5), 0)
    gray = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 3)

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    cv2.imshow("Blurred", blurred)

    cv2.imwrite("../debug_images/grey_debug.png", gray)
    cv2.imwrite("../debug_images/blurred_text_debug.png", blurred)

    return gray

def extract_receipt_bounding_box(edged,image):

    #Get countours (NumPy arr)
    cnts = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]

    img_c = image.copy()
    cv2.drawContours(img_c, cnts, -1, (0, 255, 0), 1)
    cv2.imshow("countour", img_c)
    cv2.imwrite("../debug_images/countour.png", img_c)

    ordered_cnts = sorted(cnts, key=cv2.contourArea, reverse=True)

    receipt_cnt = image.copy()
    cv2.drawContours(receipt_cnt, [ordered_cnts[1]], -1, (0, 255, 0), 1)
    cv2.imshow("receipt_cnt", receipt_cnt)
    cv2.imwrite("../debug_images/receipt_cnt.png", receipt_cnt)


    img_box = image.copy()

    bounding_boxes = []

    #Make bounding boxes from cnt shape
    for contour in cnts:
        x, y, w, h = cv2.boundingRect(contour)
        bounding_boxes.append((x, y, w, h))
        cv2.rectangle(img_box, (x, y), (x + w, y + h), (0, 255, 0), 2)

    #Sort from bigger area size to smaller
    bounding_boxes = sorted(bounding_boxes, key=lambda b: b[2] * b[3], reverse=True)


    rect_contour = None
    draw_contour = None

    if bounding_boxes:
        rect_contour, draw_contour = convert_bounding_box_to_contour(bounding_boxes[0]) #Assume biggest one is the receipt


    img_rec = image.copy()
    cv2.drawContours(img_rec, [draw_contour], -1, (0, 255, 0), 1)

    print(rect_contour)
    cv2.imshow("Image", image)
    cv2.imwrite("../debug_images/Image_debug.png", image)
    cv2.imshow("bounding_boxes", img_box)
    cv2.imwrite("../debug_images/bounding_boxes_debug.png", img_box)
    cv2.imshow("rect_contour", img_rec)
    cv2.imwrite("../debug_images/rect_contour_debug.png", img_rec)


    return rect_contour

def convert_bounding_box_to_contour(bounding_box):
    # assume biggest area is the receipt
    x, y, w, h = bounding_box
    coord_1 = [x, y]
    coord_2 = [x + w, y]
    coord_3 = [x + w, y + h]
    coord_4 = [x, y + h]

    # NumPy arr conversion - further image processing
    rect_contour = np.array([
        coord_1, coord_2, coord_3, coord_4
    ], dtype="float32")

    # NumPy arr conversion - draw contours for debug
    draw_contour = np.array([
        coord_1, coord_2, coord_3, coord_4
    ], dtype=np.int32).reshape(-1, 1, 2)

    return rect_contour, draw_contour