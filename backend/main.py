from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import tempfile
from typing import Optional
import os
from dotenv import load_dotenv

from services.transcription import TranscriptionService
from services.chat_manager import ChatManager
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

chat_manager = ChatManager()


class ChatMessage(BaseModel):
    session_id: str
    message: str


class AudioURLRequest(BaseModel):
    url: HttpUrl
    speakers: Optional[int] = 2


@app.post("/process-audio/")
async def process_audio(file: UploadFile = File(...), speakers: int = 2):
    """Process uploaded audio file"""
    converter = MediaConverter()
    temp_file = None
    optimized_file = None

    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=os.path.splitext(file.filename)[1]
        ) as tmp:
            tmp.write(await file.read())
            temp_file = tmp.name

        # Optimize audio
        optimized_file = await converter.optimize_audio(temp_file)

        # Process the optimized file
        return await process_audio_file(optimized_file, speakers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        converter.cleanup(temp_file, optimized_file)


@app.post("/process-audio-url/")
async def process_audio_url(request: AudioURLRequest):
    """Process audio/video file from URL"""
    converter = MediaConverter()
    downloaded_file = None
    optimized_file = None

    try:
        # Download the file
        downloaded_file = await converter.download_file(str(request.url))

        # Optimize audio
        optimized_file = await converter.optimize_audio(downloaded_file)

        # Process the optimized file
        return await process_audio_file(optimized_file, request.speakers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        converter.cleanup(downloaded_file, optimized_file)


@app.post("/chat/message/")
async def chat_message(request: ChatMessage):
    """Process a chat message"""
    try:
        if not chat_manager.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Chat session not found")

        response = await chat_manager.process_message(
            request.session_id, request.message
        )

        return {"messages": chat_manager.get_messages(request.session_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def process_audio_file(file_path: str, speakers: int):
    """Common processing logic for audio files"""
    try:
        # Get audio info for logging/debugging
        converter = MediaConverter()
        audio_info = converter.get_audio_info(file_path)
        print(f"Processing audio file: {audio_info}")

        # Get transcription
        transcription_service = TranscriptionService()
        transcription_data = transcription_service.transcribe(file_path, speakers)

        # Create new chat session
        session_id = chat_manager.create_session()

        # Send initial summarization prompt
        initial_prompt = (
            f"Please provide a comprehensive summary of the following transcript, "
            f"highlighting key points and action items:\n\n{transcription_data['raw_text']}"
        )
        summary = await chat_manager.process_message(session_id, initial_prompt)

        return {
            "transcription": transcription_data,
            "session_id": session_id,
            "messages": chat_manager.get_messages(session_id),
            "audio_info": audio_info,  # Optional: return audio info to client
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
