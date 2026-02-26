# 5-Second Video Transformer

Mobile-first web app that lets a user record a 5-second video and transform it with three stylized templates: **Aesthetic Celebrity**, **Travel Vlog**, and **Artistic Touch**.

Built with **React** and **Vite**, optimized for phones but responsive to larger screens.

## Features

- **Landing page**
  - Confluence Award logo area at the top.
  - Title: `Capture and transform your amazing 5 sec`.
  - Live camera view (with permission request).
  - Rounded **Record 5 Seconds** button.

- **Recording page**
  - Uses the same camera view.
  - 5-second **countdown badge** in the top-right corner.
  - **Recording** indicator chip in the top-left.
  - Automatically stops after 5 seconds.

- **Preview page**
  - Shows a preview of the recorded clip in the main view area.
  - **Transform it!** primary button.
  - **Retake** icon button.

- **Template select page**
  - Three transform cards:
    - `Aesthetic Celebrity`
    - `Travel Vlog`
    - `Artistic Touch`
  - Each card has a short description and is tap-friendly on mobile.

- **Transform result page**
  - Plays back the recorded video with a style-specific filter.
  - Quick **scan-line animation** over the video to simulate processing.
  - Shows the selected style name.
  - **Regenerate** button (replays the scan animation).
  - **Capture another** button (returns to camera capture flow).

## Tech stack

- React 18
- Vite 5

No backend is required; everything runs in the browser.

## Getting started

From the project root (`/mova/video transformer`):

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`) in a **modern browser** (Chrome, Edge, Safari, or mobile browser).

> **Note**: Camera access only works over `https` or `http://localhost` on most browsers. If you deploy this, serve it over HTTPS.

## Placing the Confluence Award logo

1. Copy your logo image (for example the provided `Press-Release-Images-4-038dbb5b-3e67-4cd1-a0e0-f60f3e53a56a.png`) into the project `public` folder.
2. Rename it to something simple, such as:
   - `public/confluence-award-logo.png`
3. The app already references this path here:
   - `src/App.jsx` → `<img src="/confluence-award-logo.png" ... />`

You can change the filename and path if you prefer; just update the `src` attribute in `App.jsx`.

## Where to change behavior

- **Flow & logic**: `src/App.jsx`
  - Manages app state (landing, recording, preview, templates, result).
  - Handles `MediaRecorder`, countdown timer, and template selection.
  - Controls the scan line animation and style filters per template.

- **Styling**: `src/styles.css`
  - Mobile-first layout.
  - Visual design of the camera view, buttons, template cards, and scan line.
  - Responsive tweaks for larger screens.

## Notes

- The "transformations" are visual style filters applied on playback, not AI/video re-rendering. You can plug in a real transformation backend later and feed the resulting video URL into the same result view.
- If you see camera permission errors, verify:
  - You are on `http://localhost` or an `https` origin.
  - The browser has permission to use your camera and microphone.

