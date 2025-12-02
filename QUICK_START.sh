#!/bin/bash
echo "🚀 Быстрый запуск Анализатора банковских выписок"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js сначала."
    exit 1
fi

echo "✅ Node.js версия: $(node --version)"

# Установка зависимостей backend
echo ""
echo "📦 Установка зависимостей backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Зависимости backend уже установлены"
fi

# Проверка .env
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден в backend/"
    exit 1
fi
echo "✅ Файл .env найден"

# Установка зависимостей frontend
echo ""
echo "📦 Установка зависимостей frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Зависимости frontend уже установлены"
fi

# Проверка конфигурационных файлов
if [ ! -f "tailwind.config.js" ]; then
    echo "❌ tailwind.config.js не найден!"
    exit 1
fi
echo "✅ Конфигурационные файлы на месте"

echo ""
echo "✅ Все готово!"
echo ""
echo "Запустите в двух терминалах:"
echo "Терминал 1: cd backend && npm run dev"
echo "Терминал 2: cd frontend && npm run dev"
echo ""
echo "Затем откройте http://localhost:3000"
