import cv2
import numpy as np
from skimage.transform import radon
from PIL import Image
from numpy import asarray, mean, array

try:
    from parabolic import parabolic

    def argmax(x):
        return parabolic(x, np.argmax(x))[0]

except ImportError:
    from numpy import argmax

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


def preprocess_receipt(image):
    """
    Pre-processes the image to prepare it for OCR.
    """

    # convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # apply CLAHE histogram equalization
    clahe = cv2.createCLAHE(clipLimit, tileGridSize)
    gray = clahe.apply(gray)

    # denoise the image
    denoised = cv2.fastNlMeansDenoising(
        src=gray,
        dst=None,
        h=h,
        templateWindowSize=templateWindowSize,
        searchWindowSize=searchWindowSize,
    )

    # apply adaptive thresholding (binarisation)
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, blockSize, C
    )

    # rotate the image
    rotated = rotate_image(thresh)

    return rotated


def rotate_image(numpy_image):
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
    rotation = argmax(r)

    # convert image to PIL (pillow) format
    image = Image.fromarray(numpy_image.astype("uint8"))
    # Rotate the image by the inverse of the output
    # rotate as less as possible
    print(f"rotation: {rotation}")
    if rotation > 90:
        if abs((180 - rotation)) < abs(rotation):
            rotation = abs(180 - rotation)
    else:
        if abs((90 - rotation)) < abs(rotation):
            rotation = abs(90 - rotation)


    image = image.rotate(rotation, expand=True, fillcolor="white")

    # show image
    image.show()

    # return as numpy array
    return asarray(image)
