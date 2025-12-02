import { Sparkles, AlertCircle, TrendingDown, Lightbulb, AlertTriangle, Target } from 'lucide-react';

const Recommendations = ({ data }) => {
  if (!data || !data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузите выписку для получения рекомендаций</p>
        </div>
      </div>
    );
  }

  const { recommendations } = data;

  const getTypeIcon = (type) => {
    const icons = {
      'экономия': TrendingDown,
      'оптимизация': Target,
      'предупреждение': AlertTriangle,
      'совет': Lightbulb,
    };
    return icons[type] || Sparkles;
  };

  const getTypeColor = (type) => {
    const colors = {
      'экономия': 'bg-green-100 text-green-800 border-green-200',
      'оптимизация': 'bg-blue-100 text-blue-800 border-blue-200',
      'предупреждение': 'bg-red-100 text-red-800 border-red-200',
      'совет': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'высокая': 'bg-red-500',
      'средняя': 'bg-yellow-500',
      'низкая': 'bg-green-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { 'высокая': 3, 'средняя': 2, 'низкая': 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  const totalPotentialSavings = recommendations
    .filter(rec => rec.potentialSavings)
    .reduce((sum, rec) => sum + (parseFloat(rec.potentialSavings) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Рекомендации</h1>
        <p className="text-gray-600">Персонализированные советы по оптимизации ваших финансов</p>
      </div>

      {/* Summary Card */}
      {totalPotentialSavings > 0 && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Потенциальная экономия</p>
              <p className="text-4xl font-bold text-green-600">
                ₸{totalPotentialSavings.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                При выполнении всех рекомендаций
              </p>
            </div>
            <TrendingDown className="w-16 h-16 text-green-600" />
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => {
          const Icon = getTypeIcon(recommendation.type);
          const typeColor = getTypeColor(recommendation.type);
          const priorityColor = getPriorityColor(recommendation.priority);

          return (
            <div 
              key={index} 
              className={`card border-2 hover:shadow-xl transition-all ${typeColor}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white/50 flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {recommendation.title || `Рекомендация ${index + 1}`}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                          {recommendation.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                          <span className="text-xs text-gray-600 font-medium">
                            {recommendation.priority} приоритет
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                  
                  {recommendation.potentialSavings && (
                    <div className="mt-3 pt-3 border-t border-white/30">
                      <p className="text-sm font-semibold text-gray-900">
                        💰 Потенциальная экономия: 
                        <span className="text-green-700 ml-2">
                          ₸{recommendation.potentialSavings.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}/мес
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for no savings */}
      {totalPotentialSavings === 0 && recommendations.length > 0 && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-center py-8">
          <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-700">
            Следуйте рекомендациям выше для улучшения вашего финансового здоровья
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

