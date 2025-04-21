from app.classes.exceptions import OCRProcessingError
from app.classes.receipt_models import Expense
import re


def process_text(ocr_text: str) -> Expense:
    """
    Processes the raw OCR text and creates a ReceiptResponse object to be
    returned as a JSON response.
    :param ocr_text: The text extracted from the receipt image.
    :return: Expense object containing processed data, which
    will be sent to the API response
    """

    # regular expression method
    pattern = r"^(?!.*TVA).*total.*$"
    amount = r"\d[.,]\d{2}"

    total = None
    for i in range(0, len(ocr_text)):
        if re.search(pattern, ocr_text[i], re.IGNORECASE):
            total = ocr_text[i + 1].replace(" ", "")
            if re.search(amount, total, re.IGNORECASE):
                total = total.replace(",", ".")

    if total is None:
        raise OCRProcessingError("Unable to find the total amount in the text.")

    try:
        total = float(total)
    except ValueError:
        raise OCRProcessingError("Unable to find a valid total amount in the text.")

    return Expense(total=total)
