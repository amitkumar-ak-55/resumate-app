import os
import google.generativeai as genai
import asyncio
from dotenv import load_dotenv
from typing import Dict

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
genai.configure(api_key=api_key)

# Instantiate Gemini generative model with a valid, current model name
# Use 'gemini-1.5-pro-latest' for the latest Pro model
model = genai.GenerativeModel('gemini-1.5-flash')


async def optimize_resume_content(resume_text: str, job_description: str) -> Dict[str, str]:
    """Orchestrates the AI-powered optimization of resume and cover letter."""
    try:
        # Run AI tasks concurrently for better performance
        keywords, optimized_resume, cover_letter = await asyncio.gather(
            extract_keywords(job_description),
            optimize_resume_text(resume_text, job_description),
            generate_cover_letter(resume_text, job_description)
        )
        
        # A second optimization pass now that we have keywords, could be an option
        # For simplicity, we'll just pass the keywords along.
        
        return {
            "optimized_resume": optimized_resume,
            "cover_letter": cover_letter,
            "keywords_used": keywords
        }
    except Exception as e:
        # Propagate a more informative error message
        raise Exception(f"AI optimization process failed: {str(e)}")


def get_response_text_safe(response, func_name: str) -> str:
    """
    Safely extracts text from the Gemini API response and provides detailed error info.
    """
    try:
        return response.text.strip()
    except ValueError:
        # This occurs if the response was blocked. Inspect prompt_feedback for the reason.
        if response.prompt_feedback:
            block_reason = response.prompt_feedback.block_reason
            safety_ratings = response.prompt_feedback.safety_ratings
            error_message = (
                f"Content generation blocked in '{func_name}'. "
                f"Reason: {block_reason}. "
                f"Safety Ratings: {safety_ratings}"
            )
            raise ValueError(error_message)
        # Handle other potential empty response scenarios
        raise ValueError(f"No valid content received from Gemini API in '{func_name}'. The response was empty.")


async def extract_keywords(job_description: str) -> str:
    """Extracts ATS-friendly keywords from a job description."""
    prompt = f"""
You are an expert ATS (Applicant Tracking System) analyzer. Extract the most important keywords, skills, and phrases from the following job description. Focus on technical skills, tools, soft skills, qualifications, and industry terminology.

Job Description:
{job_description}

Return the keywords as a single, comma-separated string, prioritizing the most important ones first.
"""
    response = await model.generate_content_async(
        prompt,
        generation_config=genai.types.GenerationConfig(max_output_tokens=300, temperature=0.2)
    )
    return get_response_text_safe(response, "extract_keywords")


async def optimize_resume_text(resume_text: str, job_description: str) -> str:
    """Optimizes a resume to align with a job description."""
    prompt = f"""
You are an expert resume writer. Optimize the following resume to align with the target job description, enhancing its ATS compatibility and impact.

Guidelines:
1. Naturally incorporate relevant keywords and phrases from the job description.
2. Quantify achievements with metrics where possible (e.g., "Increased sales by 15%").
3. Align the professional summary with the key requirements of the role.
4. Maintain the candidate's authentic experience and skills. Do not invent information.
5. Use strong action verbs and professional, industry-specific terminology.
6. Ensure the final output is in a clean, ATS-friendly format.

Original Resume:
{resume_text}

Target Job Description:
{job_description}

Return only the full, optimized resume text.
"""
    response = await model.generate_content_async(
        prompt,
        generation_config=genai.types.GenerationConfig(max_output_tokens=2048, temperature=0.4)
    )
    return get_response_text_safe(response, "optimize_resume_text")


async def generate_cover_letter(resume_text: str, job_description: str) -> str:
    """Generates a personalized cover letter."""
    prompt = f"""
You are a professional cover letter writer. Using the provided resume and job description, create a compelling and personalized cover letter.

Requirements:
- Address it to the "Hiring Manager".
- Write a strong, engaging opening paragraph that shows genuine interest in the role.
- In the body (1-2 paragraphs), highlight 2-3 key achievements from the resume that directly relate to the job's requirements.
- Conclude with a strong call to action, expressing enthusiasm for an interview.
- The tone should be professional, confident, and personable.
- The length should be approximately 3-4 paragraphs.

Candidate's Resume:
{resume_text}

Target Job Description:
{job_description}

Return only the full cover letter text.
"""
    response = await model.generate_content_async(
        prompt,
        generation_config=genai.types.GenerationConfig(max_output_tokens=1000, temperature=0.6)
    )
    return get_response_text_safe(response, "generate_cover_letter")