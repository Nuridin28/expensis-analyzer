# Инструкция по запуску

## Проблема: Стили не работают или загрузка файла не работает

### Решение:

1. **Установите зависимости** (если еще не установлены):
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Убедитесь, что все конфигурационные файлы на месте:**
- `frontend/tailwind.config.js` ✅
- `frontend/postcss.config.js` ✅
- `frontend/vite.config.js` ✅
- `backend/.env` ✅

3. **Запустите серверы в правильном порядке:**

**Терминал 1 - Backend (обязательно сначала!):**
```bash
cd backend
npm run dev
```
Дождитесь сообщения "Server is running on http://localhost:3001"

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

4. **Откройте браузер:** http://localhost:3000

5. **Если стили все еще не работают:**
- Остановите frontend (Ctrl+C)
- Удалите кэш: `rm -rf frontend/node_modules/.vite`
- Запустите снова: `npm run dev`

6. **Для тестирования загрузки файла:**
- Используйте файл `example-statement.json` из корня проекта
- Или нажмите кнопку "Загрузить пример"
- Или вставьте JSON вручную в текстовое поле
