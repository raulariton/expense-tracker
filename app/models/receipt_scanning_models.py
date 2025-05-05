from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class Expense(BaseModel):
    """
    Class representing an expense, extracted from a receipt.
    :param total: Total amount of the expense, mandatory field.
    :param vendor: Vendor name, optional field.
    :param date: Date of the expense, optional field.
    """

    # TODO: Refactor to:
    #  rename total to amount
    #  rename date, time combined to date_time
    #  set category to ExpenseCategory enum type


    vendor: Optional[str]
    # NOTE: if category is not found, implementation sets it as "Other"
    category: str
    total: Optional[float]
    date: Optional[date]
    time: Optional[time]


class APIResponse(BaseModel):
    """
    Class combining the status code and the receipt data.
    This class will be serialized into JSON format as the API response.
    """

    status_code: int
    expense_data: Expense
