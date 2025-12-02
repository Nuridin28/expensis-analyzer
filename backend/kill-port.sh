#!/bin/bash
# Скрипт для освобождения порта 3001
echo "Останавливаю процессы на порту 3001..."
PIDS=$(lsof -ti:3001 | grep -v "^$$")
if [ -z "$PIDS" ]; then
  echo "✅ Порт 3001 уже свободен"
else
  echo "Найдены процессы: $PIDS"
  kill -9 $PIDS 2>/dev/null
  sleep 1
  if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  Не удалось освободить порт"
  else
    echo "✅ Порт 3001 освобожден"
  fi
fi
