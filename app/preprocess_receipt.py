import cv2
import numpy as np
from matplotlib import cm
from skimage.transform import radon
from PIL import Image
from numpy import asarray, mean, array

try:
    from parabolic import parabolic

    def argmax(x):
        return parabolic(x, np.argmax(x))[0]

except ImportError:
    from numpy import argmax


def preprocess_receipt(image):
    """
    Pre-processes the image to prepare it for OCR.
    """

    # convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # apply CLAHE histogram equalization
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # denoise the image
    denoised = cv2.fastNlMeansDenoising(
        src=gray, dst=None, h=7, templateWindowSize=9, searchWindowSize=27
    )

    # apply adaptive thresholding (binarization)
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, 11
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
    if (90 - rotation) < rotation:
        rotation = 90 - rotation

    image = image.rotate(rotation, expand=True, fillcolor="white")

    # show image
    image.show()

    # return as numpy array
    return np.array(image)
