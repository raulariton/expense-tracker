
from PIL import Image
from imutils.perspective import four_point_transform
import imutils
import numpy as np
import cv2
import pytesseract
import re





def main():

    


    #take the iamge
    orig = cv2.imread("images/bon.jpg")

    image = orig.copy()
    image = imutils.resize(image, width=500)

    #ratio used to scale when countour is found
    ratio = orig.shape[1] / float(image.shape[1])


    #Grey Scale (Black and white)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    #Blur it (to lose nose or unwanted detail)
    blurred = cv2.GaussianBlur(gray, (5, 5,), 0)




    #Image with all edges found
    edged = cv2.Canny(blurred, 75, 200)


    #Find the countours from the edge image
    cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    #Get the countours as list of list of points
    cnts = imutils.grab_contours(cnts)

    contours = cv2.drawContours(image.copy(), cnts, -1, (0, 255, 0), 1)




    hulls = []
    #Get the convex hulls from those contours
    for c in cnts:
        hulls.append(cv2.convexHull(c))

    img_copy = image.copy()
    for c in hulls:
        cv2.drawContours(img_copy, [c], -1, (0, 255, 0), 1)


    #sort the convex by their area
    hulls = sorted(hulls, key=cv2.contourArea, reverse=True)

    #supposedly the receipt
    largest_hull = hulls[0]

    #some functions to zoom in on the image
    epsilon = 0.02 * cv2.arcLength(largest_hull, True)  # You can adjust this parameter for more/less approximation
    approx = cv2.approxPolyDP(largest_hull, epsilon, True)

    # Check if the approximation has 4 points (a quadrilateral)
    if len(approx) == 4:
        # Draw the quadrilateral (approximation)
        cv2.drawContours(image, [approx], -1, (0, 255, 0), 2)

    cv2.imshow("Quadrilateral Approximation", image)

    receipt = four_point_transform(orig, approx.reshape(4, 2) * ratio)
    # show transformed image
    cv2.imshow("Receipt Transform", imutils.resize(receipt, width=500))

    gray = cv2.cvtColor(receipt, cv2.COLOR_BGR2GRAY)
    cv2.imshow("Gray", gray)

    thresh = cv2.threshold(gray, 0, 100, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    cv2.imshow("Thresh", thresh)

    text = pytesseract.image_to_string(thresh)

    print(text)







    cv2.imshow("Edged", edged)
    cv2.waitKey(0)








if __name__ == '__main__':
    main()