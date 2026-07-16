# Схемы Multy

Эта папка безопасна для GitHub: токен Baserow в файлах заменён на `__BASEROW_TOKEN__`.

Готовые к импорту файлы с рабочим токеном лежат локально в `_private/multy-ready/` и игнорируются Git.

- `01-shared-load-progress.template.json` — загрузка прогресса Telegram и MAX.
- `02-shared-save-progress.template.json` — сохранение прогресса Telegram и MAX.
- `03-max-referral.template.json` — реферальная логика MAX.
- `04-telegram-welcome.template.json` — отдельный блок приветствия для ручного использования.
- `05-telegram-referral.template.json` — основной сценарий `/start`: реферальная логика, возврат к новому пользователю и приветствие.
- `06-telegram-trend-followup.template.json` — сообщения после первого запуска колоды и предложение полной версии.

Сценарии ищут игрока по связке `user_id` + `messenger`, поэтому Telegram и MAX могут безопасно использовать одну таблицу Baserow.

Перед импортом `06` создайте в CRM Multy числовое поле с кодом `trend_followup_started`. После импорта выберите интеграцию Telegram-бота в первом зелёном блоке и назначьте сценарию отдельный входящий вебхук. Приложение отправляет в него `item: trend_deck_started_telegram` и `user_id` пользователя Telegram. Сценарий переключается в чат этого пользователя, проверяет отметку однократного запуска, а кнопки в сообщениях открывают приложение с `platform=telegram`.
