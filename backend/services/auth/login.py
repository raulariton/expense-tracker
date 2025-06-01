from services.auth.utils import db_dependency, bcrypt_context
import models.dbmodels as models
import models.user_data_models as user_model


# util function
def authenticate_user(email: str, password: str,
                      db: db_dependency):
    """
    Authenticates the user (happens during login) by
    checking if the given email and password match.
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


    user_data = retrieve_user_data(db,user)

    # password is correct
    # return UserDataModel
    return user_data




def retrieve_user_data(db: db_dependency, user_entry):
    """
    Retrieve user data
    """
    user_data = db.query(models.UserInfo).filter(models.UserInfo.id_user == user_entry.id).first()


    #If user data does not have info (emails before the new system)
    #Create info for them
    if user_data is None:
        user_info = models.UserInfo(
            id_user=user_entry.id
        )

        db.add(user_info)
        db.commit()

        db.refresh(user_info)

        user_data = db.query(models.UserInfo).filter(models.UserInfo.id_user == user_entry.id).first()





    data = user_model.UserDataModel(
        id= user_entry.id,
        username=user_data.username or "-",
        email=user_entry.email,

        #TODO Find a more scalable approach for role
        role=("Admin" if user_entry.role_id == 2 else "User"),
        creation_date=user_data.creation_date,
    )





    #return user_data (UserDataModel)
    return data
