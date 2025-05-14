import app.models.dbmodels as models
from pydantic import BaseModel
from app.services.auth.utils import db_dependency, bcrypt_context

class UserCreationRequest(BaseModel):
    email: str
    password: str

def create_user(
        db: db_dependency,
        user_creation_request: UserCreationRequest):
    """
    Registers a new user, adding them to the database.
    :return: The created user
    """

    new_user_model = models.User(
        email=user_creation_request.email,
        hashed_password=bcrypt_context.hash(user_creation_request.password)
    )

    db.add(new_user_model)
    db.commit()

    # update User object with the generated id
    db.refresh(new_user_model)

    # return the user (db entry, pydantic model)
    return new_user_model

def get_user_by_email(email: str, db: db_dependency):
    """
    Searches for a user in the database by email.
    """
    # find user
    user = db.query(models.User).filter(models.User.email == email).first()

    # check if user exists
    if not user:
        return False
    # user exists

    # return the user (db entry, pydantic model)
    return user

