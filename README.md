# Think Out Loud landing

The React landing page for [Think Out Loud](https://github.com/federicopoi/thinkoutloud), a Mac app for local dictation. The native app lives in its own public repository.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev -- --port 5174
```

The page includes the MacBook and Notes demonstration, scroll animations, the product film, and an app download. Desktop pins the Mac zoom; mobile uses a gentle forward zoom in normal page flow, with no extra spacer. The GitHub button opens the native app’s source repository in a new tab.

## Deploy

`.github/workflows/pages.yml` builds and deploys `main` through GitHub Actions. Enable GitHub Pages with **GitHub Actions** as the source. Pages must be available for the repository’s visibility and your account plan.

The project URL is `https://federicopoi.github.io/thinkoutloud_landing/`. Asset URLs use Vite’s base path so images, video, and downloads work under that folder.

```sh
VITE_BASE_PATH=/thinkoutloud_landing/ npm run build
VITE_BASE_PATH=/thinkoutloud_landing/ npm run preview -- --port 4174
```

The workflow excludes raw audio files from the deployed site. The music remains part of the finished film.

## Checks

With the local development server running on port 5174:

```sh
npm run verify:responsive
npm run verify:hero
npm run verify:film
npm run video:test
```

Browser checks use Playwright. Install its browsers with `npx playwright install chromium webkit` if needed. Screenshots and reports are saved in the ignored `artifacts/` folder.

## Film and assets

The 18-second film is authored with Remotion in `video/Film.jsx`. Use `npm run video:studio` to preview it or `npm run video:render` to export a new MP4.

To re-render with music, place your licensed audio excerpt at `public/audio/soft-minimal-film.wav`. Raw soundtrack files are kept out of this repository; the exported film is included.

The film uses **Soft Minimal by PaulYudin**, downloaded from [Pixabay](https://pixabay.com/music/deep-house-soft-minimal-113441/). Its license certificate is in `video/licenses/soft-minimal-pixabay-license.txt`. This is licensed stock music, not public-domain audio; keep the certificate for possible Content ID claims.

The MacBook and wallpaper images were generated for this project. The download contains a locally signed Apple Silicon app, without Apple notarization. Updating that ZIP requires a fresh build from the native app repository.
