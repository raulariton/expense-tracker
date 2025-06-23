from fastapi import APIRouter, Depends, HTTPException
from models.dbmodels import User,Role,Expense,ExpenseCategory,UserInfo
from sqlalchemy import func
from starlette import status
from datetime import date

from services.auth.jwt import create_access_token
from services.auth.register import get_user_by_email, create_user, UserCreationRequest
from services.auth.utils import db_dependency,generate_password
from api.routes.auth import get_current_admin
from models.mailConfig import send_message


router = APIRouter()


# TODO: Delete?
@router.get("/users")
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


@router.get("/stats")
async def get_stats(
    db: db_dependency,
    admin_logged_in: dict = Depends(get_current_admin)
):
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
        func.count(Expense.id).label("total"),
        (func.count(Expense.id) * 100.0 / func.sum(func.count(Expense.id)).over()).label("percentage")
    ).group_by(Expense.category).all()

    # total amount ($) of expenses, by all users
    expenses_amount = db.query(func.sum(Expense.amount)).scalar() or 0
    expenses_amount = round(expenses_amount, 2)

    # total amount ($) of expenses, by all users, grouped by category
    expenses_amount_grouped_by_category = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total_amount"),
        (func.count(Expense.id) * 100.0 / func.sum(func.count(Expense.id)).over()).label("percentage")
    ).group_by(Expense.category).all()

    # total number of users (including admins)
    user_count = db.query(User).count()

    return {
        "expenses_count_grouped_by_category": [
            {
                "category": category,
                "total": total,
                "percentage": round(percentage, 2) if percentage else 0
            }
            for category, total, percentage in expenses_count_grouped_by_category
        ],

        "expenses_amount_grouped_by_category": [
            {
                "category": category,
                "total": round(total, 2) if total else 0,
                "percentage": round(percentage, 2) if percentage else 0
            }
            for category, total, percentage in expenses_amount_grouped_by_category
        ],

        "expenses_count" : expenses_count,
        "expenses_total" : expenses_amount,
        "user_count": user_count
    }

@router.post("/create_admin", status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_creation_request: UserCreationRequest,
    db: db_dependency,
    admin_logged_in: dict = Depends(get_current_admin)
):
    """
    Creates a new admin user in the database.
    This endpoint is used by an admin user to create a new admin user.
    """
    # manually set UserCreationRequest as an admin request
    admin_creation_request.isAdmin = True

    # check for an existing user, using the entered email
    existing_user = get_user_by_email(admin_creation_request.email, db)

    # if user (regular user or admin) (with the same email) exists,
    # raise exception
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
        )

    # since UserCreationRequests for admin users
    # do not require a password,
    # generate a random password
    admin_creation_request.password = generate_password()

    #Only used for creation, no need for return
    create_user(db, admin_creation_request,admin_created=True)

    #Send the password to the submitted email
    try:
        send_message(admin_creation_request.password, admin_creation_request.email)
    except Exception as e:
        print(f"Failed to send email: {e}")

    # NOTE: Unlike the register_user function (in auth.py), this function does not
    #  return a JWT as the admin that has created the new admin user
    #  should not be able to log in as the new user (using the JWT)

    return "Password Message Sent"

@router.get("/admin_table")
async def get_admins(
        db: db_dependency,
        sort_by: str = None,
        search_query: str = None,
        admin_logged_in: dict = Depends(get_current_admin)
):
    query = db.query(
        User.id,
        User.email,
        UserInfo.creation_date,
        UserInfo.username).join(UserInfo, User.id == UserInfo.id_user).filter(User.role_id == 2)

    if search_query:
        search_query = f"%{search_query}%"
        # case-insensitive search for email and username
        query = query.filter(User.email.ilike(search_query) | UserInfo.username.ilike(search_query))

    if sort_by:
        if sort_by == "email-asc":
            query = query.order_by(User.email.asc())
        elif sort_by == "email-desc":
            query = query.order_by(User.email.desc())
        elif sort_by == "newest":
            query = query.order_by(UserInfo.creation_date.desc())
        elif sort_by == "oldest":
            query = query.order_by(UserInfo.creation_date.asc())

    result = query.all()

    admins = [{"id": admin_id,
               "email": email,
               "creation_date": creation_date,
               "username": username

               } for admin_id, email, creation_date, username in result]

    return admins