import os
import logging
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from sqlalchemy.orm import Session
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.external.sync_service import SyncService

logger = logging.getLogger(__name__)

def run_sync():
    """Run the sync process for all configured users"""
    logger.info("Starting scheduled sync")
    db: Session = SessionLocal()
    try:
        sync_service = SyncService(db)
        
        # Get source username from environment
        source_username = os.getenv("GIT_USERNAME")
        if source_username:
            try:
                # Run async function in event loop
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(sync_service.sync_projects(source_username.strip()))
                loop.close()
            except Exception as e:
                logger.error(f"Failed to sync projects for {source_username}: {str(e)}")

    except Exception as e:
        logger.error(f"Scheduled sync failed: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    """Start the background scheduler"""
    scheduler = BackgroundScheduler()
    
    # Run sync immediately on startup
    scheduler.add_job(
        run_sync,
        trigger='date',  # Run once immediately
        id='initial_sync',
        name='Initial sync on startup',
        replace_existing=True
    )
    
    # Then run sync every 6 hours
    scheduler.add_job(
        run_sync,
        trigger=IntervalTrigger(hours=6),
        id='periodic_sync',
        name='Sync projects every 6 hours',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started with initial sync") 