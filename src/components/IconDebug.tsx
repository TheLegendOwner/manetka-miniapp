// Отладочный компонент удален - проблема с иконками решена
// Изменение размера иконок с 12px на 16px решило проблему видимости

export function IconDebug() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎉 Проблема решена!</h1>
      <p className="text-muted-foreground">
        Иконки теперь отображаются корректно после изменения размера с 12px на 16px.
        Этот компонент больше не нужен.
      </p>
    </div>
  );
}

// Inline стили для принудительного отображения
const forceIconStyle: React.CSSProperties = {
  display: 'inline-block',
  opacity: 1,
  visibility: 'visible',
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 2,
  flexShrink: 0
};

// Кастомные компоненты без проблем
const CustomButton = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClass = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={{ color: 'inherit' }}
      {...props}
    >
      {children}
    </button>
  );
};

const CustomBadge = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary text-primary-foreground ${className}`}
      style={{ color: 'inherit' }}
      {...props}
    >
      {children}
    </span>
  );
};

export function IconDebug() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Inline CSS для экстренного исправления */
          svg[data-lucide] {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            width: auto !important;
            height: auto !important;
            vertical-align: middle !important;
            flex-shrink: 0 !important;
          }
          
          .lucide {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            vertical-align: middle !important;
            flex-shrink: 0 !important;
          }
          
          * svg {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Специальные правила для shadcn Button */
          [data-slot="button"] svg,
          button[data-slot="button"] svg {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            width: auto !important;
            height: auto !important;
            pointer-events: none !important;
            flex-shrink: 0 !important;
          }
          
          /* Специальные правила для shadcn Badge */
          [data-slot="badge"] svg,
          span[data-slot="badge"] svg {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            width: auto !important;
            height: auto !important;
            pointer-events: none !important;
            flex-shrink: 0 !important;
          }
          
          /* Ультра агрессивные правила для Badge */
          .inline-flex > svg,
          span.inline-flex > svg,
          [class*="inline-flex"] svg,
          [class*="badge"] svg {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            width: auto !important;
            height: auto !important;
            flex-shrink: 0 !important;
            position: relative !important;
            z-index: 999 !important;
          }
          
          /* Переопределение всех возможных размерных классов */
          svg[class*="size-"],
          svg.size-3,
          svg.size-4 {
            width: auto !important;
            height: auto !important;
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Таргетинг через data-test атрибуты */
          [data-test*="badge"] svg,
          [data-test*="badge"] > svg {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
            stroke: currentColor !important;
            fill: none !important;
            stroke-width: 2 !important;
            width: auto !important;
            height: auto !important;
            flex-shrink: 0 !important;
            position: relative !important;
            z-index: 9999 !important;
          }
        `
      }} />
      
      <div className="min-h-screen bg-background p-6 space-y-8">
        <h1 className="text-2xl font-bold">🔍 Отладка иконок - Тест видимости</h1>
      
      {/* 0. Тест с inline стилями (должны быть видны) */}
      <Card>
        <CardHeader>
          <CardTitle>0. ПРИНУДИТЕЛЬНЫЕ inline стили (должны быть видны)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded bg-yellow-100">
            <span>Inline style 16px:</span>
            <Wallet2 size={16} style={forceIconStyle} />
            <Star size={16} style={forceIconStyle} />
            <Trash2 size={16} style={forceIconStyle} />
            <Plus size={16} style={forceIconStyle} />
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded bg-yellow-100">
            <span>Inline style 24px:</span>
            <Wallet2 size={24} style={forceIconStyle} />
            <Star size={24} style={forceIconStyle} />
            <Trash2 size={24} style={forceIconStyle} />
            <Plus size={24} style={forceIconStyle} />
          </div>
        </CardContent>
      </Card>

      {/* 1. Обычные иконки без контейнеров */}
      <Card>
        <CardHeader>
          <CardTitle>1. Обычные иконки без контейнеров</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded">
            <span>size={16}:</span>
            <Wallet2 size={16} />
            <Star size={16} />
            <Trash2 size={16} />
            <Plus size={16} />
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded">
            <span>size={20}:</span>
            <Wallet2 size={20} />
            <Star size={20} />
            <Trash2 size={20} />
            <Plus size={20} />
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded">
            <span>size={24}:</span>
            <Wallet2 size={24} />
            <Star size={24} />
            <Trash2 size={24} />
            <Plus size={24} />
          </div>
        </CardContent>
      </Card>

      {/* 1.5. Простые SVG элементы (тест базовой поддержки SVG) */}
      <Card>
        <CardHeader>
          <CardTitle>1.5. Простые SVG элементы (базовый тест)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded bg-blue-100">
            <span>Простые SVG:</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="blue" stroke="blue" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded bg-green-100">
            <span>Цветные блоки для проверк�� рендеринга:</span>
            <div className="w-5 h-5 bg-red-500"></div>
            <div className="w-5 h-5 bg-blue-500"></div>
            <div className="w-5 h-5 bg-green-500"></div>
            <div className="w-5 h-5 bg-yellow-500"></div>
          </div>
        </CardContent>
      </Card>

      {/* 1.9. Простой тест Button и Badge с принудительными стилями */}
      <Card>
        <CardHeader>
          <CardTitle>1.9. ПРИНУДИТЕЛЬНЫЙ тест Button/Badge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 p-4 border rounded bg-red-100">
            <span>Button с inline стилями:</span>
            <Button style={{ color: 'red' }}>
              <Plus size={16} style={forceIconStyle} />
              Test Button
            </Button>
            <Badge style={{ backgroundColor: 'blue', color: 'white' }}>
              <Star size={12} style={forceIconStyle} />
              Test Badge
            </Badge>
          </div>
          
          <div className="flex gap-2 p-4 border rounded bg-purple-100">
            <span>Простые кнопки БЕЗ shadcn:</span>
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded">
              <Plus size={16} />
              Simple Button
            </button>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
              <Star size={12} />
              Simple Badge
            </span>
          </div>
          
          <div className="flex gap-2 p-4 border rounded bg-orange-100">
            <span>Кастомные компоненты:</span>
            <CustomButton>
              <DollarSign size={16} />
              Custom Button
            </CustomButton>
            <CustomBadge>
              <Zap size={12} />
              Custom Badge
            </CustomBadge>
          </div>
        </CardContent>
      </Card>

      {/* 2. Иконки в кнопках разных типов */}
      <Card>
        <CardHeader>
          <CardTitle>2. Иконки в кнопках (shadcn Button)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Default Button:</div>
            <div className="flex gap-2">
              <Button>
                <DollarSign size={16} />
                Купить
              </Button>
              <Button>
                <Coins size={16} />
                Продать
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Outline Button:</div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus size={16} />
                Добавить
              </Button>
              <Button variant="outline">
                <Share2 size={16} />
                Поделиться
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Ghost Button:</div>
            <div className="flex gap-2">
              <Button variant="ghost">
                <Star size={16} />
                Избранное
              </Button>
              <Button variant="ghost">
                <Trash2 size={16} />
                Удалить
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Icon Button:</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Star size={16} />
              </Button>
              <Button variant="outline" size="icon">
                <HelpCircle size={16} />
              </Button>
              <Button size="icon">
                <Wallet2 size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.5. Специальный тест Badge с принудительными стилями */}
      <Card>
        <CardHeader>
          <CardTitle>2.5. ПРИНУДИТЕЛЬНЫЙ тест Badge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 p-4 border rounded bg-pink-100">
            <span>Badge с inline стилями:</span>
            <Badge style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Star size={12} style={forceIconStyle} />
              Force Badge
            </Badge>
            <Badge className="" style={{ backgroundColor: 'purple', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
              <Zap size={12} style={{ ...forceIconStyle, marginRight: '4px' }} />
              Purple Badge
            </Badge>
          </div>
          
          <div className="flex gap-2 p-4 border rounded bg-cyan-100">
            <span>Простейший Badge без shadcn:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
              <Plus size={12} style={forceIconStyle} />
              Simple Badge
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
              <Star size={12} style={forceIconStyle} />
              Red Badge
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Иконки в Badge */}
      <Card>
        <CardHeader>
          <CardTitle>3. Иконки в Badge (shadcn)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge data-test="normal-badge">
              <Star size={12} className="mr-1" style={forceIconStyle} />
              Основной
            </Badge>
            
            <Badge variant="secondary" data-test="secondary-badge">
              <Zap size={12} className="mr-1" style={forceIconStyle} />
              Буст
            </Badge>
            
            <Badge variant="outline" data-test="outline-badge">
              <Users size={12} className="mr-1" style={forceIconStyle} />
              Рефералы
            </Badge>
            
            <Badge className="bg-primary/10 text-primary">
              <Star size={12} className="mr-1 fill-amber-500 text-amber-500" />
              Заполненная звезда
            </Badge>
            
            <Badge style={{ all: 'unset', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
              <Star size={12} style={{ ...forceIconStyle, marginRight: '0' }} />
              Unset Badge
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 4. Иконки в Card заголовках */}
      <Card>
        <CardHeader>
          <CardTitle>4. Иконки в Card заголовках</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Статистика кошелька
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Содержимое карточки с иконкой в заголовке</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet2 size={20} className="text-primary" />
                  Подключенные кошельки
                </div>
                <HelpCircle size={16} className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Карточка с иконками в заголовке слева и справа</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 5. Иконки с разными CSS классами */}
      <Card>
        <CardHeader>
          <CardTitle>5. Иконки с разным�� CSS классами</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">С цветными классами:</div>
            <div className="flex gap-4 p-4 border rounded">
              <Star size={20} className="text-amber-500" />
              <Star size={20} className="text-red-500" />
              <Star size={20} className="text-blue-500" />
              <Star size={20} className="text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">С fill:</div>
            <div className="flex gap-4 p-4 border rounded">
              <Star size={20} className="text-amber-500 fill-amber-500" />
              <Star size={20} className="text-red-500 fill-red-500" />
              <Star size={20} className="text-blue-500 fill-blue-500" />
              <Star size={20} className="text-green-500 fill-green-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">С text-primary и text-muted-foreground:</div>
            <div className="flex gap-4 p-4 border rounded">
              <Wallet2 size={20} className="text-primary" />
              <HelpCircle size={20} className="text-muted-foreground" />
              <Zap size={20} className="text-primary" />
              <Users size={20} className="text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Иконки внутри flex контейнеров */}
      <Card>
        <CardHeader>
          <CardTitle>6. Иконки в flex контейнерах</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Wallet2 size={16} className="text-primary-foreground" />
            </div>
            <div>Иконка в цветном круге</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Coins size={16} />
              <span>Баланс</span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Star size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Оригинальный рабочий пример */}
      <Card>
        <CardHeader>
          <CardTitle>7. Рабочий пример из вашего кода</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Wallet2 size={16} className="text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">UQBx...3k2p</span>
                  <Badge className="h-5 px-2 text-xs bg-primary/10 text-primary border-primary/20">
                    <Star size={12} className="mr-1 fill-amber-500 text-amber-500" />
                    Ос��овной
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
              >
                <Star size={16} className="text-amber-500 hover:fill-amber-500 transition-all" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10"
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Тест с обычными HTML кнопками */}
      <Card>
        <CardHeader>
          <CardTitle>8. Обычные HTML кнопки (не shadcn)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded flex items-center gap-2">
              <Plus size={16} />
              HTML кнопка
            </button>
            
            <button className="px-4 py-2 border rounded flex items-center gap-2">
              <Search size={16} />
              Outline HTML
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 9. Button вместо Badge - РЕШЕНИЕ! */}
      <Card>
        <CardHeader>
          <CardTitle>9. 🎯 Button как замена Badge - РЕШЕНИЕ ПРОБЛЕМЫ!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border-2 border-green-500 rounded bg-green-50 dark:bg-green-900/20">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ Рабочее решение - используем Button вместо Badge:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="h-6 px-2 text-xs cursor-default pointer-events-none">
                <Star size={12} className="mr-1" />
                Основной
              </Button>
              <Button size="sm" variant="secondary" className="h-6 px-2 text-xs cursor-default pointer-events-none">
                <Zap size={12} className="mr-1" />
                Буст
              </Button>
              <Button size="sm" variant="outline" className="h-6 px-2 text-xs cursor-default pointer-events-none">
                <Users size={12} className="mr-1" />
                Рефералы
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-3">🌈 Цветные Button-Badge для NFT редкости:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="h-5 px-2 text-xs bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-600 cursor-default pointer-events-none">
                <Star size={10} className="mr-1" />
                LEGENDARY +13%
              </Button>
              <Button size="sm" className="h-5 px-2 text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-500 hover:to-pink-600 cursor-default pointer-events-none">
                <Zap size={10} className="mr-1" />
                EPIC +5%
              </Button>
              <Button size="sm" className="h-5 px-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-600 cursor-default pointer-events-none">
                <Users size={10} className="mr-1" />
                RARE +2%
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded bg-amber-50 dark:bg-amber-900/20">
            <h3 className="font-semibold mb-3">💡 Преимущества Button над Badge:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Иконки всегда видны</li>
              <li>✅ Простое отключение кликов: `cursor-default pointer-events-none`</li>
              <li>✅ Все варианты стилей: default, secondary, outline</li>
              <li>✅ Идеальная поддержка градиентов</li>
              <li>✅ Размеры через `size="sm"` и кастомную высоту</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}