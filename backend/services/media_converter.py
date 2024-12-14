import ffmpeg
import os
import tempfile
import httpx
from typing import Optional
import asyncio
from pathlib import Path

class MediaConverter:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()

    async def download_file(self, url: str) -> str:
        """Download file from URL to temporary location"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()

                # Create temp file with appropriate extension
                content_type = response.headers.get('content-type', '')
                ext = self._get_extension_from_content_type(content_type)
                
                temp_path = Path(self.temp_dir) / f"download{ext}"
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                return str(temp_path)
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")

    def _get_extension_from_content_type(self, content_type: str) -> str:
        """Get file extension from content type"""
        content_type = content_type.lower()
        if 'video' in content_type:
            return '.mp4'
        elif 'audio' in content_type:
            return '.mp3'
        return '.tmp'

    async def convert_to_wav(self, input_path: str, output_path: Optional[str] = None) -> str:
        """Convert media file to WAV format"""
        try:
            if output_path is None:
                output_path = os.path.join(
                    self.temp_dir,
                    f"{Path(input_path).stem}.wav"
                )

            # Run FFmpeg conversion
            stream = ffmpeg.input(input_path)
            stream = ffmpeg.output(
                stream,
                output_path,
                acodec='pcm_s16le',  # 16-bit PCM
                ac=2,                # Stereo
                ar='44100'           # 44.1kHz sample rate
            )
            
            # Run asynchronously to not block
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
            )

            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert media: {str(e)}")

    def cleanup(self, *file_paths: str):
        """Clean up temporary files"""
        for path in file_paths:
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except Exception as e:
                print(f"Error cleaning up {path}: {str(e)}")

        try:
            if os.path.exists(self.temp_dir):
                os.rmdir(self.temp_dir)
        except Exception as e:
            print(f"Error cleaning up temp directory: {str(e)}")
