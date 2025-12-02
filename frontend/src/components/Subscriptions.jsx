import { Bell, AlertCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const Subscriptions = ({ data }) => {
  if (!data || !data.subscriptions || data.subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Подписки не обнаружены в выписке</p>
        </div>
      </div>
    );
  }

  const { subscriptions, statement } = data;

  const totalMonthly = subscriptions
    .filter(sub => sub.frequency === 'месячная')
    .reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);

  const totalYearly = subscriptions
    .filter(sub => sub.frequency === 'годовая')
    .reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);

  const getFrequencyColor = (frequency) => {
    const colors = {
      'месячная': 'bg-blue-100 text-blue-800',
      'годовая': 'bg-green-100 text-green-800',
      'недельная': 'bg-purple-100 text-purple-800',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Анализ подписок</h1>
        <p className="text-gray-600">Обнаруженные регулярные платежи и подписки</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Всего подписок</p>
              <p className="text-3xl font-bold text-blue-600">{subscriptions.length}</p>
            </div>
            <Bell className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Месячные расходы</p>
              <p className="text-3xl font-bold text-green-600">
                ₸{totalMonthly.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Годовые расходы</p>
              <p className="text-3xl font-bold text-purple-600">
                ₸{totalYearly.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Детали подписок
        </h3>
        <div className="space-y-4">
          {subscriptions.map((subscription, index) => {
            const transactions = (subscription.transactionIndices || []).map(idx => statement[idx]).filter(Boolean);
            const yearlyCost = subscription.frequency === 'месячная' 
              ? (parseFloat(subscription.amount) || 0) * 12 
              : subscription.frequency === 'недельная'
              ? (parseFloat(subscription.amount) || 0) * 52
              : (parseFloat(subscription.amount) || 0);

            return (
              <div key={index} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {subscription.name || 'Неизвестная подписка'}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFrequencyColor(subscription.frequency)}`}>
                        {subscription.frequency}
                      </span>
                      {subscription.lastPayment && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Последний платеж: {subscription.lastPayment}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₸{(parseFloat(subscription.amount) || 0).toLocaleString('kz-KZ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subscription.frequency === 'месячная' && `₸${yearlyCost.toLocaleString('kz-KZ')}/год`}
                    </p>
                  </div>
                </div>
                
                {transactions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">
                      Найдено транзакций: {transactions.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {transactions.slice(0, 5).map((tx, txIndex) => (
                        <span key={txIndex} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                          {tx.дата || tx.date}: ₸{Math.abs(parseFloat(tx.сумма || tx.amount || 0)).toLocaleString('kz-KZ')}
                        </span>
                      ))}
                      {transactions.length > 5 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{transactions.length - 5} ещё
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Annual Summary */}
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          Годовая стоимость всех подписок
        </h3>
        <p className="text-4xl font-bold text-amber-600">
          ₸{(totalMonthly * 12 + totalYearly).toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Экономия при отмене всех подписок: ₸{(totalMonthly * 12 + totalYearly).toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}/год
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;

