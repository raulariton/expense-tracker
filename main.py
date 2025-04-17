import cv2

from app.detect_receipt import detect_receipt
from app.preprocess_receipt import preprocess_receipt
from app.ocr import extract_text, EASYOCR


# TODO:
# make sure to remove any DEBUG comments
# these are just made for visualization purposes


def main():

    # 1. Receive image
    # INSERT IMAGE PATH HERE (e.g., "path/to/image.jpg")
    image_path = ""
    image = cv2.imread(image_path)
    if image is None:
        return

    # 2. Detect receipt, crop it and perspective transform it
    receipt = detect_receipt(image)

    # 3. Preprocess the image for OCR
    preprocessed_receipt = preprocess_receipt(receipt)

    # 4. Perform OCR
    text = extract_text(preprocessed_receipt, EASYOCR)

    # DEBUG: Show the preprocessed image
    cv2.imshow("receipt", preprocessed_receipt)
    cv2.imwrite("debug_images/detect.png", preprocessed_receipt)

    # Print OCR output (total)
    print(text)
    # TODO: Have it return a JSON object (API response)

    # 5. (Text processing) Extract needed data using LLM
    # output_json = LLM_extraction(ocr_text)

    # 6. Send API response
    # return output_json


if __name__ == "__main__":
    main()
