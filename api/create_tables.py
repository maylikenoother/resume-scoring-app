import asyncio
from api.core.database import engine, Base
from api.models.models import User, CreditBalance, CreditTransaction, Review, Notification

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(lambda conn: Base.metadata.drop_all(conn))

        await conn.run_sync(lambda conn: Base.metadata.create_all(conn))
        print("Database tables recreated successfully")

if __name__ == "__main__":
    asyncio.run(create_tables())