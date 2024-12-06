from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from google.cloud import speech_v1p1beta1 as speech
from openai import OpenAI
import tempfile
import os

from dotenv import load_dotenv

load_dotenv()  # Loads variables from .env file

app = FastAPI()

# List of allowed origins
origins = [
    "http://localhost:5173",  # Example: React frontend on localhost
    "http://example.com",  # Example: Production frontend domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from specific origins
    allow_credentials=True,  # Allows cookies and credentials
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Set up Google Cloud Speech-to-Text and OpenAI API keys
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google-credentials.json"

openaiClient = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


@app.post("/process-audio/")
async def process_audio(file: UploadFile = File(...), speakers: int = 2):
    """
    Endpoint to process uploaded audio file:
    - Transcribes the audio with Google Speech-to-Text (including speaker diarization).
    - Summarizes the transcript using OpenAI GPT-4.
    """
    # Save the uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_file.write(file.file.read())
        temp_file_path = temp_file.name

    try:
        # Step 1: Transcribe audio with Google Speech-to-Text
        transcript_with_speakers = transcribe_audio_with_google(
            temp_file_path, speakers
        )
        # Step 2: Summarize the transcript using OpenAI GPT-4
        summary = await summarize_with_gpt4(transcript_with_speakers)

        # Return the transcript and summary as a response
        return {
            "transcript": transcript_with_speakers,
            "summary": summary,
        }
    finally:
        # Clean up the temporary file
        os.remove(temp_file_path)


def transcribe_audio_with_google(audio_path: str, speaker_count: int) -> str:
    """
    Transcribes audio using Google Speech-to-Text with speaker diarization.
    """
    client = speech.SpeechClient()

    # Configure Google STT request
    config = {
        "enable_speaker_diarization": True,
        "diarization_speaker_count": speaker_count,
        "language_code": "ar-EG",  # Arabic (Egypt)
        "alternative_language_codes": ["en-US"],  # Secondary language (English - US)
        "audio_channel_count": 2,  # For stereo audio
    }

    with open(audio_path, "rb") as audio_file:
        audio = {"content": audio_file.read()}

    response = client.recognize(config=config, audio=audio)

    # Process the results to include speaker tags
    result = response.results[-1]  # Get the last result (most stable)
    words_info = result.alternatives[0].words
    transcript = []
    for word in words_info:
        transcript.append(f"{word.word} ")
    return " ".join(transcript)


async def summarize_with_gpt4(transcript: str) -> str:
    """
    Summarizes the transcript using OpenAI GPT-4o.
    """
    prompt = f"""
    Summarize the following Arabic/English transcript of a meeting into key points and action items in egyptian arabic, but don't translate english words, use them as they are:
    {transcript}
    """
    response = openaiClient.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content
