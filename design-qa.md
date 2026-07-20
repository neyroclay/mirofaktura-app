# Design QA — карточки авторов

- Source visual truth path: `C:\Users\evikd\AppData\Local\Temp\codex-clipboard-6010bdfa-f75c-4684-b13d-b59e451d52e3.png`
- Implementation screenshot path: `C:\Users\evikd\AppData\Local\Temp\mirofaktura-author-cards-qa\authors-phone.png`
- Combined comparison path: `C:\Users\evikd\AppData\Local\Temp\mirofaktura-author-cards-qa\comparison.png`
- Viewport: 390 × 844 px; additional responsive check at 768 × 1024 px.
- State: Telegram entry, «Услуги», блок «Авторы Мирофактуры».

## Full-view comparison evidence

В исходном варианте бирюзовая и жёлтая полосы выглядели отдельными техническими маркерами и обрывались у скруглений. В реализации цвет перенесён на тонкий контур всей карточки. Иерархия, ширина карточек, скругления, тексты, фотография и нижнее меню сохранены.

## Focused region comparison evidence

Отдельный кроп не понадобился: в совмещённом сравнении рамки, заголовки, основной текст и кнопки читаются в исходном масштабе. Проверены обе карточки и оба цветовых варианта.

## Findings

- P0/P1/P2: нет.
- Fonts and typography: семейства, размеры, насыщенность, межстрочные интервалы и переносы не изменены.
- Spacing and layout rhythm: отступы, ширина, высота, радиусы и расстояние между карточками не изменены; горизонтального переполнения нет.
- Colors and visual tokens: сохранены фирменные бирюзовый и жёлтый; акцент стал менее резким и охватывает карточку целиком.
- Image quality and asset fidelity: фотография авторов и остальные изображения не изменены.
- Copy and content: тексты и подписи не изменены.

## Comparison history

- Pass 1: исходные вертикальные полосы заменены цветными контурами карточек. Повторная проверка при 390 × 844 и 768 × 1024 не выявила P0/P1/P2-расхождений. Ошибок в консоли и горизонтального переполнения нет.

## Implementation checklist

- [x] Убрать вертикальные полосы.
- [x] Сохранить разные цветовые акценты авторов.
- [x] Не менять размеры, тексты и расположение элементов.
- [x] Проверить телефон и планшет.
- [x] Прогнать общий smoke-тест Telegram и MAX.

final result: passed
