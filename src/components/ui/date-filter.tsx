import * as React from 'react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Calendar, RotateCcw } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { DatePicker, DateRangePicker, QuickDatePicker } from './date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { useLanguage } from '../../contexts/LanguageContext';

export interface DateFilterValue {
  type: 'single' | 'range';
  single?: Date;
  range?: { from: Date | undefined; to: Date | undefined };
}

interface DateFilterProps {
  value?: DateFilterValue;
  onChange?: (value: DateFilterValue | undefined) => void;
  className?: string;
  showQuickOptions?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateFilter({
  value,
  onChange,
  className,
  showQuickOptions = true,
  minDate,
  maxDate
}: DateFilterProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'single' | 'range'>(value?.type || 'single');

  const handleSingleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange?.({ type: 'single', single: date });
    } else {
      onChange?.(undefined);
    }
  };

  const handleRangeChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      onChange?.({ type: 'range', range });
    } else {
      onChange?.(undefined);
    }
  };

  const handleQuickDateSelect = (date: Date) => {
    setActiveTab('single');
    onChange?.({ type: 'single', single: date });
  };

  const handleQuickRangeSelect = (range: { from: Date; to: Date }) => {
    setActiveTab('range');
    onChange?.({ type: 'range', range });
  };

  const handleReset = () => {
    onChange?.(undefined);
  };

  const hasValue = value && (value.single || (value.range?.from || value.range?.to));

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {language === 'ru' ? 'Фильтр по дате' : 'Date Filter'}
          </div>
          {hasValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2"
            >
              <RotateCcw size={16} className="mr-1" />
              {language === 'ru' ? 'Сбросить' : 'Reset'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showQuickOptions && (
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              {language === 'ru' ? 'Быстрый выбор:' : 'Quick select:'}
            </label>
            <QuickDatePicker
              onDateSelect={handleQuickDateSelect}
              onRangeSelect={handleQuickRangeSelect}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'single' | 'range')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">
              {language === 'ru' ? 'Дата' : 'Date'}
            </TabsTrigger>
            <TabsTrigger value="range">
              {language === 'ru' ? 'Период' : 'Range'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
            <DatePicker
              date={value?.type === 'single' ? value.single : undefined}
              onDateChange={handleSingleDateChange}
              placeholder={language === 'ru' ? 'Выберите дату' : 'Select date'}
              minDate={minDate}
              maxDate={maxDate}
              className="w-full"
            />
          </TabsContent>
          
          <TabsContent value="range" className="mt-4">
            <DateRangePicker
              dateRange={value?.type === 'range' ? value.range : undefined}
              onDateRangeChange={handleRangeChange}
              placeholder={language === 'ru' ? 'Выберите период' : 'Select date range'}
              minDate={minDate}
              maxDate={maxDate}
              className="w-full"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Utility function to filter array based on date filter
export function filterByDate(
  items: any[],
  dateFilter: DateFilterValue | undefined,
  getItemDate: (item: any) => Date
): any[] {
  if (!dateFilter) return items;

  return items.filter(item => {
    const itemDate = getItemDate(item);
    
    if (dateFilter.type === 'single' && dateFilter.single) {
      const targetDate = startOfDay(dateFilter.single);
      const itemDay = startOfDay(itemDate);
      return itemDay.getTime() === targetDate.getTime();
    }
    
    if (dateFilter.type === 'range' && dateFilter.range) {
      const { from, to } = dateFilter.range;
      if (!from) return true;
      
      const fromDate = startOfDay(from);
      const toDate = to ? endOfDay(to) : endOfDay(from);
      
      return isWithinInterval(itemDate, { start: fromDate, end: toDate });
    }
    
    return true;
  });
}

// Hook for managing date filter state
export function useDateFilter(initialValue?: DateFilterValue) {
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue | undefined>(initialValue);

  const reset = React.useCallback(() => {
    setDateFilter(undefined);
  }, []);

  const filterItems = React.useCallback((
    items: any[],
    getItemDate: (item: any) => Date
  ) => {
    return filterByDate(items, dateFilter, getItemDate);
  }, [dateFilter]);

  return {
    dateFilter,
    setDateFilter,
    reset,
    filterItems,
    hasFilter: !!dateFilter
  };
}