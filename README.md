# Yakov's Portfolio

A static website (RU/EN) with no build step. Demo projects are clearly labeled as demonstrations.

## Free hosting with GitHub Pages

1. Create a **public** repository named `resume` on github.com.
2. In this folder, run:
   ```
   git init
   git add .
   git commit -m "portfolio"
   git branch -M main
   git remote add origin https://github.com/grachoffprod/resume.git
   git push -u origin main
   ```
3. Go to Repository → Settings → Pages and set Source to `main` / root. The site should be available in 1–2 minutes at
   **https://grachoffprod.github.io/resume/**. Add this URL to `config/profile.yaml` as `portfolio_url`.

## Sending real leads to Telegram (optional)

1. In Cloudflare, go to Workers → Create and paste in `worker/telegram-worker.js`.
2. Under Settings → Variables, add the secrets `BOT_TOKEN` and `CHAT_ID`, and set `ALLOWED_ORIGIN=https://grachoffprod.github.io`. Enter the token only there, never in the code or chat.
3. Set the worker URL in `WORKER_URL` in `demos/landing/index.html`.

Without this setup, the landing page runs in demo mode and shows what a Telegram lead notification would look like.
