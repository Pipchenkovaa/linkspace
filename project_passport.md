# Паспорт проекта LinkSpace

| Поле              | Значение                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| Название          | LinkSpace                                                                               |
| Назначение        | Персональная библиотека полезных ссылок: коллекции, теги, избранное и поиск             |
| Основной сценарий | Сохранить ссылку в коллекцию с тегами, а потом быстро найти ее поиском или фильтрами    |
| Git repository    | https://github.com/Pipchenkovaa/linkspace                                               |
| CI                | https://github.com/Pipchenkovaa/linkspace/actions                                       |
| Server OS         | Ubuntu 24.04 LTS                                                                        |
| Hosting type      | VPS, провайдер: _заполнить_                                                             |
| Public IP         | _заполнить_                                                                             |
| Application port  | API — 8000, интерфейс — 3000; оба слушают только 127.0.0.1                              |
| Public URL        | https://_заполнить_                                                                     |
| Process manager   | systemd: `linkspace-api.service`, `linkspace-web.service`                               |
| Reverse proxy     | Nginx: `/api/` → 127.0.0.1:8000, `/` → 127.0.0.1:3000; HTTPS от Let's Encrypt (certbot) |
| Log command       | `journalctl -u linkspace-api -f`                                                        |
| Restart command   | `sudo systemctl restart linkspace-api linkspace-web`                                    |

## Локальный запуск

| Поле                   | Значение                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Команда запуска API    | `uvicorn app_final:app --env-file .env`                                 |
| Команда запуска фронта | `cd frontend && npm run dev`                                            |
| Локальные адреса       | API: http://127.0.0.1:8000, интерфейс: http://localhost:3000            |
| Команда проверки       | `curl http://127.0.0.1:8000/health`                                     |
| Переменные окружения   | `DATA_DIR`, `LOG_LEVEL`, `CORS_ORIGINS`; у фронта `NEXT_PUBLIC_API_URL` |

## Маршрут запроса

```
Браузер → DNS (домен → Public IP) → UFW (22, 80, 443)
  → Nginx :443: HTTPS, логин и пароль
      /api/ → uvicorn 127.0.0.1:8000 → FastAPI → /var/lib/linkspace/*.json
      /     → Next.js 127.0.0.1:3000
  → оба процесса запускает и перезапускает systemd на Ubuntu Server
```
