export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 10);

  return `${minutes}:${remainingSeconds.toString()}.${milliseconds.toString()}s`;
};
