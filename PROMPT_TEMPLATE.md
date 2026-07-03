# Шаблон промта для генерации новых предметов в игре

При генерации иконок для новых элементов ВСЕГДА используй этот шаблон, подставляя нужное описание вместо `[ОПИСАНИЕ]`.

**Обязательные атрибуты стиля:**
1. **3D иконка** (3d icon)
2. **Толстый пластилиновый стиль** (chunky clay style, very simple and minimalist)
3. **Чисто белый фон** (isolated on a pure solid white background, no shadows on background)
4. **Отсутствие мелких деталей** (bold shape, no small details)

## Шаблон на английском:
> "3d icon of a [ОПИСАНИЕ: например, single large ruby gemstone, bright vibrant deep red color], very simple and minimalist, chunky clay style, isolated on a pure solid white background, no shadows on background, bright clean lighting, bold shape, no small details"

## Зачем это нужно:
- **Белый фон**: Наш скрипт `process_icons_improved.cjs` легко и идеально ровно вырезает белый фон.
- **Пластилиновый стиль**: Иконки должны гармонировать с базовыми эмодзи в игре (по стандарту `fluent-emoji`, которые выглядят как 3D-пластилин).
- **Крупная форма**: Иконки сжимаются до размера `48x48` пикселей, поэтому мелкие детали превратятся в кашу. Форма должна быть максимально читаемой и объемной.
