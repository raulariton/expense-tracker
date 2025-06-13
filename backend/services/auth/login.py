from services.auth.utils import db_dependency, bcrypt_context
import models.dbmodels as models


# util function
def authenticate_user(email: str, password: str,
                      db: db_dependency):
    """
    Authenticates the user (happens during login) by
    checking if the given email and password match.
    :return: The User object if authentication is successful, otherwise `False`.
    """
    # find user in db
    user = db.query(models.User).filter(models.User.email == email).first()

    # check if user exists
    if not user:
        return False

    # user exists

    # check if password is correct (compare hashed password)
    if not bcrypt_context.verify(password, user.hashed_password):
        return False

    # password is correct
    # return user (db entry, pydantic model)
    return user