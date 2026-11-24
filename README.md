# Портфолио Yakov

Статичный сайт (RU/EN), без сборки. Демо-проекты явно подписаны как демонстрационные.

## Бесплатная публикация (GitHub Pages)
1. На github.com создайте **публичный** репозиторий `resume`.
2. В этой папке:
   ```
   git init
   git add .
   git commit -m "portfolio"
   git branch -M main
   git remote add origin https://github.com/yashkettt/resume.git
   git push -u origin main
   ```
3. Repository → Settings → Pages → Source: `main` / root. Через 1–2 минуты сайт откроется по адресу
   **https://yashkettt.github.io/resume/** — эту ссылку вставьте в `config/profile.yaml` → `portfolio_url`.

## Реальная отправка заявок в Telegram (необязательно)
1. Cloudflare → Workers → Create → вставьте `worker/telegram-worker.js`.
2. В Settings → Variables добавьте секреты `BOT_TOKEN`, `CHAT_ID` и переменную `ALLOWED_ORIGIN=https://yashkettt.github.io`. Токен вводите только там, не в код и не в чат.
3. Адрес воркера впишите в `WORKER_URL` в `demos/landing/index.html`.
Без этого лендинг работает в демо-режиме: показывает, как заявка выглядела бы в Telegram.
