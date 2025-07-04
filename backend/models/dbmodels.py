from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Float, Date
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import date
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
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, default=1)

    role = relationship("Role", back_populates="users")
    info = relationship("UserInfo",back_populates="users")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    role = Column(String, unique=True)

    users = relationship("User", back_populates="role")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    amount = Column(Float)
    vendor = Column(String)
    category = Column(Enum(ExpenseCategory), nullable=False, default=ExpenseCategory.OTHER)
    date_time = Column(DateTime, name="dateTime")




class UserInfo(Base):
    __tablename__ = "user_info"
    id_user = Column(Integer, ForeignKey("users.id"), primary_key=True)
    creation_date = Column(Date, default=date.today)
    username = Column(String, default= "-")

    users = relationship("User",back_populates="info")

