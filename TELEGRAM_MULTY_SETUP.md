# Telegram Mini App и Multy

## Ссылка приложения

Для Telegram используйте отдельный адрес:

`https://neyroclay.github.io/mirofaktura-app/telegram.html`

Страница подключает официальный Telegram Mini Apps SDK, сообщает приложению платформу `telegram` и передаёт в колоду ID и имя пользователя.

## Настройка Telegram

1. Откройте `@BotFather`.
2. Выберите бота `@mirofactura_bot`.
3. Откройте настройки Mini App / Main Mini App.
4. Укажите адрес `https://neyroclay.github.io/mirofaktura-app/telegram.html`.
5. В Multy добавьте кнопку, которая открывает это Mini App.

Материалы в приложении открыты. Проверка подписки для доступа к кладовой не нужна.

## Что хранить в Baserow

В таблице прогресса колоды должны быть поля:

- `profile_key` — текст, уникальный ключ пользователя;
- `user_id` — текст;
- `platform` — текст (`telegram` или `max`);
- `first_name` — текст;
- `last_name` — текст;
- `first_launch_time` — текст;
- `last_date` — текст;
- `collected_cards` — длинный текст;
- `onboarding_seen` — логическое поле;
- `bonus_cards` — число;
- `invited_friends` — число.

`profile_key` формируется в приложении как `telegram:123456789` или `max:123456789`. Искать запись нужно по нему, а не только по `user_id`: одинаковые числовые ID в разных мессенджерах не должны попадать в одну строку.

## Сценарий загрузки в Multy

Входящий JSON:

```json
{
  "item": "trend_deck_load",
  "user_id": "123456789",
  "profile_key": "telegram:123456789",
  "platform": "telegram",
  "messenger": "Telegram",
  "source": "mirofaktura-app"
}
```

1. Найдите строку Baserow, где `profile_key` равен `request.json.profile_key`.
2. Если строка найдена, верните:

```json
{
  "exists": true,
  "first_launch_time": "...",
  "last_date": "...",
  "collected": "[]",
  "onboarding_seen": true,
  "bonus_cards": 0,
  "invited_friends": 0
}
```

3. Если строки нет, верните `{ "exists": false }`.

## Сценарий сохранения в Multy

Входящий JSON дополнительно содержит:

```json
{
  "item": "trend_deck_save",
  "profile_key": "telegram:123456789",
  "onboarding_seen": true,
  "collected_cards": "[]"
}
```

1. Найдите строку по `profile_key`.
2. Если запись есть, обновите её.
3. Если записи нет, создайте её и обязательно запишите `profile_key`, `user_id` и `platform`.
4. Сохраните `onboarding_seen` как логическое значение.

После нажатия кнопки на вступительном экране приложение сохраняет `onboarding_seen: true`. При следующем открытии раздела «Тренды» Multy возвращает это значение, и колода открывается без вступления.

## Важно про безопасность

Адреса входящих вебхуков видны в коде браузера. Поэтому сценарии должны принимать только ожидаемые поля, ограничивать размер строк и не выполнять произвольные запросы по данным пользователя.

ID из Mini App подходит для сохранения обычного прогресса, но не является достаточной защитой для платного доступа, денежных бонусов или ценных призов. Для таких действий нужно проверять подпись Telegram `initData` на сервере.

Токен Baserow должен находиться только внутри Multy. Его нельзя добавлять в HTML, JavaScript, GitHub или этот файл.
