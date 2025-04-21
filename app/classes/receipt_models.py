from pydantic import BaseModel
from typing import Optional

class Expense(BaseModel):
    """
    Class representing an expense, extracted from a receipt.
    :param total: Total amount of the expense, mandatory field.
    :param vendor: Vendor name, optional field.
    :param date: Date of the expense, optional field.
    """

    total: float
    vendor: Optional[str] = None
    date: Optional[str] = None


class APIResponse(BaseModel):
    """
    Class combining the status code and the receipt data.
    This class will be serialized into JSON format as the API response.
    """

    status_code: int
    receipt_data: Expense
