from db.database import Base, SessionLocal, engine
import models.dbmodels as models

from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from db.database import SessionLocal
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import secrets
import string

from services.auth.jwt import verify_token


def get_db():
    # create db session
    db = SessionLocal()

    try:
        # yield, not return
        # to ensure session is closed finally
        yield db
    finally:
        db.close()

def generate_password(length=12):
    characters = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# used for dependency injection:
# the router does not create the session, but receives it
# from the dependency
# this is useful for testing, where mock sessions can be used
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_token)]
# the function passed in Depends() returns a dependency instance