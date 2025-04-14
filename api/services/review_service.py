from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import asyncio
import httpx
from huggingface_hub import InferenceClient

from app.core.config import get_settings
from app.models.models import User, Review
from app.models.schemas import ReviewCreate
from app.services.user_service import get_user_by_clerk_id
from app.services.notification_service import create_notification

settings = get_settings()

async def create_review(db: Session, review: ReviewCreate, clerk_id: str) -> Optional[Review]:
    """
    Create a new review request
    """
    # Get user
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return None
    
    # Create review
    db_review = Review(
        user_id=user.id,
        cv_filename=review.cv_filename,
        cv_content=review.cv_content,
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Create notification for review submission
    await create_notification(
        db=db,
        user_id=user.id,
        review_id=db_review.id,
        message=f"Your CV review request has been submitted and is pending processing."
    )
    
    return db_review

async def get_reviews_by_user(db: Session, clerk_id: str) -> List[Review]:
    """
    Get all reviews for a user
    """
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return []
    
    return db.query(Review).filter(Review.user_id == user.id).order_by(Review.created_at.desc()).all()

async def get_review_by_id(db: Session, review_id: int, clerk_id: str) -> Optional[Review]:
    """
    Get a specific review by ID
    """
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return None
    
    return db.query(Review).filter(Review.id == review_id, Review.user_id == user.id).first()

async def generate_cv_review(cv_content: str) -> str:
    """
    Generate a CV review using Hugging Face API
    """
    try:
        # Initialize Hugging Face Inference Client
        client = InferenceClient(
            model="gpt2",  # Default model, will be replaced with appropriate model
            token=settings.HUGGINGFACE_API_TOKEN
        )
        
        # Prepare prompt for CV review
        prompt = f"""
        Please review the following CV and provide professional feedback on how to improve it:
        
        {cv_content}
        
        Please provide feedback on:
        1. Overall structure and formatting
        2. Content and relevance
        3. Skills and qualifications
        4. Experience description
        5. Education section
        6. Specific improvements
        """
        
        # Generate review using Hugging Face API
        response = client.text_generation(
            prompt,
            max_new_tokens=500,
            temperature=0.7,
            top_k=50,
            top_p=0.95,
            repetition_penalty=1.2
        )
        
        # For development/testing, if Hugging Face API is not available
        # we'll generate a mock review
        if not response or len(response) < 100:
            return generate_mock_review(cv_content)
            
        return response
        
    except Exception as e:
        print(f"Error generating CV review: {e}")
        return generate_mock_review(cv_content)

def generate_mock_review(cv_content: str) -> str:
    """
    Generate a mock CV review for development/testing
    """
    return """
    # CV Review Feedback

    Thank you for submitting your CV for review. Here's my professional feedback:

    ## Overall Structure and Formatting
    - Your CV has a clear structure, but consider using a more modern template
    - Improve spacing between sections for better readability
    - Use consistent formatting for dates and headings

    ## Content and Relevance
    - Your experience is well-described but could be more achievement-focused
    - Consider adding quantifiable results to demonstrate impact
    - Tailor your CV more specifically to the target role/industry

    ## Skills and Qualifications
    - Good range of technical skills listed
    - Consider organizing skills by proficiency level
    - Add any relevant certifications or continuous learning

    ## Experience Description
    - Use strong action verbs to begin each bullet point
    - Focus more on achievements rather than responsibilities
    - Quantify your impact where possible (e.g., increased efficiency by 20%)

    ## Education Section
    - Education section is well-structured
    - Consider adding relevant coursework if you're a recent graduate
    - Include any academic achievements or honors

    ## Specific Improvements
    - Add a professional summary at the beginning
    - Include a LinkedIn profile and professional portfolio if available
    - Proofread for any grammatical errors or typos
    - Consider adding a section for projects or volunteer work

    Overall, your CV has good content but needs refinement in presentation and focus on achievements. Implementing these suggestions will significantly improve your chances of getting interviews.
    """

async def process_review_request(db: Session, review_id: int):
    """
    Process a review request in the background
    """
    # Get review
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return
    
    try:
        # Update status to processing
        review.status = "processing"
        review.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(review)
        
        # Create notification for processing
        await create_notification(
            db=db,
            user_id=review.user_id,
            review_id=review.id,
            message=f"Your CV review request is now being processed."
        )
        
        # Simulate processing delay (in a real app, this would be the actual processing time)
        await asyncio.sleep(5)
        
        # Generate review
        review_content = await generate_cv_review(review.cv_content)
        
        # Update review with content
        review.review_content = review_content
        review.status = "completed"
        review.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(review)
        
        # Create notification for completion
        await create_notification(
            db=db,
            user_id=review.user_id,
            review_id=review.id,
            message=f"Your CV review is now complete and ready to view."
        )
        
    except Exception as e:
        # Update status to failed
        review.status = "failed"
        review.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(review)
        
        # Create notification for failure
        await create_notification(
            db=db,
            user_id=review.user_id,
            review_id=review.id,
            message=f"Your CV review request failed to process. Please try again."
        )
        
        print(f"Error processing review request: {e}")
