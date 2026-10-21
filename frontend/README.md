# LinkSpace: фронтенд

Интерфейс LinkSpace на Next.js и TypeScript. Общий запуск проекта и документация backend описаны в [README в корне репозитория](../README.md).

## Запуск

P.S. Сначала необходимо запустить backend, а потом уже frontend.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Интерфейс будет доступен на `http://localhost:3000`.

## Конфигурация

Frontend обращается к FastAPI через адрес из `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

После изменения `.env.local` dev-сервер нужно перезапустить. Если frontend работает на другом адресе или порту, этот origin нужно добавить в `CORS_ORIGINS` backend.

## Структура

```text
frontend/
├── app/
├── components/
└── lib/
    ├── api.ts
    └── useLibrary.ts
```

`lib/api.ts` — API layer: запросы к backend и обработка ответов и ошибок.

`lib/useLibrary.ts` отвечает за клиентское состояние библиотеки: загрузку данных, фильтры, поиск и действия с коллекциями и ссылками.

`components/` содержит UI библиотеки: шапку, коллекции, фильтры, карточки ссылок, формы и диалоговые окна.

## Связь с backend

Frontend работает с REST API LinkSpace. Основные ресурсы:

- `/collections` — коллекции;
- `/links` — ссылки, поиск и фильтры;
- `/tags` — теги;
- `/stats` — статистика библиотеки;
- `/health` — состояние API.

Раз в 30 секунд интерфейс проверяет `GET /health`. Если API недоступен, в интерфейсе отображается ошибка; после восстановления соединения библиотека загружается снова.

## Проверка

```bash
npm run lint
npm run build
```

Эти же проверки выполняются в GitHub Actions при `push` и `pull request`.

Дизайн-прототип: [docs/design/linkspace-prototype.html](../docs/design/linkspace-prototype.html).
