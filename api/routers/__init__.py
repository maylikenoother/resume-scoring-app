from fastapi import APIRouter

from app.routers import users, reviews, notifications, auth

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(reviews.router)
api_router.include_router(notifications.router)
