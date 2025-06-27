from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from starlette.responses import JSONResponse

from api.routes.auth import get_current_user
from models.expense_data_models import TotalSummary
from services.auth.utils import db_dependency
from models import expense_data_models as models
from models.receipt_scanning_models import Expense
from models.dbmodels import Expense as ExpenseTable
from sqlalchemy import func
import datetime

router = APIRouter()

# TODO: Create consistent response models
@router.get("/total-summary", response_model=models.TotalSummary)
async def get_summary(
    db: db_dependency,
    current_user: dict = Depends(get_current_user),
):
    """
    Returns a summary of the total amount of expenses
    in the past day, week and month.
    """

    user_id = current_user.get("user_id")

    # total expenses in the past day
    total_day = (
        db.query(func.sum(ExpenseTable.amount))
        .filter(
            ExpenseTable.user_id == user_id,
            ExpenseTable.date_time
            >= datetime.datetime.now() - datetime.timedelta(days=1),
        )
        .scalar()
    )

    # total expenses in the past week
    total_week = (
        db.query(func.sum(ExpenseTable.amount))
        .filter(
            ExpenseTable.user_id == user_id,
            ExpenseTable.date_time
            >= datetime.datetime.now() - datetime.timedelta(weeks=1),
        )
        .scalar()
    )

    # total expenses in the past month (30 days)
    total_month = (
        db.query(func.sum(ExpenseTable.amount))
        .filter(
            ExpenseTable.user_id == user_id,
            ExpenseTable.date_time
            >= datetime.datetime.now() - datetime.timedelta(days=30),
        )
        .scalar()
    )

    response = TotalSummary(
        total_day=total_day,
        total_week=total_week,
        total_month=total_month
    )

    return response


@router.get("/category-summary")
async def get_category_summary(
    db: db_dependency,
    current_user: dict = Depends(get_current_user),
):
    """
    Returns a summary of the total amount of expenses
    by category.
    """

    user_id = current_user.get("user_id")

    # total expenses by category
    category_summary = (
        db.query(ExpenseTable.category, func.sum(ExpenseTable.amount).label("total"))
        .filter(ExpenseTable.user_id == user_id)
        .group_by(ExpenseTable.category)
        .all()
    )

    response = JSONResponse(
        content={
            "category_summary": [
                {
                    "category": category.value,
                    "total": total
                }
                for category, total in category_summary
            ]
        },
        status_code=status.HTTP_200_OK
    )

    return response


@router.get("/", response_model=list[Expense])
async def get_expenses(
    db: db_dependency,
    limit: int = None,
    offset: int = None,
    start_date: datetime.datetime = None,
    end_date: datetime.datetime = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns a list of all expenses for the current user.
    This endpoint can be used to paginate the results, if
    the limit and offset parameters are set.
    For example, if each page contains 10 (limit = 10) expenses, the second page will
    have a limit of 10, and an offset of 10, meaning the first 10 expenses will be skipped and only 10 will be returned.
    :param limit: The maximum number of expenses to return.
    :param offset: The number of expenses to skip in the result set, starting from the beginning.
    :param start_date: The start date of the range to filter expenses by (inclusive).
    :param end_date: The end date of the range to filter expenses by (inclusive).
    """

    # TODO: Clean code: Have the get_current_user function return a User object
    #  and not just a dictionary
    user_id = current_user.get("user_id")


    # base query
    # sort by date descending (newest first)
    query = (db.query(ExpenseTable)
             .filter(ExpenseTable.user_id == user_id)
             .order_by(ExpenseTable.date_time.desc()))

    # date filtering
    if start_date:
        query = query.filter(ExpenseTable.date_time >= start_date)
    if end_date:
        query = query.filter(ExpenseTable.date_time <= end_date)

    # check if limit is given
    if limit:
        query = query.limit(limit)
        # check if offset is given
        if offset:
            query = query.offset(offset)

    # convert to Expense model
    # expenses = [Expense(**expense.__dict__) for expense in expenses]

    expenses = query.all()

    response = JSONResponse(
        content={
            "expenses": [
                {
                    "id": expense.id,
                    "vendor": expense.vendor,
                    "category": expense.category.value,
                    "total": expense.amount,
                    "datetime": expense.date_time.isoformat()
                }
                for expense in expenses
            ]
        },
        status_code=status.HTTP_200_OK
    )

    return response
