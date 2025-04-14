import httpx
from typing import Optional
import asyncio
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

async def generate_review(cv_content: str) -> str:
    """
    Generate a CV review using the HuggingFace API
    
    Args:
        cv_content: The content of the CV to review
        
    Returns:
        A generated review of the CV
    """
    # Simulate processing delay for development 
    # This would be removed in production
    await asyncio.sleep(5)
    
    try:
        # Prepare the prompt for the model
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
        
        # Check if we have a HuggingFace API token
        if settings.HUGGINGFACE_API_TOKEN:
            # Call HuggingFace API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api-inference.huggingface.co/models/{settings.HUGGINGFACE_MODEL}",
                    headers={"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"},
                    json={"inputs": prompt, "parameters": {"max_length": 1000, "temperature": 0.7}}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    # Extract the generated text from the response
                    # The exact format depends on the model being used
                    if isinstance(data, list) and len(data) > 0:
                        if "generated_text" in data[0]:
                            return data[0]["generated_text"]
                        return data[0]
                    elif isinstance(data, dict) and "generated_text" in data:
                        return data["generated_text"]
                    else:
                        logger.error(f"Unexpected response format: {data}")
                        return generate_mock_review()
                else:
                    logger.error(f"HuggingFace API error: {response.status_code} - {response.text}")
                    return generate_mock_review()
        else:
            # If no API token, generate a mock review for development
            return generate_mock_review()
            
    except Exception as e:
        logger.exception(f"Error generating CV review: {e}")
        return generate_mock_review()

def generate_mock_review() -> str:
    
    return 