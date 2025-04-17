from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import os
from dotenv import load_dotenv
import groq
from typing import List, Dict
from supabase import create_client
from pydantic_ai import Agent, RunContext
from colorama import Fore
from dataclasses import dataclass
import logfire
import asyncio

load_dotenv()
load_dotenv()
logfire.configure()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@dataclass
class QuesAns:
    question_number: int
    question: str
    answer: str

def extract_text_from_pdf(file_bytes):
    # pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    # text = ""
    # for page in pdf_reader.pages:
    #     text += page.extract_text()
    # return text

    text = f"""The digestive system is made up of the gastrointestinal tract—also called the GI tract or digestive tract—and the liver, pancreas, and gallbladder. The GI tract is a series of hollow organs joined in a long, twisting tube from the mouth to the anus. The hollow organs that make up the GI tract are the mouth, esophagus, stomach, small intestine, large intestine, and anus. The liver, pancreas, and gallbladder are the solid organs of the digestive system.
        The small intestine has three parts. The first part is called the duodenum. The jejunum is in the middle and the ileum is at the end. The large intestine includes the appendix, cecum, colon, and rectum. The appendix is a finger-shaped pouch attached to the cecum. The cecum is the first part of the large intestine. The colon is next. The rectum is the end of the large intestine."""
    return text

def generate_qa_from_text(text: str, topic: str) -> List[Dict]:
    prompt = f"""Based on the following text about {topic}, generate 5 subjective essay-type questions and their detailed answers. Make the questions challenging and thought-provoking.

Text: {text[:6000]}  # LLaMA-3 has a larger context window

Generate the output in this format:
Q1: [Question]
A1: [Answer]
Q2: [Question]
A2: [Answer]
... and so on"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator who creates high-quality study materials."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=4000,
        )
        
        qa_text = chat_completion.choices[0].message.content
        qa_pairs = []
        
        lines = qa_text.split('\n')
        current_q = None
        current_a = None
        question_num = 1
        
        for line in lines:
            if line.startswith('Q'):
                if current_q and current_a:
                    qa_pairs.append({
                        "question_num": question_num,
                        "question": current_q,
                        "answer": current_a
                    })
                    question_num += 1
                current_q = line[line.find(':')+1:].strip()
                current_a = None
            elif line.startswith('A'):
                current_a = line[line.find(':')+1:].strip()
        
        if current_q and current_a:
            qa_pairs.append({
                "question_num": question_num,
                "question": current_q,
                "answer": current_a
            })
        
        return qa_pairs
    except Exception as e:
        print(f"Error generating Q&A: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating Q&A")

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    topic: str = Form(...),
    user_id: str = Form(...)
):
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        qa_pairs = generate_qa_from_text(text, topic)
        return {"qa_pairs": qa_pairs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-qa")
async def save_qa(
    topic: str,
    user_id: str,
    qa_pairs: List[Dict]
):
    try:
        # Insert each Q&A pair into the Study_mate table
        for qa_pair in qa_pairs:
            data = {
                "user_id": user_id,
                "topic": topic,
                "question_num": qa_pair["question_num"],
                "question": qa_pair["question"],
                "answer": qa_pair["answer"]
            }
            
            result = supabase.table(os.getenv("SUPABASE_STUDYMATE_TABLE")).insert(data).execute()
            
            if hasattr(result, 'error') and result.error is not None:
                raise Exception(result.error.message)
                
        return {"message": "Saved successfully"}
    except Exception as e:
        print(f"Error saving to Supabase: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/topics/{user_id}")
async def get_topics(user_id: str):
    try:
        logfire.info(f"----get_topics called for {user_id}----")
        result = supabase.table(os.getenv("SUPABASE_STUDYMATE_TABLE"))\
            .select("topic")\
            .eq("user_id", user_id)\
            .execute()
        logfire.info(f"DB Response: {result}")

        if hasattr(result, 'error') and result.error is not None:
            raise Exception(result.error.message)
            
        # Get unique topics
        topics = set(item['topic'] for item in result.data)
        return {"topics": list(topics)}
    except Exception as e:
        logfire.error(f"Failed to get topics from Supabase DB. Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/qa/{topic}/{user_id}")
async def get_qa_by_topic(topic: str, user_id: str):
    try:
        result = supabase.table(os.getenv("SUPABASE_STUDYMATE_TABLE"))\
            .select("*")\
            .eq("topic", topic)\
            .eq("user_id", user_id)\
            .order("question_num")\
            .execute()
            
        if hasattr(result, 'error') and result.error is not None:
            raise Exception(result.error.message)
            
        qa_pairs = [
            {
                "question": item["question"],
                "answer": item["answer"]
            }
            for item in result.data
        ]
        return {"qa_pairs": qa_pairs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quiz/{topic}")
async def get_quiz_question(topic: str):
    try:
        response = supabase.table(os.getenv("SUPABASE_STUDYMATE_TABLE"))\
            .select("*")\
            .eq("topic", topic)\
            .order("question_num")\
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="No questions found for this topic")
        
        # Return all questions in order
        questions = [
            {
                "question": item["question"],
                "answer": item["answer"],
                "question_num": item["question_num"]
            }
            for item in response.data
        ]
        return {"questions": questions}
    except Exception as e:
        logfire.error(f"Failed to get quiz questions. Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/check-answer")
async def check_answer(request: dict):
    try:
        question = request["question"]
        expected_answer = request["expected_answer"]
        user_answer = request["user_answer"]

        # Use Groq to evaluate the answer
        prompt = f"""You are a knowledgeable teacher evaluating a student's answer.
        
Question: {question}
Expected Answer: {expected_answer}
Student's Answer: {user_answer}

Evaluate if the student's answer is correct and provide constructive feedback.
Return your response in this format:
{{
    "is_correct": true/false,
    "feedback": "Your feedback here"
}}

Make sure your response is valid JSON."""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert teacher who provides accurate and constructive feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.3,
            max_tokens=500,
        )
        
        import json
        response = json.loads(chat_completion.choices[0].message.content)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-exam")
async def generate_exam(text: str = Form(...)):
    try:
        prompt = f"""Based on the following text, generate a sample exam paper with the following types of questions:
        1. 5 Fill in the blanks
        2. 5 True or False statements
        3. 5 Short Questions (to be answered in one sentence)
        4. 3 Long Questions (Essay type questions)

        Please format the output as follows:
        FILL IN THE BLANKS:
        1. [question]
        ...

        TRUE OR FALSE:
        1. [statement]
        ...

        SHORT QUESTIONS:
        1. [question]
        ...

        LONG QUESTIONS:
        1. [question]
        ...

        ---ANSWERS---
        FILL IN THE BLANKS:
        1. [answer]
        ...

        TRUE OR FALSE:
        1. [True/False]
        ...

        SHORT QUESTIONS:
        1. [answer]
        ...

        LONG QUESTIONS:
        1. [detailed answer]
        ...

        Text: {text[:6000]}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator who creates comprehensive exam papers."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=4000,
        )
        
        exam_content = chat_completion.choices[0].message.content
        # Split into questions and answers
        parts = exam_content.split("---ANSWERS---")
        return {
            "questions": parts[0].strip(),
            "answers": parts[1].strip() if len(parts) > 1 else "Answers not available"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-youtube-videos")
async def get_youtube_videos(text: str = Form(...)):
    try:
        # First, generate topics using Groq
        prompt = f"""Based on the following text, generate exactly two main topics that would be most beneficial for students to watch educational videos about. Format your response as:
        Topic 1: [topic]
        Topic 2: [topic]

        Text: {text[:3000]}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator who can identify key learning topics."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=200,
        )
        
        topics_text = chat_completion.choices[0].message.content
        topics = [line.split(": ")[1].strip() for line in topics_text.split("\n") if ": " in line]

        # For each topic, search YouTube using YouTube Data API
        youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        if not youtube_api_key:
            raise HTTPException(status_code=500, detail="YouTube API key not configured")

        import googleapiclient.discovery
        youtube = googleapiclient.discovery.build("youtube", "v3", developerKey=youtube_api_key)

        all_videos = []
        for topic in topics:
            request = youtube.search().list(
                part="snippet",
                maxResults=5,
                q=f"{topic} educational",
                type="video"
            )
            response = request.execute()
            
            videos = [{
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                "thumbnail": item["snippet"]["thumbnails"]["default"]["url"],
                "description": item["snippet"]["description"]
            } for item in response["items"]]
            
            all_videos.extend(videos)

        return {
            "topics": topics,
            "videos": all_videos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/answer-question")
async def answer_question(text: str = Form(...), question: str = Form(...)):
    try:
        prompt = f"""Based on the following text, answer the question. Only use information from the provided text. If the answer cannot be found in the text, say so.

        Text: {text[:6000]}

        Question: {question}

        Answer:"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educator who provides accurate and concise answers based solely on the given text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=1000,
        )
        
        answer = chat_completion.choices[0].message.content
        return {"answer": answer.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
