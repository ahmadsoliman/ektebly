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

export const convertToWav = async (
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

    // Run FFmpeg command to convert to WAV
    // -i input: specify input file
    // -c:a pcm_s16le: use 16-bit PCM audio codec
    // -ar 44100: set sample rate to 44.1kHz
    // -ac 2: set to stereo (2 channels)
    await ffmpeg.exec([
      '-i', 'input',
      '-c:a', 'pcm_s16le',
      '-ar', '44100',
      '-ac', '2',
      'output.wav'
    ]);

    // Read the output file from FFmpeg's virtual filesystem
    const data = await ffmpeg.readFile('output.wav');
    
    // Create a new File object from the output data
    const wavFile = new File(
      [data],
      `${file.name.split('.')[0]}.wav`,
      { type: 'audio/wav' }
    );

    // Clean up
    await ffmpeg.deleteFile('input');
    await ffmpeg.deleteFile('output.wav');

    return wavFile;
  } catch (error) {
    console.error('Error converting file:', error);
    throw new Error('Failed to convert file to WAV format');
  }
};
