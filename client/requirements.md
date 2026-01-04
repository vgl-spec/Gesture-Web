## Packages
framer-motion | Smooth UI transitions and animations
react-webcam | Easy webcam integration for React
clsx | Utility for constructing className strings
tailwind-merge | Utility for merging Tailwind classes

## Notes
- MediaPipe Hands and Three.js will be loaded from CDNs as requested to ensure latest versions and performance without heavy bundling.
- The app uses a Canvas overlay for high-performance rendering of the hand skeleton and particle effects.
- Gesture samples are persisted to the backend via the /api/gestures endpoint.
