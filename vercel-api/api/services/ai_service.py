import logging
import random
import asyncio
import re
from typing import Any, Tuple
import google.generativeai as genai

from api.core.config import settings

logger = logging.getLogger(__name__)

def score_cv(cv_content: str) -> float:
    score = 5.0
    cv_lower = cv_content.lower()
    
    word_count = len(cv_content.split())
    if word_count < 100:
        score -= 1.0 
    elif 300 <= word_count <= 700:
        score += 1.0
    elif word_count > 1000:
        score -= 0.5
    
    if re.search(r'education|degree|university|college', cv_lower):
        score += 0.5
    if re.search(r'experience|work|employment|job', cv_lower):
        score += 0.5
    if re.search(r'skills|abilities|proficiency|competencies', cv_lower):
        score += 0.5
    if re.search(r'projects|portfolio|achievements', cv_lower):
        score += 0.5
    if re.search(r'email|phone|contact|linkedin|github', cv_lower):
        score += 0.5
    
    achievement_count = len(re.findall(r'increased|decreased|improved|achieved|won|created|developed|led|managed|reduced', cv_lower))
    if achievement_count >= 5:
        score += 1.0
    elif achievement_count >= 3:
        score += 0.5

    metrics_count = len(re.findall(r'\d+%|\$\d+|\d+ years|\d+ months|\d+ people|\d+ team', cv_lower))
    if metrics_count >= 3:
        score += 1.0
    elif metrics_count >= 1:
        score += 0.5

    action_verbs = ['implemented', 'developed', 'created', 'designed', 'managed', 'led', 'coordinated', 'achieved', 'improved']
    action_verb_count = sum(1 for verb in action_verbs if f" {verb} " in cv_lower or f"\n{verb} " in cv_lower)
    if action_verb_count >= 5:
        score += 1.0
    elif action_verb_count >= 3:
        score += 0.5
    
    score = max(1.0, min(score, 10.0))
    return round(score, 1)

async def generate_review(cv_content: str) -> Tuple[str, float]:
    score = score_cv(cv_content)
    
    try:
        logger.info(f"Settings GEMINI_API_KEY present: {settings.GEMINI_API_KEY is not None}")
        api_key = settings.GEMINI_API_KEY
        
        if not api_key:
            logger.warning("No Gemini API key found in settings. Using mock review data.")
            return generate_mock_review(cv_content), score
        
        genai.configure(api_key=api_key)
        model_name = "gemini-1.5-flash"
        logger.info(f"Using Gemini model: {model_name}")
        model = genai.GenerativeModel(model_name)
        
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
        
        Format your response with markdown headings and bullet points.
        """

        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                logger.info(f"Sending request to Gemini API (attempt {retry_count + 1})...")
                response = await model.generate_content_async(prompt)
                
                if response and response.text:
                    logger.info("Successfully received response from Gemini")
                    return response.text, score
                else:
                    logger.error("Empty or invalid response from Gemini API")
                    return generate_mock_review(cv_content), score
                    
            except Exception as e:
                if "429" in str(e) or "ResourceExhausted" in str(e):
                    retry_count += 1
                    if retry_count >= max_retries:
                        logger.warning(f"Rate limit exceeded after {max_retries} attempts. Using mock review.")
                        return generate_mock_review(cv_content), score
                    
                    wait_time = (2 ** retry_count) + (random.random() * 2)
                    logger.info(f"Rate limit exceeded. Retrying in {wait_time:.2f} seconds (attempt {retry_count}/{max_retries})")
                    await asyncio.sleep(wait_time)
                else:
                    raise
        
        return generate_mock_review(cv_content), score
            
    except Exception as e:
        logger.exception(f"Error generating CV review: {e}")
        return generate_mock_review(cv_content), score

def generate_mock_review(cv_content: str) -> str:
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
