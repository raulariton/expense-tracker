import os
import gc
import cv2
import numpy as np
import torch
import torchvision.transforms as torchvision_T
from torchvision.models.segmentation import (
    deeplabv3_resnet50,
    deeplabv3_mobilenet_v3_large,
)

from app.classes.exceptions import (
    SegmentationModelError,
    EdgeDetectionError,
    PerspectiveTransformationError,
)

# constants
IMAGE_RESIZE_FOR_DETECTION = 384
MODEL_METHOD = "MobilenetV3-Large"

# DEBUG for visualization
import matplotlib.pyplot as plt


def plt_model_result(original_image, output):
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))

    axes[0].imshow(original_image)
    axes[0].set_title("Original Image")
    axes[0].axis("off")

    output_predictions = torch.argmax(output[0], dim=0).byte().cpu().numpy()  # (H, W)
    axes[1].imshow(output_predictions, cmap="gray")
    axes[1].set_title("Segmentation Mask")
    axes[1].axis("off")
    plt.tight_layout()
    plt.show()


def image_preprocess_transforms(
    mean=(0.4611, 0.4359, 0.3905), standard_deviation=(0.2193, 0.2150, 0.2109)
):
    # preprocess image:
    # 1. convert to tensor
    # 2. normalize using mean and std
    common_transforms = torchvision_T.Compose(
        [
            torchvision_T.ToTensor(),
            torchvision_T.Normalize(mean, standard_deviation),
        ]
    )
    return common_transforms


preprocess_transforms = image_preprocess_transforms()

def rotate(image):
    def is_rotated(image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        proj_h = np.sum(gray, axis=1)
        proj_v = np.sum(gray, axis=0)
        return np.std(proj_v) > np.std(proj_h)

    if is_rotated(image):
        # Rotate the image 90 degrees clockwise
        image = cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)

    return image


def detect_receipt(image):
    # load detection model
    model = load_model()

    # scan for receipt
    receipt = scan(image, trained_model=model)

    return receipt


def scan(
    image=None,
    trained_model=None,
    image_size=IMAGE_RESIZE_FOR_DETECTION,
    BUFFER=10,
):
    """
    Detect the receipt in the image, using a scanned
    :return: The detected receipt, perspective transformed to fit the whole image.
    """
    global preprocess_transforms

    half = image_size // 2

    image_height, image_width, image_channels = image.shape

    # resize image
    image_model = cv2.resize(
        image, (image_size, image_size), interpolation=cv2.INTER_NEAREST
    )

    # scale factors to resize back to original image size
    scale_x = image_width / image_size
    scale_y = image_height / image_size

    image_model = preprocess_transforms(image_model)
    image_model = torch.unsqueeze(image_model, dim=0)

    with torch.no_grad():
        # get segmentation mask
        try:
            out = trained_model(image_model)["out"].cpu()
        except RuntimeError:
            raise SegmentationModelError(
                "Unable to get a segmentation mask. Segmentation model is not "
                "loaded "
                "correctly."
            )

    del image_model
    gc.collect()

    # DEBUG, visualize the model result
    # plt_model_result(image, out)

    out = (
        torch.argmax(out, dim=1, keepdim=True)
        .permute(0, 2, 3, 1)[0]
        .numpy()
        .squeeze()
        .astype(np.int32)
    )

    seg_mask_height, seg_mask_width = out.shape

    # create new image larger than the original image
    # (padding)
    _out_extended = np.zeros(
        shape=(image_size + seg_mask_height, image_size + seg_mask_width),
        dtype=out.dtype,
    )

    # fill the center of the new image with the original image
    _out_extended[half : half + image_size, half : half + image_size] = out * 255
    # copy extended image to out
    out = _out_extended.copy()

    del _out_extended
    gc.collect()

    # === EDGE DETECTION & OBTAINING THE LARGEST CONTOUR ===
    # apply canny edge detection
    canny = cv2.Canny(out.astype(np.uint8), 225, 255)
    # dilate edges for better contour detection
    canny = cv2.dilate(canny, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    # find contours
    contours, _ = cv2.findContours(canny, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)

    if not contours:
        raise EdgeDetectionError("Unable to find any contours in the image.")

    # save largest contour as `receipt`
    receipt = sorted(contours, key=cv2.contourArea, reverse=True)[0]

    # === CORNER DETECTION ===
    # approximate the contour to a polygon,
    # that has as few vertices as possible

    # epsilon - the maximum distance from the contour to the polygon
    # (the smaller the value, the more accurate the polygon)
    # we use 2% of the contour's perimeter
    epsilon = 0.02 * cv2.arcLength(receipt, True)

    # approximate the contour to a polygon
    corners = cv2.approxPolyDP(receipt, epsilon, True)

    # concatenate the corners to a single array
    corners = np.concatenate(corners).astype(np.float32)

    # subtract half to get the original coordinates, without
    # _out_extended padding
    corners[:, 0] -= half
    corners[:, 1] -= half

    # scale the corners back to the original image size
    corners[:, 0] *= scale_x
    corners[:, 1] *= scale_y

    # == VERIFICATION ==
    # check if corners are inside
    # IF NOT, find smallest enclosing box,
    # expand image then extract document
    # ELSE extract document

    if not (
        np.all(corners.min(axis=0) >= (0, 0))
        and np.all(corners.max(axis=0) <= (image_width, image_height))
    ):

        # expand image
        left_pad, top_pad, right_pad, bottom_pad = 0, 0, 0, 0

        # calculate smallest enclosing box
        rect = cv2.minAreaRect(corners.reshape((-1, 1, 2)))
        box = cv2.boxPoints(rect)
        box_corners = np.int32(box)

        # determine minimum and maximum x,y
        # coordinates of the bounding box
        box_x_min = np.min(box_corners[:, 0])
        box_x_max = np.max(box_corners[:, 0])
        box_y_min = np.min(box_corners[:, 1])
        box_y_max = np.max(box_corners[:, 1])

        # if any corner of the bounding box is outside the image boundaries
        # calculate required padding, plus BUFFER to ensure extra space
        # and not sharp cutting (cropping)
        if box_x_min <= 0:
            left_pad = abs(box_x_min) + BUFFER

        if box_x_max >= image_width:
            right_pad = (box_x_max - image_width) + BUFFER

        if box_y_min <= 0:
            top_pad = abs(box_y_min) + BUFFER

        if box_y_max >= image_height:
            bottom_pad = (box_y_max - image_height) + BUFFER

        # new image with additional zeros pixels
        image_extended = np.zeros(
            (
                top_pad + bottom_pad + image_height,
                left_pad + right_pad + image_width,
                image_channels,
            ),
            dtype=image.dtype,
        )

        # adjust original image within the new `image_extended`
        image_extended[
            top_pad : top_pad + image_height, left_pad : left_pad + image_width, :
        ] = image
        image_extended = image_extended.astype(np.float32)

        # shifting corner coordinates
        # to account for added padding
        box_corners[:, 0] += left_pad
        box_corners[:, 1] += top_pad

        corners = box_corners
        image = image_extended

    # == PERSPECTIVE TRANSFORMATION ==
    # sort the corners in a clockwise order
    corners = sorted(corners.tolist())
    corners = order_points(corners)
    destination_corners = find_dest(corners)
    # find the perspective transformation matrix
    try:
        M = cv2.getPerspectiveTransform(
            np.float32(corners), np.float32(destination_corners)
        )
    except cv2.error:
        raise PerspectiveTransformationError(
            "Unable to get perspective transformation matrix."
        )

    # apply the perspective transformation
    # on the original image
    try:
        perpsective_transformed = cv2.warpPerspective(
            image,
            M,
            (destination_corners[2][0], destination_corners[2][1]),
            flags=cv2.INTER_LANCZOS4,
        )
    except cv2.error:
        raise PerspectiveTransformationError(
            "Unable to apply perspective transformation to image."
        )

    # clip the pixel values to be in the range [0, 255]
    perpsective_transformed = np.clip(perpsective_transformed, a_min=0, a_max=255)
    # convert the pixel values to uint8
    # (required for OpenCV)
    perpsective_transformed = perpsective_transformed.astype(np.uint8)

    return perpsective_transformed


def order_points(pts):
    """
    Rearrange coordinates in the following order:
    top-left, top-right, bottom-right, bottom-left
    """

    rect = np.zeros((4, 2), dtype="float32")
    pts = np.array(pts)
    s = pts.sum(axis=1)
    # Top-left point will have the smallest sum.
    rect[0] = pts[np.argmin(s)]
    # Bottom-right point will have the largest sum.
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    # Top-right point will have the smallest difference.
    rect[1] = pts[np.argmin(diff)]
    # Bottom-left will have the largest difference.
    rect[3] = pts[np.argmax(diff)]
    # return the ordered coordinates
    return rect.astype("int").tolist()


def find_dest(pts):
    (tl, tr, br, bl) = pts  # top left  # top right  # bottom right  # bottom left

    # find maximum width
    width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    max_width = max(int(width_a), int(width_b))

    # find maximum height
    height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    max_height = max(int(height_a), int(height_b))
    # find final destination coordinates
    destination_corners = [
        [0, 0],
        [max_width, 0],
        [max_width, max_height],
        [0, max_height],
    ]

    return order_points(destination_corners)

def load_model(num_classes=2, device=torch.device("cpu")):
    model = deeplabv3_mobilenet_v3_large(num_classes=num_classes, aux_loss=True)
    checkpoint_path = os.path.join(
        os.getcwd(), "app", "resources", "ml_models", "model_mbv3_iou_mix_2C049.pth"
    )

    model.to(device)

    try:
        checkpoints = torch.load(checkpoint_path, map_location=device)
    except RuntimeError:
        raise SegmentationModelError(
            "Unable to load segmentation model. Check the checkpoint (.pth) path."
        )
    model.load_state_dict(checkpoints, strict=False)
    model.eval()

    _ = model(torch.randn((1, 3, 384, 384)))

    return model
