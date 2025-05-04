import asyncio
import logging
import argparse
from alembic.config import Config
from alembic import command
from api.core.database import engine, Base
from api.models.models import User, CreditBalance, CreditTransaction, Review, Notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables_directly():
    """Create tables directly using SQLAlchemy metadata (legacy method)"""
    logger.info("Creating database tables directly using SQLAlchemy...")
    async with engine.begin() as conn:
        await conn.run_sync(lambda conn: Base.metadata.drop_all(conn))
        await conn.run_sync(lambda conn: Base.metadata.create_all(conn))
    logger.info("Database tables created successfully")

def run_alembic_migrations(reset=False):
    """Apply Alembic migrations"""
    logger.info("Running database migrations with Alembic...")

    alembic_cfg = Config("alembic.ini")
    
    try:
        if reset:
            logger.info("Resetting database schema (downgrading to base)...")
            command.downgrade(alembic_cfg, "base")
        
        logger.info("Applying all migrations...")
        command.upgrade(alembic_cfg, "head")
        
        logger.info("Database migrations applied successfully")
    except Exception as e:
        logger.error(f"Error applying migrations: {e}")
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database management tool")
    parser.add_argument("--legacy", action="store_true", help="Use legacy SQLAlchemy direct table creation")
    parser.add_argument("--reset", action="store_true", help="Reset database before applying migrations")
    
    args = parser.parse_args()
    
    if args.legacy:
        asyncio.run(create_tables_directly())
    else:
        run_alembic_migrations(reset=args.reset)