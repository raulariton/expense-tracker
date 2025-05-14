import cv2
import numpy as np
from skimage.transform import radon
from PIL import Image
from numpy import asarray, mean, array, argmax



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
    kernel = np.ones((1,1),np.uint8)
    image = cv2.dilate(image,kernel, iterations=1)
    kernel = np.ones((1,1),np.uint8)
    image = cv2.erode(image,kernel, iterations=1 )
    image = cv2.morphologyEx(image,cv2.MORPH_CLOSE, kernel)
    image = cv2.medianBlur(image,3)
    return image


def thin_font(image):
    """
    Thins the text, makes it distinguishable
    """
    image = cv2.bitwise_not(image)
    kernel = np.ones((2,2),np.uint8)
    image = cv2.erode(image,kernel,iterations=1)
    image = cv2.bitwise_not(image)
    return image

def preprocess_receipt(image):
    """
    Pre-processes the image to prepare it for OCR.
    """

    # convert to grayscale
    preprocessed_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    #denoising
    preprocessed_image = noise_removal(preprocessed_image)
   # cv2.imwrite("images/debug_images/denoised.png", preprocessed_image)

    #thin font
    preprocessed_image = thin_font(preprocessed_image)
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

   # cv2.imwrite("images/debug_images/thresholded.png", preprocessed_image)

    # apply CLAHE histogram equalization
   # clahe = cv2.createCLAHE(clipLimit, tileGridSize)
   # preprocessed_image = clahe.apply(preprocessed_image)

   # cv2.imwrite("images/debug_images/clahed.png", preprocessed_image)


    # denoise the image
    preprocessed_image = cv2.fastNlMeansDenoising(
        src=preprocessed_image,
        dst=None,
        h=h,
        templateWindowSize=templateWindowSize,
        searchWindowSize=searchWindowSize,
    )


    # deskew image
    # preprocessed_image = deskew(preprocessed_image)

    # DEBUG: show image
    # cv2.imwrite("images/debug_images/preprocessed.png", preprocessed_image)
    return preprocessed_image

# NOTE: In progress
def adjust_constants(image):
    """
    Adjusts the constants for CLAHE, denoising, and adaptive thresholding
    based on the image properties, aiming for better preprocessing results.
    :param image: The input image to analyze. Must be cropped and perspective transformed.
    """

    # convert to grayscale
    grayscale_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # compute image properties
    height, width = grayscale_image.shape

    histogram = cv2.calcHist([grayscale_image], [0], None, [256], [0, 256])
    # normalize histogram
    histogram = histogram.flatten() / (height * width)

    mean_brightness = grayscale_image.mean()
    std_dev = grayscale_image.std()
    estimated_noise = cv2.Laplacian(grayscale_image, cv2.CV_64F).var()

    # get histogram peaks and valleys
    # this is to estimate the binarization threshold
    histogram_peaks = []
    for i in range(1, len(histogram) - 1):
        if histogram[i] > histogram[i - 1] and histogram[i] > histogram[i + 1]:
            histogram_peaks.append((i, histogram[i]))

    # sort peaks
    histogram_peaks.sort(key=lambda x: x[1], reverse=True)

    # adjust CLAHE constants
    # global clipLimit, tileGridSize
    # # clipLimit
    # if std_dev < 30: # low contrast
    #     clipLimit = 3.0
    # elif std_dev > 70: # high contrast
    #     clipLimit = 1.5
    # else:
    #     clipLimit = 2.0
    # # tileGridSize
    avg_dimension = (height + width) / 2
    # if avg_dimension > 2000:
    #     tileGridSize = (16, 16)
    # elif avg_dimension < 800:
    #     tileGridSize = (4, 4)
    # else:
    #     tileGridSize = (8, 8)

    # adjust denoising constants
    global h, templateWindowSize, searchWindowSize
    # h (denoising strength)
    if estimated_noise < 10:
        h = 3  # Light denoising for clean images
    elif estimated_noise < 30:
        h = 7  # Medium denoising
    elif estimated_noise < 60:
        h = 12  # Stronger denoising
    else:
        h = 17  # Heavy denoising
    # templateWindowSize, searchWindowSize
    if avg_dimension > 2000:
        templateWindowSize = 9
        searchWindowSize = 27
    elif avg_dimension < 800:
        templateWindowSize = 5
        searchWindowSize = 15
    else:
        templateWindowSize = 7
        searchWindowSize = 21

    # adjust adaptive thresholding constants
    global blockSize, C

    # Determine if there's a bimodal histogram (text vs background)
    # if len(histogram_peaks) >= 2 and histogram_peaks[0][1] > 0.01 and histogram_peaks[1][1] > 0.01:
    #     # Bimodal - typical for receipts with clear text/background separation
    #     blockSize = max(11, int(avg_dimension / 100) * 2 + 1)  # Ensure odd number
    #
    #     # Calculate optimal C based on peaks separation
    #     peak_diff = abs(histogram_peaks[0][0] - histogram_peaks[1][0])
    #     C = max(3, min(15, peak_diff // 10))
    # else:
    #     # Not clearly bimodal - use brightness-based approach
    #     if mean_brightness < 100:  # Darker image
    #         blockSize = 15
    #         C = 5
    #     elif mean_brightness > 180:  # Brighter image
    #         blockSize = 13
    #         C = 10
    #     else:  # Medium brightness
    #         blockSize = 11
    #         C = 7
    #
    # # Ensure blockSize is odd
    # blockSize = blockSize if blockSize % 2 == 1 else blockSize + 1


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

# NOTE: In progress
def remove_artifacts(image):
    min_size_ratio = 0.002
    # minimum size as a fraction of the image area (?)

    # calculate minimum contour area
    img_area = image.shape[0] * image.shape[1]
    min_area = int(img_area * min_size_ratio)

    # Find contours in the inverted binary image (white text on black background)
    inverted = cv2.bitwise_not(image)
    contours, _ = cv2.findContours(inverted, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Create a mask with all valid contours
    mask = np.ones_like(image) * 255

    # Draw small contours in black (to remove them)
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            cv2.drawContours(mask, [contour], -1, [0, 0, 0], -1)

    # Apply the mask to the original binary image
    cleaned = cv2.bitwise_and(image, mask)

    return cleaned
