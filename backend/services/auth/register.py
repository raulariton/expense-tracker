import models.dbmodels as models
from pydantic import BaseModel
from services.auth.utils import db_dependency, bcrypt_context
from services.auth.login import retrieve_user_data

class UserCreationRequest(BaseModel):
    email: str
    password: str = None
    isAdmin: bool = False

def create_user(
        db: db_dependency,
        user_creation_request: UserCreationRequest,
        admin_created: False):
    """
    Registers a new user, adding them to the database.
    :return: The created user
    """

    # NOTE: role_id is set to
    #  2 for admin users and
    #  1 for regular users
    new_user_model = models.User(
        email=user_creation_request.email,
        hashed_password=bcrypt_context.hash(user_creation_request.password),
        role_id=1 if not user_creation_request.isAdmin else 2,
    )

    db.add(new_user_model)
    db.commit()

    # update User object with the generated id
    db.refresh(new_user_model)

    #add user info
    user_info = models.UserInfo(
        id_user=new_user_model.id
    )

    db.add(user_info)
    db.commit()

    db.refresh(user_info)

    #If admin_created is True, no need to retrieve the information.
    if not admin_created:
        user_info = retrieve_user_data(db,new_user_model)



    # return the user (db entry, pydantic model)
    #user_info will always be sent for registration
    return new_user_model,user_info

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

