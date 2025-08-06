import openai
import os
from typing import Dict
import asyncio

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

async def optimize_resume_content(resume_text: str, job_description: str) -> Dict[str, str]:
    """
    Use AI to optimize resume content based on job description.
    
    Args:
        resume_text (str): Original resume content
        job_description (str): Target job description
        
    Returns:
        Dict[str, str]: Dictionary containing optimized resume and cover letter
    """
    try:
        # Extract keywords from job description
        keywords = await extract_keywords(job_description)
        
        # Optimize resume
        optimized_resume = await optimize_resume_text(resume_text, job_description, keywords)
        
        # Generate cover letter
        cover_letter = await generate_cover_letter(resume_text, job_description, keywords)
        
        return {
            "optimized_resume": optimized_resume,
            "cover_letter": cover_letter,
            "keywords_used": keywords
        }
        
    except Exception as e:
        raise Exception(f"AI optimization failed: {str(e)}")

async def extract_keywords(job_description: str) -> str:
    """Extract relevant keywords from job description."""
    try:
        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-4",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert ATS (Applicant Tracking System) analyzer. Extract the most important keywords, skills, and phrases that would be crucial for ATS scanning from job descriptions."
                },
                {
                    "role": "user",
                    "content": f"""
                    Analyze this job description and extract the key terms, skills, technologies, and phrases that would be important for ATS keyword matching. Focus on:
                    
                    1. Technical skills and tools
                    2. Soft skills and competencies  
                    3. Industry-specific terminology
                    4. Qualification requirements
                    5. Action words and phrases
                    
                    Job Description:
                    {job_description}
                    
                    Return the keywords as a comma-separated list, prioritizing the most important ones first.
                    """
                }
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        raise Exception(f"Keyword extraction failed: {str(e)}")

async def optimize_resume_text(resume_text: str, job_description: str, keywords: str) -> str:
    """Optimize resume content using AI."""
    try:
        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume writer and career coach. Your job is to optimize resumes to improve ATS compatibility while maintaining authenticity and readability. Always preserve the candidate's core experience and achievements."
                },
                {
                    "role": "user", 
                    "content": f"""
                    Please optimize this resume to better match the target job description. Follow these guidelines:
                    
                    1. Naturally incorporate relevant keywords from the keyword list
                    2. Enhance achievement descriptions with quantifiable metrics where possible
                    3. Adjust the professional summary/objective to align with the role
                    4. Optimize skill sections to highlight relevant competencies
                    5. Maintain the original structure and formatting indicators
                    6. Keep all original achievements and experiences truthful
                    7. Use action verbs and industry-standard terminology
                    8. Ensure ATS-friendly formatting cues are preserved
                    
                    Original Resume:
                    {resume_text}
                    
                    Target Job Description:
                    {job_description}
                    
                    Priority Keywords to Incorporate:
                    {keywords}
                    
                    Return the optimized resume maintaining the original structure but with enhanced keyword integration and improved phrasing.
                    """
                }
            ],
            max_tokens=2000,
            temperature=0.4
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        raise Exception(f"Resume optimization failed: {str(e)}")

async def generate_cover_letter(resume_text: str, job_description: str, keywords: str) -> str:
    """Generate a personalized cover letter."""
    try:
        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional cover letter writer. Create compelling, personalized cover letters that connect the candidate's background to the specific role requirements."
                },
                {
                    "role": "user",
                    "content": f"""
                    Create a professional cover letter based on the candidate's resume and the target job description. 
                    
                    Requirements:
                    1. Address it to "Hiring Manager"
                    2. Create an engaging opening that shows genuine interest
                    3. Highlight 2-3 key achievements from the resume that relate to the job
                    4. Demonstrate knowledge of what the role entails
                    5. Naturally incorporate relevant keywords
                    6. End with a strong call to action
                    7. Keep it to 3-4 paragraphs, professional but personable
                    8. Use a modern, confident tone
                    
                    Candidate's Resume:
                    {resume_text}
                    
                    Target Job Description:
                    {job_description}
                    
                    Relevant Keywords:
                    {keywords}
                    
                    Format the cover letter with proper spacing and structure for a business letter.
                    """
                }
            ],
            max_tokens=1500,
            temperature=0.6
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        raise Exception(f"Cover letter generation failed: {str(e)}")