import os
import logging
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import whisper
import openai

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
openai.api_key = os.getenv('OPENAI_API_KEY')

def transcribe_audio(file_path: str) -> Dict[str, Any]:
    """
    Transcribe audio file using Whisper model
    
    Args:
        file_path (str): Path to audio file
    
    Returns:
        Dict containing transcription results
    """
    try:
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        return {
            "text": result['text'],
            "language": result['language']
        }
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise

def summarize_text(text: str) -> Optional[str]:
    """
    Generate summary using OpenAI
    
    Args:
        text (str): Input text to summarize
    
    Returns:
        Summarized text or None
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Summarize the following text concisely:"},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message['content']
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        return None

@app.route('/transcribe', methods=['POST'])
def transcribe_endpoint():
    """
    Endpoint for audio transcription and summarization
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        file.save('temp_audio_file')
        
        transcription = transcribe_audio('temp_audio_file')
        summary = summarize_text(transcription['text'])
        
        os.remove('temp_audio_file')
        
        return jsonify({
            "transcription": transcription,
            "summary": summary
        })
    
    except Exception as e:
        logger.error(f"Request processing error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
