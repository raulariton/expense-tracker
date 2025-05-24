from fastapi import APIRouter, Depends, HTTPException
from models.dbmodels import User,Role,Expense,ExpenseCategory
from sqlalchemy import func
from starlette import status
from pydantic import BaseModel
from services.auth.jwt import create_access_token
from services.auth.register import get_user_by_email, create_user, UserCreationRequest
from services.auth.utils import db_dependency,generate_password
from api.routes.auth import get_current_admin


admin_router = APIRouter()

class AdminCreateRequest(BaseModel):
    email: str


# TODO: Delete?
@admin_router.get("/users")
def get_all_users(
        db: db_dependency,
        admin_logged_in: dict = Depends(get_current_admin)
):
    """
    Get the role of every user
    """
    users = db.query(User).all()

    # role.role because:
    # role is the relation (table), role.role is the column
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role.role
        }
        for user in users
    ]


@admin_router.get("/stats")
def get_stats(db: db_dependency, admin_logged_in: dict = Depends(get_current_admin)):
    """
    Gets:
    - The total number of expenses logged by all users
    - The total number of expenses logged by each user, grouped by category
    - The total amount ($) of expenses logged by all users
    - The total amount ($) of expenses logged by each user, grouped by category
    - The total number of users
    """

    # total number of expenses, by all users
    expenses_count = db.query(Expense).count()

    # total number of expenses, by all users, grouped by category
    expenses_count_grouped_by_category = db.query(
        Expense.category,
        func.count(Expense.id).label("total")
    ).group_by(Expense.category).all()

    # total amount ($) of expenses, by all users
    expenses_amount = db.query(func.sum(Expense.amount)).scalar() or 0
    expenses_amount = round(expenses_amount, 2)

    # total amount ($) of expenses, by all users, grouped by category
    expenses_amount_grouped_by_category = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total_amount")
    ).group_by(Expense.category).all()

    # total number of users (including admins)
    user_count = db.query(User).count()

    return {
        "expenses_count_grouped_by_category": [
            {
                "category": category,
                "total": total
            }
            for category, total, in expenses_count_grouped_by_category
        ],

        "expenses_amount_grouped_by_category": [
            {
                "category": category,
                "total": round(total, 2) if total else 0
            }
            for category, total, in expenses_amount_grouped_by_category
        ],

        "expenses_count" : expenses_count,
        "expenses_total" : expenses_amount,
        "user_count": user_count
    }

@admin_router.post("/create_admin", status_code=status.HTTP_201_CREATED)
def create_admin(
        request: AdminCreateRequest,
        db: db_dependency,
        admin_logged_in: dict = Depends(get_current_admin)
):
    email = request.email
    """
    Creates a new admin user in the database.
    This endpoint is used by an admin user to create a new admin user.
    """

    # check for an existing user, using the entered email
    existing_user = get_user_by_email(email, db)


    # if user exists, change it's role
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
        )

    generated_password = generate_password(12)
    user_creation_request = UserCreationRequest(email=email, password=generated_password,isAdmin=True)


    create_user(db, user_creation_request)

    # NOTE: Unlike the register_user function (in auth.py), this function does not
    #  return a JWT as the admin that has created the new admin user
    #  should not be able to log in as the new user (using the JWT)

    return generated_password