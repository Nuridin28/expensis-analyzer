import { Tag, AlertCircle } from 'lucide-react';

const Classifications = ({ data }) => {
  if (!data || !data.classifications || data.classifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузите выписку для просмотра классификации</p>
        </div>
      </div>
    );
  }

  const { statement, classifications } = data;

  const getCategoryColor = (category) => {
    const colors = {
      'Продукты': 'bg-green-100 text-green-800',
      'Транспорт': 'bg-blue-100 text-blue-800',
      'Развлечения': 'bg-purple-100 text-purple-800',
      'Здоровье': 'bg-red-100 text-red-800',
      'Образование': 'bg-yellow-100 text-yellow-800',
      'Коммунальные услуги': 'bg-orange-100 text-orange-800',
      'Рестораны': 'bg-pink-100 text-pink-800',
      'Покупки': 'bg-indigo-100 text-indigo-800',
      'Подписки': 'bg-cyan-100 text-cyan-800',
      'Прочее': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categoryStats = {};
  classifications.forEach((classification) => {
    const transaction = statement[classification.transactionIndex];
    const amount = Math.abs(parseFloat(transaction.сумма || transaction.amount || 0));
    
    if (!categoryStats[classification.category]) {
      categoryStats[classification.category] = {
        count: 0,
        total: 0,
        subcategories: {}
      };
    }
    
    categoryStats[classification.category].count++;
    categoryStats[classification.category].total += amount;
    
    if (classification.subcategory) {
      if (!categoryStats[classification.category].subcategories[classification.subcategory]) {
        categoryStats[classification.category].subcategories[classification.subcategory] = 0;
      }
      categoryStats[classification.category].subcategories[classification.subcategory] += amount;
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Классификация трат</h1>
        <p className="text-gray-600">Детальный анализ категорий ваших расходов</p>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <div key={category} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(category)}`}>
                {category}
              </span>
              <span className="text-sm text-gray-600">{stats.count} транзакций</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₸{stats.total.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
            </p>
            {Object.keys(stats.subcategories).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Подкатегории:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.subcategories).slice(0, 3).map(([sub, amount]) => (
                    <span key={sub} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {sub}: ₸{amount.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-6 h-6 text-blue-600" />
          Детальная классификация транзакций
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Дата</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Детали</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Сумма</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Категория</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Подкатегория</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Уверенность</th>
              </tr>
            </thead>
            <tbody>
              {classifications.map((classification, index) => {
                const transaction = statement[classification.transactionIndex];
                if (!transaction) return null;
                
                const amount = parseFloat(transaction.сумма || transaction.amount || 0);
                const isExpense = amount < 0;
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.дата || transaction.date || 'Н/Д'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.детали || transaction.details || transaction.операция || 'Н/Д'}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                      {isExpense ? '-' : '+'}₸{Math.abs(amount).toLocaleString('kz-KZ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(classification.category)}`}>
                        {classification.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {classification.subcategory || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${(classification.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round((classification.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Classifications;

