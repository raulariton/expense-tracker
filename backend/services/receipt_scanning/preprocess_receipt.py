import cv2
import numpy as np
from skimage.transform import radon
from PIL import Image
from numpy import mean, array, argmax


# CONSTANTS THAT AFFECT THE PREPROCESSING
# TODO: these should be modified to work ideally universally
# == CLAHE (CONTRASTING) ==
clipLimit = 2.0
# Threshold for contrast limiting.

tileGridSize = (8, 8)
# Size of grid for histogram equalization.
# Input image will be divided into equally sized rectangular tiles.
# tileGridSize defines the number of tiles in row and column.

# == DENOISING ==
h = 5
# Parameter regulating filter strength.
# Big h value perfectly removes noise but also removes image details,
# smaller h value preserves details but also preserves some noise

templateWindowSize = 7
# Size in pixels of the template patch that is used to compute weights.
# Should be odd.
# Recommended value 7 pixels

searchWindowSize = 21
# Size in pixels of the window that is used to compute weighted average for given pixel.
# Should be odd. Affect performance linearly:
# greater searchWindowsSize - greater denoising time.
# Recommended value 21 pixels

# == ADAPTIVE THRESHOLDING (BINARISATION) ==
blockSize = 15
# Size of a pixel neighborhood that is used
# to calculate a threshold value for the pixel:
# 3, 5, 7, and so on.

C = 11
# Constant subtracted from the mean or weighted mean.
# This value can be zero or positive.


# Simple noise removal
def noise_removal(image):
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.dilate(image, kernel, iterations=1)
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
    image = cv2.medianBlur(image, 3)
    return image


def thin_font(image):
    """
    Thins the text, makes it distinguishable
    """

    image = cv2.bitwise_not(image)
    kernel = np.ones((2, 2), np.uint8)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.bitwise_not(image)
    return image


def preprocess_receipt(image):
    """
    Pre-processes the image to prepare it for OCR.
    """

    # convert to grayscale
    preprocessed_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # denoising
    preprocessed_image = noise_removal(preprocessed_image)

    # DEBUG
    #  cv2.imwrite("images/debug_images/denoised.png", preprocessed_image)

    # thin font
    preprocessed_image = thin_font(preprocessed_image)

    # DEBUG
    #  cv2.imwrite("images/debug_images/thinned.png", preprocessed_image)

    # apply adaptive thresholding (binarization)
    preprocessed_image = cv2.adaptiveThreshold(
        preprocessed_image,
        230,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        blockSize,
        C,
    )

    # DEBUG
    #  cv2.imwrite("images/debug_images/thresholded.png", preprocessed_image)

    # denoise the image
    preprocessed_image = cv2.fastNlMeansDenoising(
        src=preprocessed_image,
        dst=None,
        h=h,
        templateWindowSize=templateWindowSize,
        searchWindowSize=searchWindowSize,
    )


    return preprocessed_image


def deskew(numpy_image):
    """
    Deskews the image using the Radon transform.
    :param numpy_image: An image in numpy array format.
    :return: The deskewed image in numpy array format.
    """

    # the credit for the skew angle detection algorithm:
    # https://gist.github.com/endolith/334196bac1cac45a4893#

    def rms_flat(a):
        """
        Return the root-mean-square of all the elements of *a*, flattened out.
        """
        return np.sqrt(np.mean(np.abs(a) ** 2))

    # convert image to PIL (pillow) format
    image = Image.fromarray(numpy_image.astype("uint8"))

    # convert to grayscale
    image = image.convert("L")
    # demean - make the brightness extend above and below zero
    image = image - mean(image)

    # Do the radon transform and display the result
    sinogram = radon(image)

    # Find the RMS value of each row and find "busiest" rotation,
    # where the transform is lined up perfectly with the alternating dark
    # text and white lines
    r = array([rms_flat(line) for line in sinogram.transpose()])
    skew_angle = argmax(r)

    # adjust the skew angle to be between -90 and 90 degrees
    if skew_angle > 90:
        skew_angle = -(skew_angle - 90)
    elif skew_angle > 0:
        skew_angle = min(90 - skew_angle, skew_angle)
    elif skew_angle < -90:
        skew_angle = -(skew_angle + 90)
    elif skew_angle < 0:
        skew_angle = max(-90 - skew_angle, skew_angle)

    # convert image to PIL (pillow) format
    image = Image.fromarray(numpy_image.astype("uint8"))

    # if the skew angle is small, return the image as is
    # this is to avoid rotating the image if it is already straight
    if abs(skew_angle) < 5:
        return np.array(image)
    else:
        image = image.rotate(skew_angle, expand=True, fillcolor="white")
        return np.array(image)
