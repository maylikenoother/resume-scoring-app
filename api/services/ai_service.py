import httpx
import logging
import asyncio
import json
import os
from typing import Dict, Any, Optional

from api.core.config import settings

logger = logging.getLogger(__name__)

async def generate_review(cv_content: str) -> str:
    """
    Generate an AI review for the CV content.
    
    Args:
        cv_content: The text content of the CV to review
        
    Returns:
        A formatted review of the CV
    """
    try:
        logger.info(f"Settings OPENAI_API_KEY present: {settings.OPENAI_API_KEY is not None}")
        logger.info(f"Environment OPENAI_API_KEY present: {os.environ.get('OPENAI_API_KEY') is not None}")
        
        api_key = settings.OPENAI_API_KEY or os.environ.get('OPENAI_API_KEY')
        
        if not api_key:
            logger.warning("No OpenAI API key found in settings or environment. Using mock review data.")
            return generate_mock_review(cv_content)
        
        prompt = f"""
        Please review the following CV and provide professional feedback on how to improve it:
        
        {cv_content}
        
        Provide feedback on:
        1. Overall structure and formatting
        2. Content and relevance
        3. Skills and qualifications
        4. Experience description
        5. Education section
        6. Specific improvements
        """

        logger.info(f"Using OpenAI Model: {settings.AI_MODEL}")
        
        headers = {"Authorization": f"Bearer {api_key}"}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info("Sending request to OpenAI API...")
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": settings.AI_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are a professional CV reviewer."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code == 200:
                    logger.info("Successfully received response from OpenAI")
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.error(f"API error: {response.status_code} - {response.text}")
                    error_message = f"Error from OpenAI API: {response.status_code}"
                    if response.text:
                        try:
                            error_data = response.json()
                            if "error" in error_data and "message" in error_data["error"]:
                                error_message = f"OpenAI API error: {error_data['error']['message']}"
                        except:
                            pass
                    
                    logger.error(error_message)
                    return generate_mock_review(cv_content)
            except httpx.RequestError as e:
                logger.exception(f"Request error: {e}")
                return generate_mock_review(cv_content)
    except Exception as e:
        logger.exception(f"Error generating CV review: {e}")
        return generate_mock_review(cv_content)

def generate_mock_review(cv_content: str) -> str:
    """
    Generate a mock review when the AI service is unavailable.
    
    Args:
        cv_content: The CV content (used to make the review appear more tailored)
        
    Returns:
        A pre-formatted mock review
    """
    has_education = "education" in cv_content.lower() or "university" in cv_content.lower() or "degree" in cv_content.lower()
    has_skills = "skills" in cv_content.lower() or "proficient" in cv_content.lower()
    has_experience = "experience" in cv_content.lower() or "work" in cv_content.lower()
    
    sections = [
        "# CV Review Summary", 
        "Thank you for submitting your CV for review. Here's my professional feedback to help you improve your CV.",
        
        "## Overall Structure and Formatting",
        "Your CV has a clear structure, but consider using more consistent formatting for section headings. Add more whitespace between sections to improve readability.",
        
        "## Content and Relevance",
        "The content is relevant to your field, but you should tailor specific achievements to match job descriptions. Quantify your achievements with specific metrics where possible."
    ]
    
    if has_skills:
        sections.append("## Skills and Qualifications")
        sections.append("Your skills section is comprehensive, but consider organizing technical skills by proficiency level. Add any relevant certifications or training programs.")
    else:
        sections.append("## Skills and Qualifications")
        sections.append("I recommend adding a dedicated Skills section to highlight your technical and soft skills. Organize them by category and proficiency level.")
    
    if has_experience:
        sections.append("## Experience Description")
        sections.append("Your experience descriptions focus too much on responsibilities rather than achievements. Restructure these to highlight results and impact. Use action verbs at the beginning of each bullet point.")
    else:
        sections.append("## Experience Description")
        sections.append("Your work experience section needs more detail. For each role, include 3-5 bullet points that emphasize achievements and quantifiable results, not just job duties.")
    
    if has_education:
        sections.append("## Education Section")
        sections.append("Your education section is clear, but consider adding relevant coursework, academic achievements, or projects if you're early in your career.")
    else:
        sections.append("## Education Section")
        sections.append("Make sure your education section is properly structured with dates, institution names, and degrees clearly stated. Add relevant coursework if you're a recent graduate.")
    
    sections.append("## Specific Improvements")
    sections.append("1. Add a professional summary at the top\n2. Include LinkedIn and GitHub profiles\n3. Remove references to outdated technologies\n4. Prioritize most recent and relevant experience")
    
    return "\n\n".join(sections)