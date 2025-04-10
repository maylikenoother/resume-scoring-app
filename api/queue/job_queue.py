# api/queue/job_queue.py
import asyncio
from typing import Dict, List, Callable, Awaitable, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class JobQueue:
    """Simple in-memory job queue for handling CV processing tasks."""
    
    def __init__(self):
        self.queue: List[Dict[str, Any]] = []
        self.processing: Dict[int, Dict[str, Any]] = {}
        self.task = None
        self.is_running = False
    
    def add_job(self, job_id: int, params: Dict[str, Any]) -> None:
        """Add a job to the queue."""
        self.queue.append({
            "id": job_id,
            "params": params,
            "added_at": datetime.utcnow()
        })
        logger.info(f"Added job {job_id} to queue. Queue length: {len(self.queue)}")
        
        # Start processing if not already running
        if not self.is_running:
            self.start_processing()
    
    def start_processing(self) -> None:
        """Start processing jobs from the queue."""
        if self.is_running:
            return
            
        self.is_running = True
        # Create a task to process jobs
        self.task = asyncio.create_task(self._process_jobs())
    
    async def _process_jobs(self) -> None:
        """Process jobs from the queue."""
        from api.routers.cv import process_cv
        
        try:
            while True:
                if not self.queue:
                    await asyncio.sleep(1)
                    continue
                
                # Get the next job
                job = self.queue.pop(0)
                job_id = job["id"]
                
                # Mark as processing
                self.processing[job_id] = job
                
                try:
                    # Process the job
                    logger.info(f"Processing job {job_id}")
                    await process_cv(**job["params"])
                except Exception as e:
                    logger.exception(f"Error processing job {job_id}: {e}")
                finally:
                    # Remove from processing
                    if job_id in self.processing:
                        del self.processing[job_id]
        except asyncio.CancelledError:
            logger.info("Job processing task cancelled")
        except Exception as e:
            logger.exception(f"Unexpected error in job processing: {e}")
        finally:
            self.is_running = False

# Create a global instance
job_queue = JobQueue()