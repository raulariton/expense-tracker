from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Float
from app.db.datatabase import Base
import enum
import uuid

# enumeration for expense categories
class ExpenseCategory(enum.Enum):
    FOOD_AND_DINING = "Food & Dining"
    TRANSPORT = "Transport"
    SHOPPING = "Shopping"
    BILLS = "Bills"
    OTHER = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    amount = Column(Float)
    vendor = Column(String)
    category = Column(Enum(ExpenseCategory), nullable=False, default=ExpenseCategory.OTHER)
    date_time = Column(String, name="dateTime")

