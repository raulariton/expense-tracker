import cv2
import numpy as np

def detect_corners(image):
    """
    Detects the receipt object, and returns the 
    4 points of the bounding box
    """

    receipt_outline_mask = get_receipt_outline_mask(image)

    print(len(receipt_outline_mask.shape))

    # use shi-tomasi corner detection
    # NOTE: qualityLevel and minDistance are important
    #  and affect the result significantly
    corners = cv2.goodFeaturesToTrack(
        image=receipt_outline_mask,
        maxCorners=4,
        qualityLevel=0.5,
        minDistance=10
    )

    # sort the corners in clockwise order
    corners = sorted_in_clockwise_order(corners)

    return corners

def get_receipt_outline_mask(image):
    """
    Outlines the largest area in the image using Canny edge detection,
    and removes anything outside the largest area and
    everything inside it.

    :returns: A mask with the largest area (the receipt) outlined
    """

    # create a mask for the largest contour
    mask = np.zeros_like(image)

    largest_contour = get_largest_contour(image)

    cv2.drawContours(
        mask,
        [largest_contour],
        contourIdx=-1,
        color=(255, 0, 4)
    )

    # DEBUG
    # show the image with contour
    cv2.namedWindow("Receipt contour", cv2.WINDOW_KEEPRATIO)
    cv2.imshow("Receipt contour", mask)

    # retrieve the outline of the largest area
    # in float32 format
    # for corner detection
    return cv2.cvtColor(np.float32(mask), cv2.COLOR_BGR2GRAY)

def sorted_in_clockwise_order(corner_points):

    if corner_points.shape[0] != 4:
        return None

    # center point
    center = np.mean(corner_points, axis=0)

    # sort the corner points in clockwise order
    # for perspective transformation
    cyclic = [
        # top-left
        corner_points[np.where(np.logical_and(corner_points[:, 0, 0] < center[0, 0],
                                              corner_points[:, 0, 1] < center[0, 1]))[0][0]],
        # top-right
        corner_points[np.where(np.logical_and(corner_points[:, 0, 0] > center[0, 0],
                                              corner_points[:, 0, 1] < center[0, 1]))[0][0]],
        # bottom-Right
        corner_points[np.where(np.logical_and(corner_points[:, 0, 0] > center[0, 0],
                                              corner_points[:, 0, 1] > center[0, 1]))[0][0]],
        # bottom-Left
        corner_points[np.where(np.logical_and(corner_points[:, 0, 0] < center[0, 0],
                                              corner_points[:, 0, 1] > center[0, 1]))[0][0]]
    ]

    return np.array(cyclic)

def get_largest_contour(image):
    """
    Detects the contours in the image
    and keeps only the largest one in terms of area
    :param image: The image to be processed.
    :return: The largest contour in the image

    NOTE: This is the edge/contour detection function
     that can be modified further.
    """

    '''
    TODO: Look into adaptive thresholding
    as an alternative to Canny edge detection
    thresh = cv2.adaptiveThreshold(
        image_greyscale,
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 
        11, 
        2
    )
    '''

    # convert to greyscale
    image_greyscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    kernel_size = int((0.01 * image.shape[1]) // 2) * 2 + 1
    # apply gaussian blur
    blurred_image = cv2.GaussianBlur(
        image_greyscale,
        (kernel_size, kernel_size),
        10
    )

    # DEBUG
    # show the blurred image
    cv2.namedWindow('Blurred', cv2.WINDOW_KEEPRATIO)
    cv2.imshow("Blurred", blurred_image)

    # use canny edge detection
    # NOTE: the thresholds affect the result significantly
    canny_outlined_image = cv2.Canny(
        blurred_image,
        12,
        14
    )

    # find contours
    contours = cv2.findContours(
        image=canny_outlined_image,
        mode=cv2.RETR_EXTERNAL,
        method=cv2.CHAIN_APPROX_SIMPLE
    )[0]

    # DEBUG
    # show the image with contours
    cv2.namedWindow("Canny Contour", cv2.WINDOW_KEEPRATIO)
    cv2.imshow("Canny Contour", canny_outlined_image)
    cv2.waitKey(0)

    # sort the contours based on area
    largest_contour = max(contours, key=cv2.contourArea)

    # # create a mask for the largest contour
    # mask = np.zeros_like(image)

    # cv2.drawContours(
    #     mask,
    #     [largest_contour],
    #     contourIdx=-1,
    #     color=(255, 0, 4)
    # )

    return largest_contour