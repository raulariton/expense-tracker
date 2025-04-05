import imutils
import cv2
import numpy as np

from app.corner_detection import get_largest_contour
from corner_detection import detect_corners

def perspective_transform(input_image):
    """
    Performs a perspective transform on the input image.
    :param input_image:
    """

    # resize image
    # NOTE: width affects the result significantly
    input_image = imutils.resize(input_image, width=500)

    # get receipt corner points
    corners = detect_corners(input_image)

    # get best fit rectangle corner points
    best_fit_rectangle_points = get_best_fit_rectangle_points(input_image)

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

def get_best_fit_rectangle_points(image):

    largest_contour = get_largest_contour(image)

    # get best fit rectangle
    best_fit_rectangle = cv2.minAreaRect(largest_contour)

    # get 4 corner points of the rectangle
    best_fit_rectangle_points = cv2.boxPoints(best_fit_rectangle)
    best_fit_rectangle_points = np.intp(best_fit_rectangle_points)

    return best_fit_rectangle_points


