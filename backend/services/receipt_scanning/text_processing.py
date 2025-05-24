from models.exceptions import OCRProcessingError
from models.receipt_scanning_models import Expense
import re
from datetime import date, time
from dateutil import parser
import os
from pathlib import Path
from dotenv import load_dotenv

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

def llm_process_text(ocr_text: str) -> str:
    from openai import OpenAI

    timeout = 10  # seconds

    # add your openrouter API key here
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY"),
        timeout=timeout
    )

    prompt = """
    You are a receipt data extraction assistant. 
    Your task is to extract specific information from OCR-processed receipt text while 
    correcting any obvious errors or typos.

    Receipt text:
    {ocr_text}

    Extract the following information and respond ONLY using this exact format.
    Do not include any explanations or additional text.

    VENDOR: [Identified business name with corrected OCR errors]
    CATEGORY: [Identified category, MUST be one of the following: "Food & Dining", "Transport", "Shopping", "Bills" or "Other"] 
    TOTAL: [Final amount paid]
    DATE: [Transaction date]
    TIME: [Transaction time or "Unknown" if not found]

    Guidelines:
    - As context, use Romanian vendors, shops, companies (for example LIDL, Kaufland, Profi, Carrefour, etc.)
    - If unsure about a vendor, use as is (don't correct it).
    - Ensure that the total amount is logical, and matches the sum of various other items identified in the receipt.
    - The identified category must be one of the following: "Food & Dining", "Transport", "Shopping", "Bills" or "Other"
    - If you can't determine any field with reasonable confidence, use "Unknown"
    - Do not include any explanations or additional text
    - Always use the exact label format shown above
    - Do NOT include any additional text or explanations.
    """

    fallback_response = """
    VENDOR: Unknown
    CATEGORY: Unknown
    TOTAL: Unknown
    DATE: Unknown
    TIME: Unknown
    """


    try:
        # NOTE: free model for now, to test the API
        completion = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[
                {"role": "user",
                 "content": prompt.format(ocr_text=ocr_text)},
            ],
        )
        return completion.choices[0].message.content

    except Exception as e:
        return fallback_response


def get_expense_from_llm_response(llm_response: str) -> Expense:
    def parse_date(date_str) -> date | None:
        try:
            parsed_date = parser.parse(date_str)
            return parsed_date.date()
        except ValueError:
            return None

    def parse_time(time_str) -> time | None:
        try:
            parsed_time = parser.parse(time_str)
            return parsed_time.time()
        except ValueError:
            return None


    # initialize with default values
    vendor = None
    category = None
    total = None
    date_ = None
    time_ = None

    # extract the values using regex
    # NOTE: to understand each of these better, i recommend using
    #  regex101.com
    # generally,
    # \s* means "zero or more whitespace"
    # (.+) means "one or more of any character, except line terminators"
    # thus the following patterns match (and extract) whatever text comes after
    # each labels ("VENDOR", "CATEGORY", etc.) respectively
    vendor_pattern = r"VENDOR:\s*(.+)"
    category_pattern = r"CATEGORY:\s*(.+)"
    total_pattern = r"TOTAL:\s*(.+)"
    date_pattern = r"DATE:\s*(.+)"
    time_pattern = r"TIME:\s*(.+)"

    vendor_match = re.search(vendor_pattern, llm_response)
    category_match = re.search(category_pattern, llm_response)
    total_match = re.search(total_pattern, llm_response)
    date_match = re.search(date_pattern, llm_response)
    time_match = re.search(time_pattern, llm_response)

    if vendor_match and vendor_match.group(1).strip() != "Unknown":
        vendor = vendor_match.group(1).strip()

    if category_match and category_match.group(1).strip() != "Unknown":
        category = category_match.group(1).strip()

        valid_categories = [
            "Food & Dining",
            "Transport",
            "Shopping",
            "Bills",
            "Other"
        ]

        if category not in valid_categories:
            category = "Other"

    if total_match and total_match.group(1).strip() != "Unknown":
        try:
            total = float(total_match.group(1).strip().replace(",", "."))
        except ValueError:
            total = None

    if date_match and date_match.group(1).strip() != "Unknown":
        date_str = date_match.group(1).strip()
        date_ = parse_date(date_str)

    if time_match and time_match.group(1).strip() != "Unknown":
        time_str = time_match.group(1).strip()
        time_ = parse_time(time_str)


    # verify that at least two fields are not None
    # (excluding category which is set as 'Other' if not found)
    # count None instances
    none_count = 0
    for field in [vendor, total, date_, time_]:
        if field is None:
            none_count += 1

    if none_count >= 2:
        raise OCRProcessingError("Could not find enough data in the receipt.")

    return Expense(
        vendor=vendor,
        category=category,
        total=total,
        date=date_,
        time=time_,
    )


def process_text(ocr_text: str) -> Expense:

    llm_response = llm_process_text(ocr_text)

    # DEBUG
    print(llm_response)

    expense = get_expense_from_llm_response(llm_response)

    return expense


