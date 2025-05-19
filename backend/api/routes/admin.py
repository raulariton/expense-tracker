from fastapi import APIRouter, Depends, HTTPException
from models.dbmodels import User,Role,Expense,ExpenseCategory
from sqlalchemy import func
from starlette import status

from services.auth.jwt import create_access_token
from services.auth.register import get_user_by_email, create_user, UserCreationRequest
from services.auth.utils import db_dependency,generate_password


admin_router = APIRouter()


@admin_router.get("/users")
def get_all_users(db: db_dependency):
    """
    Get the role of every user
    """
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role.role #Careful , first role is the relation, second is the column
        }
        for user in users
    ]


@admin_router.get("/stats")
def get_stats(db: db_dependency):



    #FOR EXPENSES COUNT
    total_count = db.query(Expense).count()

    results_count = db.query(
        Expense.category,
        func.count(Expense.id).label("total")
    ).group_by(Expense.category).all()


    #FOR EXPENSES PRICES
    total_price = db.query(func.sum(Expense.amount)).scalar() or 0
    total_price = round(total_price, 2)

    results_prices = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total_amount")
    ).group_by(Expense.category).all()


    #FOR USER COUNT
    user_count = db.query(User).count()



    return {
        "count_by_category": [{"category": category, "total": total} for category, total, in results_count],
        "amount_by_category": [{"category":category, "total": round(total, 2) if total else 0} for category, total, in results_prices],
        "expenses_count" : total_count,
        "expenses_total" : total_price,
        "user_count": user_count
    }


@admin_router.post("/add_admin")
async def add_admin(
        email: str,
        db: db_dependency,
):

    #Create password
    generated_password = generate_password()

    #Add to the database the user and hashed email
    # check for an existing user, using the entered email
    existing_user = get_user_by_email(email, db)

    user_creation_request = UserCreationRequest(email=email, password=generated_password)

    # if user exists, change it's role
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
        )
    else:
        user = create_user(db, user_creation_request)
        admin_user = get_user_by_email(email,db)
        admin_user.role_id = 2
        db.commit()
        db.refresh(admin_user)
        return generated_password






