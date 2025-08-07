# resume_builder.py

import os
import json
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted


# --- Configuration ---

# Load environment variables from a .env file
load_dotenv()

# Configure the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("🔴 GEMINI_API_KEY not found. Please set it in your .env file.")
genai.configure(api_key=api_key)

# Use the fast and efficient 'flash' model, suitable for free-tier
model = genai.GenerativeModel('gemini-1.5-flash-latest')


# --- Helper Functions ---

def get_response_text_safe(response) -> str:
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
                f"Content generation blocked. Reason: {block_reason}. "
                f"Safety Ratings: {safety_ratings}"
            )
            raise ValueError(error_message)
        # Handle other potential empty response scenarios
        raise ValueError("No valid content received from Gemini API. The response was empty.")


# --- AI Content Generation ---

async def optimize_resume_content(resume_text: str, job_description: str) -> dict:
    """
    Sends resume text to Gemini and gets an optimized resume and cover letter back as a structured JSON object.
    """
    prompt = f"""
You are an expert resume writer and career coach. Your task is to create an optimized resume and a compelling cover letter based on the provided resume text and a target job description.

**Instructions:**

**Part 1: Optimized Resume**
1.  Carefully read the original resume and the job description.
2.  Rewrite the resume to be impactful and perfectly aligned with the target job.
3.  Use strong action verbs and quantify achievements with metrics where possible (e.g., "Increased efficiency by 20%").
4.  Seamlessly integrate keywords from the job description.
5.  Do NOT invent information. Base your output strictly on the provided resume content.
6.  Format the resume text clearly with a main header (Name), contact info, and then sections (e.g., PROFESSIONAL SUMMARY, SKILLS, WORK EXPERIENCE, EDUCATION). Use newlines for separation. For bullet points under experience, start the line with a '•'.

**Part 2: Cover Letter**
1.  Write a professional and persuasive cover letter.
2.  The letter should introduce the candidate, highlight 2-3 key qualifications from their resume that match the job description, and express enthusiasm for the role.
3.  Keep it concise, around 3-4 paragraphs, separated by double newlines.
4.  Address it to "Hiring Manager" if no name is provided.

**Output Format:**
Return a single, minified JSON object. Do not add any text before or after the JSON.
The JSON structure must be:
{{
  "optimized_resume": "Full text of the optimized resume, formatted with newlines...",
  "cover_letter": "Full text of the cover letter, formatted with newlines..."
}}

**Original Resume Text:**
---
{resume_text}
---

**Target Job Description:**
---
{job_description}
---
"""
    
    generation_config = genai.types.GenerationConfig(
        response_mime_type="application/json",
        max_output_tokens=4096,
        temperature=0.5
    )
    
    retries = 3
    delay = 10  # Start with a 10-second delay for free-tier
    for i in range(retries):
        try:
            response = await model.generate_content_async(prompt, generation_config=generation_config)
            json_text = get_response_text_safe(response)
            return json.loads(json_text)
        except ResourceExhausted as e:
            print(f"🟡 Quota exceeded. Retrying in {delay} seconds... (Attempt {i+1}/{retries})")
            await asyncio.sleep(delay)
            delay *= 2  # Exponential backoff
        except (ValueError, json.JSONDecodeError) as e:
            print(f"🔴 Error processing AI response: {e}")
            raise  # Re-raise the exception after logging
            
    raise Exception("🔴 AI content generation failed after multiple retries.")