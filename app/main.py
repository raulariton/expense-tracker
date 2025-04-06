import imutils
from imutils.perspective import four_point_transform
import pytesseract
from image_processing import *
from llm_text_extraction import LLM_extraction
from ultralytics import YOLO

model = YOLO("../receipt_detector/detector.pt")


def inference(file):
    results = model(file, save=True, show=True)
    img = results[0].orig_img
    # only one result should be in the image
    for i, box in enumerate(results[0].boxes):
        # Get bounding box in (x1, y1, x2, y2) format
        x1, y1, x2, y2 = map(int, box.xyxy[0])  # Convert to int

        # Crop the image
        cropped = img[y1:y2, x1:x2]

        # Save or display the crop
        cv2.imwrite(f"crop_{i}.jpg", cropped)
        # OR show it
        cv2.imshow(f"Crop {i}", cropped)

        return cropped

def zoom_in(img_cpy,bounding_box,ratio):

    receipt = four_point_transform(img_cpy, bounding_box * ratio)
    cv2.imshow("Receipt", receipt)
    return receipt

def recognize_text(receipt):

    receipt = pre_process_text(receipt)

    options = "--psm 4"

    text = pytesseract.image_to_string(receipt, config=options)

    print("[INFO] raw output:")
    print("==================")
    print(text)
    print("\n")
    return text

def extract_receipt(orig):
    '''

    :param orig:
    :return the image zoomed in on the receipt (not always):
    '''

    image = imutils.resize(orig.copy(), width=500)

    edged,ratio = pre_process_image(image.copy())
    bounding_box = extract_receipt_bounding_box(edged, image.copy())

    receipt = zoom_in(orig,bounding_box,ratio)  #Pass the original image

    return receipt

def main():

    receipt = inference("../images/bon3.jpg")
    text = recognize_text(receipt)
    print(text)
    cv2.waitKey(0)




if __name__ == '__main__':
    main()