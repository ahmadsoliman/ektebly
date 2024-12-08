from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import httpx
from typing import Optional
import tempfile
import os
from dotenv import load_dotenv

from services.transcription import TranscriptionService
from services.summarization import SummarizationService

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioURLRequest(BaseModel):
    url: HttpUrl
    speakers: Optional[int] = 2

@app.post("/process-audio/")
async def process_audio(file: UploadFile = File(...), speakers: int = 2):
    """Process uploaded audio file"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        try:
            return await process_audio_file(temp_file_path, speakers)
        finally:
            os.remove(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-audio-url/")
async def process_audio_url(request: AudioURLRequest):
    """Process audio file from URL"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(str(request.url))
            response.raise_for_status()

            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(response.content)
                temp_file_path = temp_file.name

            try:
                return await process_audio_file(temp_file_path, request.speakers)
            finally:
                os.remove(temp_file_path)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch audio file: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_audio_file(file_path: str, speakers: int):
    """Common processing logic for audio files"""
    try:
        transcription_service = TranscriptionService()
        transcript = transcription_service.transcribe(file_path, speakers)

        summarization_service = SummarizationService()
        summary = await summarization_service.summarize(transcript)

        return {
            "transcript": transcript,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
