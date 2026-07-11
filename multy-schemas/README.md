# Схемы Multy

Эта папка безопасна для GitHub: токен Baserow в файлах заменён на `__BASEROW_TOKEN__`.

Готовые к импорту файлы с рабочим токеном лежат локально в `_private/multy-ready/` и игнорируются Git.

- `01-shared-load-progress.template.json` — загрузка прогресса Telegram и MAX.
- `02-shared-save-progress.template.json` — сохранение прогресса Telegram и MAX.
- `03-max-referral.template.json` — реферальная логика MAX.

Сценарии ищут игрока по связке `user_id` + `messenger`, поэтому Telegram и MAX могут безопасно использовать одну таблицу Baserow.
