# Схемы Multy

Эта папка безопасна для GitHub: токен Baserow в файлах заменён на `__BASEROW_TOKEN__`.

Готовые к импорту файлы с рабочим токеном лежат локально в `_private/multy-ready/` и игнорируются Git.

- `01-shared-load-progress.template.json` — загрузка прогресса Telegram и MAX.
- `02-shared-save-progress.template.json` — сохранение прогресса Telegram и MAX.
- `03-max-referral.template.json` — прежний шаблон MAX; для нового запуска приложения не использовать.
- `04-telegram-welcome.template.json` — отдельный блок приветствия для ручного использования.
- `05-telegram-referral.template.json` — основной сценарий `/start`: реферальная логика, возврат к новому пользователю и приветствие.
- `06-telegram-trend-followup.template.json` — сообщения после первого запуска колоды и предложение полной версии.

Актуальные сценарии MAX:

- `08-max-start-app-and-referral.template.json` — `/start`, приветствие, кнопка запуска всего приложения и реферальные проверки в Multy + Baserow.
- `09-max-app-followup.template.json` — последовательность сообщений после нажатия кнопки запуска MAX-приложения; отдельный webhook не нужен.

Загрузка и сохранение прогресса остаются в действующих общих сценариях `01` и `02`. Они разделяют строки по связке `user_id` + `messenger` и не требуют нового поля в Baserow.

Порядок импорта и список заполнителей: `../MAX_MULTY_SETUP.md`.

Сценарии ищут игрока по связке `user_id` + `messenger`, поэтому Telegram и MAX могут безопасно использовать одну таблицу Baserow.

Для сценариев `06` и `09` нужно числовое поле CRM с кодом `trend_followup_started`. Контакты Telegram и MAX хранятся раздельно, поэтому одна отметка не смешивает платформы. Сценарий `09` запускается по событию открытия ссылки `https://max.ru/id590417093305_bot?startapp` в MAX-боте.
