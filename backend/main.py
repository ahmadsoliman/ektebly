from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import tempfile
import os
from dotenv import load_dotenv
from typing import Optional

from services.transcription import TranscriptionService
from services.summarization import SummarizationService
from services.media_converter import MediaConverter

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
            # Convert to WAV if not already WAV
            if not file.filename.lower().endswith('.wav'):
                converter = MediaConverter()
                wav_path = await converter.convert_to_wav(temp_file_path)
                converter.cleanup(temp_file_path)
                temp_file_path = wav_path

            return await process_audio_file(temp_file_path, speakers)
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-audio-url/")
async def process_audio_url(request: AudioURLRequest):
    """Process audio/video file from URL"""
    converter = MediaConverter()
    downloaded_file = None
    converted_file = None

    try:
        # Download the file
        downloaded_file = await converter.download_file(str(request.url))
        
        # Convert to WAV
        converted_file = await converter.convert_to_wav(downloaded_file)
        
        # Process the WAV file
        return await process_audio_file(converted_file, request.speakers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary files
        converter.cleanup(downloaded_file, converted_file)

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
