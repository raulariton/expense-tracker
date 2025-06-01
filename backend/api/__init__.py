from api.routes.receipt_scanning import router as receipt_scanning_router
from api.routes.auth import router as auth_router
from api.routes.expenses import router as expenses_router
from api.routes.admin import router as admin_router
from api.routes.settings import router as settings_router

# defines all the symbols that will be imported
# when someone does "from app.api import *"
__all__ = [
    "receipt_scanning_router",
    "auth_router",
    "expenses_router",
    "admin_router",
    "settings_router"
]