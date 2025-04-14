import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Dict, List, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    
    def __init__(self, max_workers: int = 5):

        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.tasks: Dict[str, asyncio.Future] = {}
        self.running = True
    
    def add_task(self, task_id: str, func: Callable, *args, **kwargs) -> None:
        logger.info(f"Adding task {task_id} to queue")
        
        # Create a wrapper function to catch exceptions
        def task_wrapper():
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.exception(f"Error in background task {task_id}: {e}")
                return None
        
        # Submit the task to the executor
        future = asyncio.get_event_loop().run_in_executor(self.executor, task_wrapper)
        self.tasks[task_id] = future
    
    def get_task_status(self, task_id: str) -> Optional[str]:
    
        if task_id not in self.tasks:
            return None
        
        future = self.tasks[task_id]
        if future.done():
            if future.exception():
                return "failed"
            return "completed"
        elif future.running():
            return "running"
        else:
            return "pending"
    
    def get_task_result(self, task_id: str) -> Optional[Any]:
        if task_id not in self.tasks:
            return None
        
        future = self.tasks[task_id]
        if not future.done():
            return None
        
        if future.exception():
            return None
        
        return future.result()
    
    def shutdown(self) -> None:
        logger.info("Shutting down background task manager")
        self.running = False
        self.executor.shutdown(wait=True)


def setup_background_tasks() -> BackgroundTaskManager:
    return BackgroundTaskManager(max_workers=settings.BACKGROUND_WORKERS)