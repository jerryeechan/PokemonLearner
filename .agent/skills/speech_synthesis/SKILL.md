---
name: Web Speech API (Text-to-Speech)
description: Guidelines and code snippets for implementing text-to-speech using the native browser SpeechSynthesis API in React/TypeScript.
---

# Web Speech API (Speech Synthesis) in React

The Web Speech API provides a native `SpeechSynthesis` interface to convert text to speech without external libraries.

## Implementation Guide

1. **Create an Utterance**: Instantiate a `SpeechSynthesisUtterance` with the text you want to play.
2. **Set Language**: Set the `lang` property. E.g., `ja-JP` for Japanese, `en-US` for US English, `zh-TW` for Traditional Chinese.
3. **Cancel Previous Audio** (Optional but recommended): Call `window.speechSynthesis.cancel()` before playing a new audio to clear any queued messages and immediately play the new one.
4. **Speak**: Trigger the voice with `window.speechSynthesis.speak(utterance)`.

## Example Usage (TypeScript/React)

```tsx
const playAudio = (text: string) => {
  // 1. Cancel any ongoing speech to prevent overlapping or laggy queues
  window.speechSynthesis.cancel();
  
  // 2. Create the utterance object containing the text
  const utterance = new SpeechSynthesisUtterance(text);
  
  // 3. Set properties (useful for enforcing a specific language pronunciation)
  utterance.lang = 'ja-JP'; // Japanese language code
  
  // Optional tuning:
  // utterance.rate = 1.0; // Speed of speech (0.1 to 10)
  // utterance.pitch = 1.0; // Pitch of speech (0 to 2)

  // 4. Play the audio
  window.speechSynthesis.speak(utterance);
};
```

## Best Practices
- **Event Stop Propagation (React)**: If attaching the audio play function to a nested `<button>` or clickable element, remember to use `e.stopPropagation()` so you don't inadvertently trigger parent `onClick` events.
- **Valid Language Codes**: Make sure to use proper BCP 47 language tags (e.g. `ja-JP` instead of just `ja` for better compatibility, `zh-TW` or `zh-CN`).
- **Browser Support**: Almost all modern browsers support this API natively, but the availability of specific voices/languages depends on the user's operating system.
