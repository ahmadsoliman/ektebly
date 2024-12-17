import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Load ffmpeg.wasm-core script
  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      'text/javascript'
    ),
  });

  return ffmpeg;
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

export const optimizeAudio = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  try {
    const ffmpeg = await loadFFmpeg();

    // Write the input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile('input', await fetchFile(file));

    // Setup progress handler
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    // Prepare FFmpeg command based on input type
    const isVideo = isVideoFile(file);
    const ffmpegCommands = [
      '-i',
      'input',
      '-ac',
      '1', // Convert to mono
      '-ar',
      '16000', // Set sample rate to 16kHz
      '-c:a',
      'flac', // Use FLAC codec
      '-compression_level',
      '8', // FLAC compression level
    ];

    if (isVideo) {
      // Add video-specific options
      ffmpegCommands.push(
        '-vn', // Remove video stream
        '-map',
        '0:a:0' // Select first audio stream
      );
    }

    ffmpegCommands.push('output.flac');

    // Run FFmpeg command
    await ffmpeg.exec(ffmpegCommands);

    // Read the output file from FFmpeg's virtual filesystem
    const data = await ffmpeg.readFile('output.flac');

    // Create a new File object from the output data
    const flacFile = new File([data], `${file.name.split('.')[0]}.flac`, {
      type: 'audio/flac',
    });

    // Clean up
    await ffmpeg.deleteFile('input');
    await ffmpeg.deleteFile('output.flac');

    return flacFile;
  } catch (error) {
    console.error('Error optimizing file:', error);
    throw new Error(
      `Failed to optimize ${isVideoFile(file) ? 'video' : 'audio'} file: ${
        error.message
      }`
    );
  }
};
