from google.cloud import speech_v1p1beta1 as speech
from typing import Dict, Any
import os

# Set up Google Cloud Speech-to-Text
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google-credentials.json"


class TranscriptionService:
    def __init__(self):
        self.client = speech.SpeechClient()

    def transcribe(self, audio_path: str, speaker_count: int) -> Dict[str, Any]:
        """Transcribes audio using Google Speech-to-Text with speaker diarization"""
        try:
            config = {
                "enable_speaker_diarization": True,
                "diarization_speaker_count": speaker_count,
                "language_code": "ar-EG",
                "alternative_language_codes": ["en-US"],
                "audio_channel_count": 1,
                "sample_rate_hertz": 16000,
                "encoding": speech.RecognitionConfig.AudioEncoding.FLAC,
                "enable_word_time_offsets": True,  # Enable word timestamps
            }

            with open(audio_path, "rb") as audio_file:
                audio = {"content": audio_file.read()}

            response = self.client.recognize(config=config, audio=audio)

            # Process the diarization results
            result = response.results[-1]
            words_info = result.alternatives[0].words

            # Organize words by speaker
            transcript_data = {
                "speakers": {},  # Speaker-grouped text
                "words": [],  # Detailed word information
                "raw_text": "",  # Complete transcript
            }

            current_speaker = None
            current_sentence = []

            for word_info in words_info:
                speaker_tag = word_info.speaker_tag
                word = word_info.word
                start_time = word_info.start_time.total_seconds()
                end_time = word_info.end_time.total_seconds()

                # Add to detailed words list
                word_data = {
                    "word": word,
                    "speaker": speaker_tag,
                    "start_time": start_time,
                    "end_time": end_time,
                }
                transcript_data["words"].append(word_data)

                # Build raw text
                transcript_data["raw_text"] += f"{word} "

                # Group by speaker
                if speaker_tag != current_speaker:
                    if current_sentence:
                        speaker_key = f"speaker_{current_speaker}"
                        if speaker_key not in transcript_data["speakers"]:
                            transcript_data["speakers"][speaker_key] = []
                        transcript_data["speakers"][speaker_key].append(
                            {
                                "text": " ".join(current_sentence),
                                "start_time": current_sentence_start,
                                "end_time": current_sentence_end,
                            }
                        )
                    current_speaker = speaker_tag
                    current_sentence = [word]
                    current_sentence_start = start_time
                    current_sentence_end = end_time
                else:
                    current_sentence.append(word)
                    current_sentence_end = end_time

            # Add the last sentence
            if current_sentence:
                speaker_key = f"speaker_{current_speaker}"
                if speaker_key not in transcript_data["speakers"]:
                    transcript_data["speakers"][speaker_key] = []
                transcript_data["speakers"][speaker_key].append(
                    {
                        "text": " ".join(current_sentence),
                        "start_time": current_sentence_start,
                        "end_time": current_sentence_end,
                    }
                )

            return transcript_data
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")
