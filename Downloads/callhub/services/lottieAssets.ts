export const LOTTIE_EMOTIONS = {
  // Using reliable public Lottie URLs (Abstract/Character representations)
  NEUTRAL: "https://lottie.host/50b03086-8556-416e-aa53-1f40d82b40c1/p8XzWqCg2S.json", // Gentle breathing/idle
  HAPPY: "https://lottie.host/c650236a-0e64-4925-8610-2322441484e0/kQ7rC5Tq1j.json", // Happy hearts/vibes
  FLIRTY: "https://lottie.host/8305787f-4539-4565-8101-c255d96b4529/VqD6C1f3Xy.json", // Hearts fluttering
  SHY: "https://lottie.host/08800358-144a-423d-9622-1104e211e142/l5Z5R2y1O3.json", // Blushing effect
  ANGRY: "https://lottie.host/94095202-1155-4a59-864a-7e6755886813/l8Z5R2y1O3.json", // Storm cloud/jagged
  LOADING: "https://lottie.host/0c555562-47e5-4178-9272-7e0488f2923f/l4Z5R2y1O3.json" // Pulse
};

// Helper to get random reaction time
export const getRandomReactionTime = () => Math.floor(Math.random() * 5000) + 3000;

// Helper to get random emotion
export const getRandomEmotion = () => {
  const keys = ['HAPPY', 'FLIRTY', 'SHY', 'NEUTRAL'];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return LOTTIE_EMOTIONS[randomKey as keyof typeof LOTTIE_EMOTIONS];
};