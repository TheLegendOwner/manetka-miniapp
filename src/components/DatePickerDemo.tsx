import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePicker, DateRangePicker, QuickDatePicker } from './ui/date-picker';
import { DateFilter, useDateFilter } from './ui/date-filter';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, TrendingUp, Coins, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  currency: string;
  description: string;
  date: Date;
  category: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: '+125.50',
    currency: 'MNTK',
    description: 'NFT Passive Income',
    date: new Date(2024, 11, 20),
    category: 'NFT Rewards'
  },
  {
    id: '2',
    type: 'expense',
    amount: '-2.5',
    currency: 'TON',
    description: 'NFT Purchase',
    date: new Date(2024, 11, 19),
    category: 'Marketplace'
  },
  {
    id: '3',
    type: 'income',
    amount: '+50.00',
    currency: 'MNTK',
    description: 'Referral Bonus',
    date: new Date(2024, 11, 18),
    category: 'Referrals'
  },
  {
    id: '4',
    type: 'income',
    amount: '+75.25',
    currency: 'MNTK',
    description: 'Staking Rewards',
    date: new Date(2024, 11, 15),
    category: 'Staking'
  },
  {
    id: '5',
    type: 'expense',
    amount: '-1.8',
    currency: 'TON',
    description: 'Transaction Fee',
    date: new Date(2024, 11, 14),
    category: 'Fees'
  }
];

export function DatePickerDemo() {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined; to: Date | undefined }>();
  
  const { dateFilter, setDateFilter, filterItems, hasFilter, reset } = useDateFilter();

  const locale = language === 'ru' ? ru : enUS;
  
  const getTransactionDate = (transaction: Transaction) => transaction.date;
  const filteredTransactions = filterItems(mockTransactions, getTransactionDate);

  const formatDate = (date: Date) => {
    if (language === 'ru') {
      return format(date, 'dd MMM yyyy', { locale: ru });
    }
    return format(date, 'MMM dd, yyyy', { locale: enUS });
  };

  return (
    <div className="min-h-screen bg-background pb-32 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={24} className="text-primary" />
        <h1 className="text-2xl font-semibold">
          {language === 'ru' ? 'Демо: Выбор дат' : 'Demo: Date Pickers'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            {language === 'ru' ? 'Основные компоненты' : 'Basic Components'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'ru' ? 'Выбор даты:' : 'Date Picker:'}
            </label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder={language === 'ru' ? 'Выберите дату' : 'Select a date'}
            />
            {selectedDate && (
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ru' ? 'Выбрано:' : 'Selected:'} {formatDate(selectedDate)}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'ru' ? 'Выбор периода:' : 'Date Range Picker:'}
            </label>
            <DateRangePicker
              dateRange={selectedRange}
              onDateRangeChange={setSelectedRange}
              placeholder={language === 'ru' ? 'Выберите период' : 'Select date range'}
            />
            {selectedRange?.from && (
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ru' ? 'Период:' : 'Range:'} {formatDate(selectedRange.from)}
                {selectedRange.to && ` - ${formatDate(selectedRange.to)}`}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === 'ru' ? 'Быстрый выбор:' : 'Quick Selection:'}
            </label>
            <QuickDatePicker
              onDateSelect={setSelectedDate}
              onRangeSelect={setSelectedRange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            {language === 'ru' ? 'История транзакций' : 'Transaction History'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateFilter
            value={dateFilter}
            onChange={setDateFilter}
            showQuickOptions={true}
          />

          {hasFilter && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {filteredTransactions.length} {language === 'ru' ? 'транзакций' : 'transactions'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {language === 'ru' ? 'найдено по фильтру' : 'found with filter'}
              </span>
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto h-6 px-2 text-xs">
                {language === 'ru' ? 'Сбросить' : 'Clear'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      <ArrowUpDown size={16} className={transaction.type === 'income' ? 'rotate-180' : ''} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">{transaction.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount} {transaction.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(transaction.date, 'dd MMM', { locale })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <Coins size={48} className="mx-auto mb-4 opacity-30" />
                <p>{language === 'ru' ? 'Нет транзакций за выбранный период' : 'No transactions found for selected period'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Примеры использования' : 'Usage Examples'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="font-medium">
              {language === 'ru' ? 'Эти компоненты можно использовать для:' : 'These components can be used for:'}
            </p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• {language === 'ru' ? 'Фильтрация истории транзакций' : 'Transaction history filtering'}</li>
              <li>• {language === 'ru' ? 'Выбор периода для отчетов' : 'Report period selection'}</li>
              <li>• {language === 'ru' ? 'Планирование платежей' : 'Payment scheduling'}</li>
              <li>• {language === 'ru' ? 'Установка целей стейкинга' : 'Staking goal setting'}</li>
              <li>• {language === 'ru' ? 'Анализ доходности NFT' : 'NFT performance analysis'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}