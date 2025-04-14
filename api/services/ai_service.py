import httpx
import logging
import asyncio
import json
from typing import Dict, Any

from api.core.config import settings

logger = logging.getLogger(__name__)

async def generate_review(cv_content: str) -> str:
    await asyncio.sleep(3)  # Simulate processing delay
    
    try:
        if settings.AI_API_TOKEN:
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
            
            headers = {"Authorization": f"Bearer {settings.AI_API_TOKEN}"}
            
            async with httpx.AsyncClient() as client:
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
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.error(f"API error: {response.status_code} - {response.text}")
                    return generate_mock_review(cv_content)
        else:
            return generate_mock_review(cv_content)
            
    except Exception as e:
        logger.exception(f"Error generating CV review: {e}")
        return generate_mock_review(cv_content)

def generate_mock_review(cv_content: str) -> str:
    sections = ["# CV Review Summary", 
                "Thank you for submitting your CV for review. Here's my professional feedback to help you improve your CV.",
                
                "## Overall Structure and Formatting",
                "Your CV has a clear structure, but consider using more consistent formatting for section headings. Add more whitespace between sections to improve readability.",
                
                "## Content and Relevance",
                "The content is relevant to your field, but you should tailor specific achievements to match job descriptions. Quantify your achievements with specific metrics where possible.",
                
                "## Skills and Qualifications",
                "Your skills section is comprehensive, but consider organizing technical skills by proficiency level. Add any relevant certifications or training programs.",
                
                "## Experience Description",
                "Your experience descriptions focus too much on responsibilities rather than achievements. Restructure these to highlight results and impact. Use action verbs at the beginning of each bullet point.",
                
                "## Education Section",
                "Your education section is clear, but consider adding relevant coursework, academic achievements, or projects if you're early in your career.",
                
                "## Specific Improvements",
                "1. Add a professional summary at the top\n2. Include LinkedIn and GitHub profiles\n3. Remove references to outdated technologies\n4. Prioritize most recent and relevant experience"]
    
    return "\n\n".join(sections)