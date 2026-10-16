# LinkSpace

[![CI](https://github.com/Pipchenkovaa/linkspace/actions/workflows/ci.yml/badge.svg)](https://github.com/Pipchenkovaa/linkspace/actions/workflows/ci.yml)

Персональная библиотека полезных ссылок на FastAPI и Next.js: коллекции, теги,
избранное, поиск с фильтрами и защита от дубликатов. Создано для тех, кто
постоянно сохраняет полезное из интернета и хочет держать все в одной библиотеке
и находить нужную ссылку за секунды, а не в десятках открытых вкладок браузера.

Сервис изначально рассчитан на одного пользователя и работает без авторизации.

![Главный экран LinkSpace](docs/screenshot.png)

Все правила и решения более подробно описаны в [docs/mvp.md](docs/mvp.md).

## Установка

```bash
git clone https://github.com/Pipchenkovaa/linkspace.git
cd linkspace
python3 -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
cp .env.example .env
```

## Запуск

```bash
uvicorn app_final:app --env-file .env
```

Сервис: http://127.0.0.1:8000, документация API со всеми маршрутами:
http://127.0.0.1:8000/docs.

При первом запуске создается папка `data/` с файлами `collections.json` и
`links.json`.

## Переменные окружения

| Переменная     | Назначение                                         | По умолчанию                                  |
| -------------- | -------------------------------------------------- | --------------------------------------------- |
| `DATA_DIR`     | папка с файлами данных                             | `data`                                        |
| `LOG_LEVEL`    | уровень логов: `DEBUG`, `INFO`, `WARNING`, `ERROR` | `INFO`                                        |
| `CORS_ORIGINS` | адреса фронта, которым разрешено обращаться к API  | `http://localhost:3000,http://127.0.0.1:3000` |

В репозитории только образец `.env.example`. Настоящий `.env` и папка `data/` в
Git не попадают.

## Фронтенд

Интерфейс на Next.js лежит в папке `frontend/` и обращается к API прямо из
браузера. Нужен Node.js 20.9 или новее, бэкенд должен быть запущен.

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Интерфейс: http://localhost:3000.

| Переменная            | Назначение | По умолчанию            |
| --------------------- | ---------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | адрес API  | `http://127.0.0.1:8000` |

Адрес подставляется в код при запуске `npm run dev` или `npm run build`, поэтому
после его изменения фронт нужно перезапустить. Если фронт открыт на другом
адресе или порту, этот адрес нужно добавить в `CORS_ORIGINS` бэкенда.

Проверка кода и сборка для продакшена:

```bash
npm run lint
npm run build
npm start
```

Раз в 30 секунд фронт проверяет `GET /health`: статус API виден в шапке, а когда
сервер снова отвечает, библиотека загружается сама. Дизайн-прототип интерфейса:
[docs/design/linkspace-prototype.html](docs/design/linkspace-prototype.html).

## Проверка и логи

```bash
curl http://127.0.0.1:8000/health # {"status":"ok"}
curl http://127.0.0.1:8000/version # {"version":"1.0.0"}
```

Логи выводятся в терминал, где запущен сервер; строки приложения помечены
`linkspace`:

```
INFO linkspace: Application started: version=1.0.0, data_dir=data
INFO linkspace: Link created: id=2, collection_id=2
WARNING linkspace: Duplicate link: existing_id=2
```

Сохранить логи в файл:
`uvicorn app_final:app --env-file .env 2>&1 | tee linkspace.log`.

## Тесты и CI

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -v
```

Тесты работают с временной папкой и не трогают `data/`. При каждом `push` и
`pull request` GitHub Actions запускает их и сохраняет файлы приложения как
артефакт `linkspace-app` (вкладка
[Actions](https://github.com/Pipchenkovaa/linkspace/actions)).

## Диагностика

| Признак                                                   | Действия                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `address already in use`                                  | порт 8000 занят: остановить старый сервер (`lsof -i :8000`, затем `kill <PID>`) или запустить с `--port 8001` |
| `command not found: uvicorn`, `No module named 'fastapi'` | активировать окружение `source .venv/bin/activate` и установить зависимости                                   |
| `externally-managed-environment` при `pip install`        | `pip` запущен вне `.venv`: активировать окружение                                                             |
| `Connection refused`                                      | сервер не запущен или работает на другом порту                                                                |
| Ответ `422`                                               | тело запроса не прошло проверку: причина в поле `detail` ответа                                               |
| Пропали данные                                            | сверить `data_dir` в строке `Application started` с `DATA_DIR`                                                |
| В интерфейсе «Эх, сервер не отвечает...»                  | проверить `curl http://127.0.0.1:8000/health` и адрес в `NEXT_PUBLIC_API_URL`                                 |
| То же при работающем API, в консоли браузера ошибка CORS  | адрес фронта не входит в `CORS_ORIGINS`, например фронт запустился на порту 3001                              |
| Новый адрес из `.env.local` не применился                 | перезапустить `npm run dev`                                                                                   |

## Основа и доработки

За основу взят учебный пример `app_final.py`.

**Доработки**: собственная тема, 12 новых маршрутов с собственной логикой
(дубликаты, нормализация ссылок и тегов, удаление коллекций с переносом ссылок),
поиск и комбинируемые фильтры, хранение в JSON, логи, автотесты, CI и интерфейс
на Next.js.
