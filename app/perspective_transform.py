import imutils
import cv2
import numpy as np
from scipy.special import dawsn


def perspective_transform(input_image):
    """
    Performs a perspective transform on the input image.
    :param input_image:
    """

    # resize image
    # NOTE: width affects the result significantly
    input_image = imutils.resize(input_image, width=500)

    original_points = np.float32(detect_corners(input_image))
    print(original_points)
    ordered_points = []

    # sort the points in clockwise order
    # top-left, top-right, bottom-right, bottom-left
    original_points = original_points.reshape(4, 2)
    ordered_points.append(original_points[3])
    ordered_points.append(original_points[1])
    ordered_points.append(original_points[0])
    ordered_points.append(original_points[2])
    ordered_points = np.float32(ordered_points)
    print(ordered_points)

    # show the image with corners
    color_mask = cv2.cvtColor(input_image, cv2.COLOR_BGRA2BGR)
    if original_points is not None:
        for corner in original_points:
            x, y = corner.ravel()
            draw_labelled_circle(
                color_mask,
                int(x),
                int(y)
            )

    if original_points is not None:
        for corner in ordered_points:
            x, y = corner.ravel()
            draw_labelled_circle(
                color_mask,
                int(x),
                int(y)
            )

    # show the image with corners
    cv2.imshow("Corners!!!", color_mask)
    cv2.waitKey(0)

    destination_points = np.float32([[0,0],[400,0],[0,500],[400,500]])

    perspective_transform_points = cv2.getPerspectiveTransform(ordered_points, destination_points)
    dst = cv2.warpPerspective(
        input_image,
        perspective_transform_points,
        (400, 500)
    )

    # show the image
    cv2.imshow("Perspective Transform", dst)
    cv2.waitKey(0)

def detect_corners(input_image):
    """
    Detects the receipt object, and returns
    the corners of the receipt area.
    :param input_image: The image to be processed.
    It is not modified in-place.
    :return: The corners of the receipt area (4 points).
    """

    receipt_outline_mask = canny_outline_largest_area(input_image)

    # use shi-tomasi corner detection
    # NOTE: qualityLevel and minDistance are important
    #  and affect the result significantly
    corners = cv2.goodFeaturesToTrack(
        image=receipt_outline_mask,
        maxCorners=4,
        qualityLevel=0.25,
        minDistance=10
    )

    corners = np.intp(corners)

    return corners

def canny_outline_largest_area(image):
    """
    Outlines the largest area in the image using Canny edge detection,
    and removes anything outside the largest area and
    everything inside it.

    :returns: A mask of the largest area in the image.
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
    cv2.imshow("Contours", image)
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
    cv2.imshow("Contours", mask)
    cv2.waitKey(0)

    # retrieve the outline of the largest area
    # in float32 format
    # for corner detection
    return np.float32(mask)

def draw_labelled_circle(img, x, y):
    """
    Draws a labelled circle on the image.
    :param img: The image to be processed.
    :param x: The x coordinate of the center of the circle.
    :param y: The y coordinate of the center of the circle.
    :param label: The label to be drawn on the circle.
    """
    cv2.circle(img, (x, y), 5, (0, 0, 255), cv2.FILLED)
    cv2.putText(
        img,
        f"({x}, {y})",
        (x + 10, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        1
    )