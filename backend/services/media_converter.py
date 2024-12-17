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
                content_type = response.headers.get("content-type", "")
                ext = self._get_extension_from_content_type(content_type)

                temp_path = Path(self.temp_dir) / f"download{ext}"
                with open(temp_path, "wb") as f:
                    f.write(response.content)

                return str(temp_path)
        except Exception as e:
            raise Exception(f"Failed to download file: {str(e)}")

    def _get_extension_from_content_type(self, content_type: str) -> str:
        """Get file extension from content type"""
        content_type = content_type.lower()
        if "video" in content_type:
            return ".mp4"
        elif "audio" in content_type:
            return ".flac"
        return ".tmp"

    def _is_video_file(self, file_path: str) -> bool:
        """Check if the file is a video file using ffprobe"""
        try:
            probe = ffmpeg.probe(file_path)
            return any(stream["codec_type"] == "video" for stream in probe["streams"])
        except Exception:
            return False

    async def optimize_audio(
        self, input_path: str, output_path: Optional[str] = None
    ) -> str:
        """Convert and optimize media file for transcription"""
        try:
            if output_path is None:
                output_path = os.path.join(
                    self.temp_dir, f"{Path(input_path).stem}_optimized.flac"
                )

            # Base FFmpeg options
            output_options = {
                "acodec": "flac",  # FLAC codec
                "ac": 1,  # Mono
                "ar": 16000,  # 16kHz sample rate
                "compression_level": 8,  # FLAC compression level (0-12)
                "loglevel": "error",  # Reduce logging
            }

            # Add video-specific options if input is video
            if self._is_video_file(input_path):
                output_options.update(
                    {
                        "vn": None,  # Remove video stream
                        "map": "0:a:0",  # Select first audio stream
                    }
                )

            # Create stream with input
            stream = ffmpeg.input(input_path)

            # Apply output options
            stream = ffmpeg.output(stream, output_path, **output_options)

            # Run asynchronously
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: ffmpeg.run(
                    stream,
                    overwrite_output=True,
                    capture_stdout=True,
                    capture_stderr=True,
                ),
            )

            # Verify the output file exists and has content
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception("Failed to create output file or file is empty")

            return output_path
        except Exception as e:
            raise Exception(f"Failed to optimize media: {str(e)}")

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

    def get_audio_info(self, file_path: str) -> dict:
        """Get audio file information"""
        try:
            probe = ffmpeg.probe(file_path)

            # Find the audio stream
            audio_stream = next(
                (
                    stream
                    for stream in probe["streams"]
                    if stream["codec_type"] == "audio"
                ),
                None,
            )

            if not audio_stream:
                raise Exception("No audio stream found in the file")

            format_info = probe.get("format", {})

            return {
                "channels": int(audio_stream.get("channels", 0)),
                "sample_rate": int(audio_stream.get("sample_rate", 0)),
                "codec_name": audio_stream.get("codec_name", ""),
                "bit_rate": (
                    int(audio_stream.get("bit_rate", 0))
                    if "bit_rate" in audio_stream
                    else None
                ),
                "duration": float(format_info.get("duration", 0)),
                "size": int(format_info.get("size", 0)),
                "is_video": self._is_video_file(file_path),
            }
        except Exception as e:
            raise Exception(f"Failed to get audio info: {str(e)}")
