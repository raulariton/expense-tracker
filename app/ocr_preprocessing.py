"""
This module contains the methods
used to preprocess the image just before applying OCR.

As input, it takes the scanned/cropped image of the receipt.
"""

import cv2
import numpy as np

def pre_process_image(image):
    """
    Pre-processes the image to prepare it for OCR.
    :param image: The image to be processed.
    :return: The pre-processed image.
    """
    # convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # apply CLAHE histogram equalization
    # method 1
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # method 2
    # gray = cv2.equalizeHist(gray)

    # apply Gaussian blur

    # apply Canny edge detection
    # denoised = cv2.bilateralFilter(gray, 12, 75, 75)
    denoised = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)

    thresh = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
                                   cv2.THRESH_BINARY, 15, 11)

    # show the images
    cv2.namedWindow('Greyscale', cv2.WINDOW_KEEPRATIO)
    cv2.namedWindow('Enhanced', cv2.WINDOW_KEEPRATIO)
    cv2.imshow("Greyscale", gray)
    cv2.imshow("Enhanced", thresh)
    cv2.imwrite("enhanced.png", thresh)
    cv2.waitKey(0)