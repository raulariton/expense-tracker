from app.classes.ReceiptResponse import ReceiptResponse


def process_ocr_text(ocr_text: str) -> ReceiptResponse:
    """
    Processes the raw OCR text and creates a ReceiptResponse object to be
    returned as a JSON response.
    :param ocr_text: The text extracted from the receipt image.
    :return: ReceiptResponse object containing processed data.
    """

    # TODO: any logic to extract all relevant data
    #  from receipt response goes HERE
    #  (llm processing, regex, etc.)

    total = float(ocr_text.split()[0].replace(",", "."))

    return ReceiptResponse(total)


def create_json_response(receipt_response: ReceiptResponse) -> str:
    """
    Creates a JSON response from the processed data.
    :param receipt_response: The ReceiptResponse object containing extracted data.
    :return: JSON response as a string.
    """
    import json

    # Convert the data to JSON format
    json_response = {
        "status": "success",
        "data": {
            "total": receipt_response.total,
            "vendor": receipt_response.vendor,
            "date": receipt_response.date,
        },
    }

    return json.dumps(json_response)