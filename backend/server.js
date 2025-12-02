import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка multer для загрузки файлов
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Функция для вызова Deepseek API
async function callDeepseekAPI(messages, temperature = 0.7, useVision = false) {
  try {
    const model = useVision ? 'deepseek-chat' : 'deepseek-chat';
    
    const response = await fetch(process.env.DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Deepseek API error:', error);
    throw error;
  }
}

// Функция для извлечения текста из изображений с помощью OCR
async function extractTextFromImages(images) {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('rus+eng'); // Русский и английский языки
    
    let fullText = '';
    
    for (let i = 0; i < Math.min(images.length, 3); i++) {
      const image = images[i];
      // Убираем data: префикс для получения чистого base64
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      
      console.log(`Обработка изображения ${i + 1}/${Math.min(images.length, 3)} с помощью OCR...`);
      
      const { data: { text } } = await worker.recognize(Buffer.from(base64Data, 'base64'));
      fullText += text + '\n\n';
      
      console.log(`Извлечено ${text.length} символов из изображения ${i + 1}`);
    }
    
    await worker.terminate();
    return fullText.trim();
  } catch (error) {
    console.error('Ошибка OCR:', error);
    throw new Error('Не удалось извлечь текст из изображений с помощью OCR. Убедитесь, что tesseract.js установлен: npm install tesseract.js');
  }
}

// Функция для конвертации PDF страниц в изображения
async function convertPDFToImages(pdfBuffer) {
  try {
    let pdfjsLib;
    let createCanvas;
    
    // Импортируем pdfjs-dist (используем legacy build для Node.js)
    try {
      const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjsLib = pdfjsModule.default || pdfjsModule;
    } catch (importError) {
      // Fallback на обычный импорт
      try {
        const pdfjsModule = await import('pdfjs-dist');
        pdfjsLib = pdfjsModule.default || pdfjsModule;
      } catch (fallbackError) {
        throw new Error('pdfjs-dist не установлен. Запустите: npm install pdfjs-dist');
      }
    }
    
    // Импортируем canvas (опциональная зависимость)
    try {
      const canvasModule = await import('canvas');
      createCanvas = canvasModule.createCanvas || canvasModule.default?.createCanvas;
    } catch (importError) {
      throw new Error('canvas не установлен. Запустите: npm install canvas. Требуются системные зависимости (см. https://github.com/Automattic/node-canvas)');
    }
    
    if (!createCanvas) {
      throw new Error('Canvas не доступен');
    }
    
    // Настройка worker для pdfjs (опционально)
    if (pdfjsLib.GlobalWorkerOptions) {
      try {
        // Используем legacy worker для Node.js
        const workerPath = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      } catch (workerError) {
        console.warn('Не удалось настроить worker, продолжаем без него');
      }
    }
    
    // Загружаем PDF
    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    console.log(`PDF содержит ${numPages} страниц, конвертируем в изображения...`);
    
    const images = [];
    const maxPages = Math.min(numPages, 3); // Обрабатываем максимум 3 страницы
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Конвертируем canvas в base64 PNG
        let imageBase64;
        let imageBuffer;
        
        if (typeof canvas.toBuffer === 'function') {
          imageBuffer = canvas.toBuffer('image/png');
          imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        } else if (typeof canvas.toDataURL === 'function') {
          imageBase64 = canvas.toDataURL('image/png');
          // Извлекаем base64 из data URL для расчета размера
          const base64Data = imageBase64.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          throw new Error('Не удалось конвертировать canvas в изображение');
        }
        
        images.push(imageBase64);
        
        const sizeKB = imageBuffer ? Math.round(imageBuffer.length / 1024) : 0;
        console.log(`Страница ${pageNum}/${maxPages} конвертирована (${sizeKB}KB)`);
      } catch (pageError) {
        console.error(`Ошибка при конвертации страницы ${pageNum}:`, pageError.message);
        // Продолжаем со следующей страницей
      }
    }
    
    if (images.length === 0) {
      throw new Error('Не удалось конвертировать ни одной страницы PDF в изображение');
    }
    
    return images;
  } catch (error) {
    console.error('Ошибка конвертации PDF в изображения:', error);
    throw error;
  }
}

// Парсинг выписки
function parseStatement(statementData) {
  if (Array.isArray(statementData)) {
    return statementData;
  }
  
  if (typeof statementData === 'string') {
    try {
      return JSON.parse(statementData);
    } catch (e) {
      // Если это CSV или другой формат, попробуем распарсить
      const lines = statementData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
    }
  }
  
  return [];
}

// Эндпоинт для анализа выписки
app.post('/api/analyze', async (req, res) => {
  try {
    const { statement } = req.body;
    
    if (!statement || !Array.isArray(statement) || statement.length === 0) {
      return res.status(400).json({ error: 'Выписка должна быть массивом транзакций' });
    }

    // Проверяем наличие обязательных полей
    const requiredFields = ['дата', 'сумма', 'операция', 'детали'];
    const sample = statement[0];
    const hasRequiredFields = requiredFields.every(field => 
      sample.hasOwnProperty(field) || 
      sample.hasOwnProperty(field.toLowerCase()) ||
      Object.keys(sample).some(key => key.toLowerCase().includes(field))
    );

    if (!hasRequiredFields) {
      return res.status(400).json({ 
        error: 'Выписка должна содержать поля: дата, сумма, операция, детали' 
      });
    }

    const statementText = JSON.stringify(statement, null, 2);

    // 1. Классификация трат
    const classificationPrompt = `Ты финансовый аналитик. Проанализируй следующие банковские транзакции и классифицируй каждую трату по категориям.

Выписка:
${statementText}

Верни ответ в формате JSON массив объектов с полями:
- transactionIndex: индекс транзакции
- category: категория траты (например: Продукты, Транспорт, Развлечения, Здоровье, Образование, Коммунальные услуги, Рестораны, Покупки, Подписки, Прочее)
- subcategory: подкатегория
- confidence: уверенность от 0 до 1

Пример ответа:
[
  {"transactionIndex": 0, "category": "Продукты", "subcategory": "Супермаркет", "confidence": 0.95},
  {"transactionIndex": 1, "category": "Транспорт", "subcategory": "Такси", "confidence": 0.9}
]`;

    const classification = await callDeepseekAPI([
      { role: 'user', content: classificationPrompt }
    ], 0.3);

    let classifications = [];
    try {
      const jsonMatch = classification.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        classifications = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing classification:', e);
    }

    // 2. Анализ подписок
    const subscriptionsPrompt = `Проанализируй транзакции и найди подписки (регулярные платежи).

Выписка:
${statementText}

Верни ответ в формате JSON массив объектов с полями:
- name: название подписки
- amount: сумма
- frequency: частота (месячная, годовая, недельная)
- lastPayment: дата последнего платежа
- transactionIndices: массив индексов транзакций этой подписки

Пример:
[
  {
    "name": "Netflix",
    "amount": 999,
    "frequency": "месячная",
    "lastPayment": "2024-01-15",
    "transactionIndices": [5, 12, 19]
  }
]`;

    const subscriptions = await callDeepseekAPI([
      { role: 'user', content: subscriptionsPrompt }
    ], 0.3);

    let subscriptionsData = [];
    try {
      const jsonMatch = subscriptions.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        subscriptionsData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing subscriptions:', e);
    }

    // 3. Прогнозирование расходов
    const forecastPrompt = `На основе исторических данных транзакций спрогнозируй расходы на следующие 3 месяца.

Выписка:
${statementText}

Верни ответ в формате JSON:
{
  "nextMonth": {"total": число, "byCategory": {"категория": число}},
  "month2": {"total": число, "byCategory": {"категория": число}},
  "month3": {"total": число, "byCategory": {"категория": число}},
  "trends": "описание трендов",
  "confidence": число от 0 до 1
}`;

    const forecast = await callDeepseekAPI([
      { role: 'user', content: forecastPrompt }
    ], 0.5);

    let forecastData = {};
    try {
      const jsonMatch = forecast.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecastData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing forecast:', e);
    }

    // 4. Рекомендации
    const recommendationsPrompt = `Проанализируй финансовые транзакции и дай практические рекомендации по оптимизации расходов.

Выписка:
${statementText}
Классификация: ${JSON.stringify(classifications)}
Подписки: ${JSON.stringify(subscriptionsData)}
Прогноз: ${JSON.stringify(forecastData)}

Верни ответ в формате JSON массив рекомендаций:
[
  {
    "type": "экономия" | "оптимизация" | "предупреждение" | "совет",
    "priority": "высокая" | "средняя" | "низкая",
    "title": "заголовок",
    "description": "подробное описание",
    "potentialSavings": число или null
  }
]`;

    const recommendations = await callDeepseekAPI([
      { role: 'user', content: recommendationsPrompt }
    ], 0.7);

    let recommendationsData = [];
    try {
      const jsonMatch = recommendations.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendationsData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing recommendations:', e);
    }

    // 5. Общая статистика
    const stats = {
      totalTransactions: statement.length,
      totalIncome: 0,
      totalExpenses: 0,
      categories: {},
      averageTransaction: 0
    };

    statement.forEach((transaction, index) => {
      const amount = parseFloat(transaction.сумма || transaction.amount || 0);
      if (amount > 0) {
        stats.totalIncome += amount;
      } else {
        stats.totalExpenses += Math.abs(amount);
      }

      const classification = classifications.find(c => c.transactionIndex === index);
      if (classification) {
        const category = classification.category;
        if (!stats.categories[category]) {
          stats.categories[category] = 0;
        }
        stats.categories[category] += Math.abs(amount);
      }
    });

    stats.averageTransaction = stats.totalExpenses / statement.length;

    res.json({
      success: true,
      data: {
        statement: statement,
        classifications: classifications,
        subscriptions: subscriptionsData,
        forecast: forecastData,
        recommendations: recommendationsData,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Ошибка при анализе выписки', 
      details: error.message 
    });
  }
});

// Эндпоинт для парсинга PDF выписки
app.post('/api/parse-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF файл не загружен' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Файл должен быть в формате PDF' });
    }

    console.log(`Парсинг PDF файла: ${req.file.originalname}, размер: ${req.file.size} bytes`);

    // Динамический импорт pdf-parse
    let pdfParseModule;
    try {
      pdfParseModule = await import('pdf-parse');
    } catch (importError) {
      return res.status(500).json({ 
        error: 'Модуль pdf-parse не установлен. Запустите: npm install pdf-parse в папке backend' 
      });
    }

    const pdfParse = pdfParseModule.default || pdfParseModule;

    // Извлекаем текст из PDF
    let pdfText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      pdfText = pdfData.text;
      console.log(`Извлечено ${pdfText.length} символов из PDF`);
    } catch (pdfError) {
      console.error('Ошибка парсинга PDF:', pdfError);
      return res.status(400).json({ 
        error: 'Не удалось извлечь текст из PDF. Убедитесь, что файл не поврежден и содержит текст (не сканированное изображение).' 
      });
    }

    // Если PDF не содержит текста (сканированное изображение), конвертируем в изображения
    if (!pdfText || pdfText.trim().length === 0) {
      console.log('PDF не содержит текста, конвертируем в изображения для vision анализа...');
      
      let images;
      try {
        images = await convertPDFToImages(req.file.buffer);
      } catch (imgError) {
        console.error('Ошибка конвертации PDF в изображения:', imgError);
        return res.status(500).json({ 
          error: 'Не удалось конвертировать PDF в изображения. Убедитесь, что установлены зависимости: npm install pdfjs-dist canvas' 
        });
      }
      
      if (!images || images.length === 0) {
        return res.status(400).json({ 
          error: 'Не удалось извлечь изображения из PDF' 
        });
      }
      
      // Используем OCR для извлечения текста из изображений
      console.log('Извлечение текста из изображений PDF с помощью OCR...');
      let ocrText;
      try {
        ocrText = await extractTextFromImages(images);
        console.log(`OCR извлек ${ocrText.length} символов текста`);
      } catch (ocrError) {
        console.error('Ошибка OCR:', ocrError);
        return res.status(500).json({ 
          error: 'Не удалось извлечь текст из изображений PDF с помощью OCR. Убедитесь, что установлен tesseract.js: npm install tesseract.js',
          details: ocrError.message
        });
      }
      
      if (!ocrText || ocrText.trim().length === 0) {
        return res.status(400).json({ 
          error: 'OCR не смог извлечь текст из изображений PDF. Возможно, изображения низкого качества или не содержат текста.' 
        });
      }
      
      // Используем Deepseek для анализа извлеченного текста
      const extractionPrompt = `Ты финансовый аналитик. Из следующего текста, извлеченного из банковской выписки с помощью OCR, извлеки все транзакции.

Текст выписки (может содержать ошибки OCR):
${ocrText.substring(0, 15000)}${ocrText.length > 15000 ? '...' : ''}

Верни ТОЛЬКО валидный JSON массив объектов с полями:
- дата: дата транзакции в формате YYYY-MM-DD
- сумма: число (отрицательное для расходов, положительное для доходов)
- операция: тип операции
- детали: описание транзакции

Учти, что текст может содержать ошибки OCR, поэтому будь внимателен при распознавании чисел и дат.
Если не можешь определить дату, используй формат из текста.
Если не можешь определить сумму, используй 0.

Пример ответа:
[
  {"дата": "2024-01-15", "сумма": -1500, "операция": "Покупка", "детали": "Супермаркет Ашан"},
  {"дата": "2024-01-16", "сумма": -500, "операция": "Оплата", "детали": "Netflix подписка"}
]

ВАЖНО: Верни ТОЛЬКО JSON массив, без дополнительного текста, объяснений или markdown форматирования.`;
      
      const extraction = await callDeepseekAPI([
        { role: 'user', content: extractionPrompt }
      ], 0.3);
      
      let transactions = [];
      try {
        const jsonMatch = extraction.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          transactions = JSON.parse(jsonMatch[0]);
        } else {
          transactions = JSON.parse(extraction.trim());
        }
        
        if (!Array.isArray(transactions)) {
          throw new Error('Ответ должен быть массивом');
        }
        
        transactions = transactions
          .filter(t => t && (t.дата || t.date) && (t.сумма !== undefined || t.amount !== undefined))
          .map(t => ({
            дата: t.дата || t.date || '',
            сумма: parseFloat(t.сумма || t.amount || 0),
            операция: t.операция || t.operation || '',
            детали: t.детали || t.details || t.описание || t.description || ''
          }));
        
        if (transactions.length === 0) {
          return res.status(400).json({ 
            error: 'Не удалось извлечь транзакции из изображений PDF. Убедитесь, что файл содержит банковскую выписку с транзакциями.' 
          });
        }
        
        console.log(`Извлечено ${transactions.length} транзакций из изображений PDF через OCR`);
        
        return res.json({
          success: true,
          data: {
            statement: transactions,
            extractedText: ocrText.substring(0, 500) + (ocrText.length > 500 ? '...' : ''),
            transactionsCount: transactions.length,
            method: 'ocr'
          }
        });
        
      } catch (parseError) {
        console.error('Ошибка парсинга ответа от Deepseek после OCR:', parseError);
        console.error('Ответ Deepseek:', extraction);
        console.error('OCR текст:', ocrText.substring(0, 500));
        return res.status(500).json({ 
          error: 'Не удалось извлечь структурированные данные из изображений PDF.',
          details: parseError.message
        });
      }
    }

    // Если есть текст, используем текстовый анализ
    const extractionPrompt = `Ты финансовый аналитик. Из следующего текста банковской выписки извлеки все транзакции.

Текст выписки:
${pdfText.substring(0, 10000)}${pdfText.length > 10000 ? '...' : ''}

Верни ТОЛЬКО валидный JSON массив объектов с полями:
- дата: дата транзакции в формате YYYY-MM-DD
- сумма: число (отрицательное для расходов, положительное для доходов)
- операция: тип операции
- детали: описание транзакции

Если не можешь определить дату, используй формат из текста или null.
Если не можешь определить сумму, используй 0.

Пример ответа:
[
  {"дата": "2024-01-15", "сумма": -1500, "операция": "Покупка", "детали": "Супермаркет Ашан"},
  {"дата": "2024-01-16", "сумма": -500, "операция": "Оплата", "детали": "Netflix подписка"}
]

ВАЖНО: Верни ТОЛЬКО JSON массив, без дополнительного текста, объяснений или markdown форматирования.`;

    const extraction = await callDeepseekAPI([
      { role: 'user', content: extractionPrompt }
    ], 0.3);

    let transactions = [];
    try {
      // Пытаемся найти JSON в ответе
      const jsonMatch = extraction.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        transactions = JSON.parse(jsonMatch[0]);
      } else {
        // Попробуем распарсить весь ответ как JSON
        transactions = JSON.parse(extraction.trim());
      }

      if (!Array.isArray(transactions)) {
        throw new Error('Ответ должен быть массивом');
      }

      // Нормализуем данные
      transactions = transactions
        .filter(t => t && (t.дата || t.date) && (t.сумма !== undefined || t.amount !== undefined))
        .map(t => ({
          дата: t.дата || t.date || '',
          сумма: parseFloat(t.сумма || t.amount || 0),
          операция: t.операция || t.operation || '',
          детали: t.детали || t.details || t.описание || t.description || ''
        }));

      if (transactions.length === 0) {
        return res.status(400).json({ 
          error: 'Не удалось извлечь транзакции из PDF. Убедитесь, что файл содержит банковскую выписку с транзакциями.' 
        });
      }

      console.log(`Извлечено ${transactions.length} транзакций из PDF`);

      res.json({
        success: true,
        data: {
          statement: transactions,
          extractedText: pdfText.substring(0, 500) + (pdfText.length > 500 ? '...' : ''),
          transactionsCount: transactions.length,
          method: 'text'
        }
      });

    } catch (parseError) {
      console.error('Ошибка парсинга ответа от Deepseek:', parseError);
      console.error('Ответ Deepseek:', extraction);
      return res.status(500).json({ 
        error: 'Не удалось извлечь структурированные данные из PDF. Попробуйте другой файл или формат.',
        details: parseError.message
      });
    }

  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке PDF файла', 
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bank Statement Analyzer API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

