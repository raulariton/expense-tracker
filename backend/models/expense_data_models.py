from pydantic import BaseModel
from typing import Optional
from app.models.dbmodels import ExpenseCategory

class TotalSummary(BaseModel):
    """
    Response model for the API that
    summarizes the total amount of expenses in the
    past day, week and month.
    """

    total_day: Optional[float]
    total_week: Optional[float]
    total_month: Optional[float]

# NOTE: Unused
class CategorySummary(BaseModel):
    """
    Response model for the API that
    summarizes the total amount of expenses
    by category.
    """

    category: ExpenseCategory
    total: Optional[float]

