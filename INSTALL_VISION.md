# Установка поддержки Vision для PDF с изображениями

## Проблема
PDF от банков часто содержат сканированные изображения вместо текста. Для их обработки нужно конвертировать PDF в изображения и использовать Vision API.

## Решение
Добавлена поддержка конвертации PDF в изображения и отправки в Deepseek Vision API.

## Установка зависимостей

### Обязательные:
```bash
cd backend
npm install pdfjs-dist
```

### Опциональные (для конвертации PDF в изображения):
```bash
npm install canvas
```

**Внимание:** `canvas` требует системные зависимости:

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**Windows:**
Следуйте инструкциям: https://github.com/Automattic/node-canvas#compiling

## Альтернатива без canvas

Если установка canvas проблематична, можно использовать внешний сервис для конвертации PDF или упростить решение.

## Как работает

1. PDF загружается на сервер
2. Пытается извлечь текст
3. Если текста нет - конвертирует страницы в изображения
4. Отправляет изображения в Deepseek Vision API
5. LLM анализирует изображения и извлекает транзакции
6. Возвращает структурированные данные

## Тестирование

После установки зависимостей перезапустите backend:
```bash
npm run dev
```

Загрузите PDF с банковской выпиской через интерфейс.
