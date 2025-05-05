from datetime import timedelta
from json import dumps
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm
from starlette.responses import JSONResponse

from app.api.routes.auth import get_current_user
from app.models.expense_data_models import TotalSummary
from app.services.auth.jwt import Token, create_access_token, verify_token
from app.services.auth.login import authenticate_user
from app.services.auth.register import (
    UserCreationRequest,
    create_user,
    get_user_by_email,
)
from app.services.auth.utils import db_dependency
from app.models import expense_data_models as models
from app.models.receipt_scanning_models import Expense
from app.models.dbmodels import Expense as ExpenseTable
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
    current_user: dict = Depends(get_current_user),
    limit: int = 5,
):
    """
    Returns a list of all expenses for the current user.
    :param limit: The maximum number of expenses to return.
    """

    user_id = current_user.get("user_id")

    # get all expenses for the current user
    expenses = (
        db.query(ExpenseTable)
        .filter(ExpenseTable.user_id == user_id)
        .limit(limit)
        .all()
    )

    # convert to Expense model
    # expenses = [Expense(**expense.__dict__) for expense in expenses]

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
