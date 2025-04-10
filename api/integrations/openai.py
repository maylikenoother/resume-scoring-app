# api/integrations/openai.py
import os
from typing import Dict, Optional, Tuple
import logging

from openai import OpenAI

from api.config.settings import settings

logger = logging.getLogger(__name__)

# Initialize the OpenAI client
client = OpenAI(api_key=settings.openai_api_key)


async def analyze_cv(cv_text: str) -> Tuple[float, str]:
    """
    Analyze a CV using OpenAI's GPT model.
    
    Args:
        cv_text: The CV text content to analyze
        
    Returns:
        Tuple containing (score, feedback)
        
    Raises:
        Exception: If the OpenAI API call fails
    """
    try:
        # If no API key is set, return mock data for testing
        if not settings.openai_api_key:
            # During development, return mock data
            logger.warning("No OpenAI API key set. Using mock data.")
            return 7.5, "This is mock feedback for your CV. In production, we would use OpenAI's API to provide detailed analysis of your resume."
        
        # Define the system prompt for CV analysis
        system_prompt = """
        You are an expert CV/resume analyst. You'll be given a CV to evaluate.
        
        Analyze the CV for the following criteria:
        1. Content quality and relevance
        2. Structure and formatting
        3. Grammar and language
        4. Quantifiable achievements
        5. Skills and qualifications
        6. Overall impression
        
        Provide a comprehensive analysis with specific feedback on strengths and areas for improvement.
        Also provide a numerical score from 1-10 (with one decimal place) representing the overall quality.
        
        Format your response as:
        SCORE: [numerical score]
        
        FEEDBACK:
        [detailed feedback with specific recommendations for improvement]
        """
        
        # Create the completion using the OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": cv_text}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract the response content
        response_text = response.choices[0].message.content
        
        # Parse the response to extract score and feedback
        lines = response_text.split('\n')
        score_line = next((line for line in lines if line.startswith('SCORE:')), None)
        
        if score_line:
            # Extract the score
            try:
                score = float(score_line.replace('SCORE:', '').strip())
                
                # Get feedback (everything after "FEEDBACK:")
                feedback_index = response_text.find('FEEDBACK:')
                if feedback_index != -1:
                    feedback = response_text[feedback_index + len('FEEDBACK:'):].strip()
                else:
                    feedback = response_text.replace(score_line, '').strip()
                
                return score, feedback
            except ValueError:
                # If score parsing fails, use default values
                logger.error("Failed to parse score from OpenAI response")
                return 5.0, response_text
        else:
            # If we can't parse the structure, return the full text as feedback with default score
            logger.warning("Failed to find SCORE in OpenAI response")
            return 5.0, response_text
            
    except Exception as e:
        logger.exception(f"Error analyzing CV: {e}")
        return 0.0, f"Error analyzing CV: {str(e)}"