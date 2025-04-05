import cv2
import numpy as np

def detect_corners(image):
    """
    Detects the receipt object, and returns the 
    4 points of the bounding box
    """

    receipt_outline_mask = detect_edges(image)

    # use shi-tomasi corner detection
    # NOTE: qualityLevel and minDistance are important
    #  and affect the result significantly
    corners = cv2.goodFeaturesToTrack(
        image=receipt_outline_mask,
        maxCorners=4,
        qualityLevel=0.25,
        minDistance=10
    )

    # sort the corners in clockwise order
    corners = sorted_in_clockwise_order(corners)

    return corners

def detect_edges(image):
    """
        Outlines the largest area in the image using Canny edge detection,
        and removes anything outside the largest area and
        everything inside it.

        :returns: A mask with the largest area (the receipt) outlined
        """

    # convert to grayscale for corner detection
    image_canny_outline = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # apply gaussian blur
    image = cv2.GaussianBlur(
        image,
        (5, 5),
        0
    )

    # use canny edge detection
    image = cv2.Canny(
        image,
        100,
        200
    )

    # find contours
    contours = cv2.findContours(
        image=image,
        mode=cv2.RETR_EXTERNAL,
        method=cv2.CHAIN_APPROX_SIMPLE
    )[0]

    # DEBUG
    # show the image with contours
    cv2.imshow("Contours_dirty", image)
    cv2.waitKey(0)

    # sort the contours based on area
    largest_contour = max(contours, key=cv2.contourArea)

    # create a mask for the largest contour
    mask = np.zeros_like(image)

    cv2.drawContours(
        mask,
        [largest_contour],
        contourIdx=-1,
        color=(255, 0, 4)
    )

    # DEBUG
    # show the image with contours
    cv2.imshow("Contours_empty", mask)
    cv2.waitKey(0)

    # retrieve the outline of the largest area
    # in float32 format
    # for corner detection
    return np.float32(mask)

def sorted_in_clockwise_order(corner_points):
    """
    Sorts 4 points in clockwise direction with
    the first point (top-left) being closest to the (0, 0)

    Assumption:
    There are exactly 4 points in the input and
    from a rectangle which is not very distorted
    """
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