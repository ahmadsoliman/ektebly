from google.cloud import speech_v1p1beta1 as speech
import os

# Set up Google Cloud Speech-to-Text
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google-credentials.json"


class TranscriptionService:
    def __init__(self):
        self.client = speech.SpeechClient()

    def transcribe(self, audio_path: str, speaker_count: int) -> str:
        """Transcribes audio using Google Speech-to-Text with speaker diarization"""
        try:
            config = {
                "enable_speaker_diarization": True,
                "diarization_speaker_count": speaker_count,
                "language_code": "ar-EG",
                "alternative_language_codes": ["en-US"],
            }

            with open(audio_path, "rb") as audio_file:
                audio = {"content": audio_file.read()}

            response = self.client.recognize(config=config, audio=audio)

            result = response.results[-1]
            words_info = result.alternatives[0].words
            transcript = []
            for word in words_info:
                transcript.append(f"{word.word} ")

            return " ".join(transcript)
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")
