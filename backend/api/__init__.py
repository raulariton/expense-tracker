from api.routes.receipt_scanning import router as receipt_scanning_router
from api.routes.auth import router as auth_router
from api.routes.expenses import router as expenses_router

# defines all the symbols that will be imported
# when someone does "from app.api import *"
__all__ = [
    "receipt_scanning_router",
    "auth_router",
    "expenses_router",
]