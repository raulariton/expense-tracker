import cv2
from app.detect_receipt import detect_receipt
from app.preprocess_receipt import preprocess_receipt
from app.ocr import extract_text


# TODO:
# make sure to remove any DEBUG comments
# these are just made for visualization purposes


def main():

    # 1. Receive image
    # INSERT IMAGE PATH HERE (e.g., "path/to/image.jpg")
    image_path = "images/bon6.jpg"
    image = cv2.imread(image_path)
    if image is None:
        return

    # 2. Detect receipt, crop it and perspective transform it
    receipt = detect_receipt(image)

    # 3. Preprocess the image for OCR
    preprocessed_receipt = preprocess_receipt(receipt)
    # the rest of the function is work in progress

    # 4. Perform OCR
    text = extract_text(preprocessed_receipt,0)


    cv2.imshow("receipt", preprocessed_receipt)
    cv2.imwrite("debug_images/detect.png", preprocessed_receipt)

    print(text)

    # 5. Extract text using LLM
    # output_json = LLM_extraction(ocr_text)

    # print the output JSON
    # print(output_json)


if __name__ == "__main__":
    main()
