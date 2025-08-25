import * as React from 'react';
import { format, isValid } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useLanguage } from '../../contexts/LanguageContext';

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder,
  disabled = false,
  className,
  showClearButton = true,
  minDate,
  maxDate
}: DatePickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const locale = language === 'ru' ? ru : enUS;
  
  const formatDate = (date: Date) => {
    if (language === 'ru') {
      return format(date, 'dd MMM yyyy', { locale: ru });
    }
    return format(date, 'MMM dd, yyyy', { locale: enUS });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon size={16} className="mr-2" />
          {date && isValid(date) ? (
            <span className="flex-1">{formatDate(date)}</span>
          ) : (
            <span className="flex-1">
              {placeholder || (language === 'ru' ? 'Выберите дату' : 'Pick a date')}
            </span>
          )}
          {showClearButton && date && isValid(date) && (
            <X 
              size={16} 
              className="ml-2 hover:text-destructive transition-colors cursor-pointer" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={disabled}
          initialFocus
          locale={locale}
          fromDate={minDate}
          toDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder,
  disabled = false,
  className,
  showClearButton = true,
  minDate,
  maxDate
}: DateRangePickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const locale = language === 'ru' ? ru : enUS;
  
  const formatDateRange = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (!range.from) return '';
    
    const formatSingle = (date: Date) => {
      if (language === 'ru') {
        return format(date, 'dd MMM', { locale: ru });
      }
      return format(date, 'MMM dd', { locale: enUS });
    };

    if (!range.to) {
      return formatSingle(range.from);
    }
    
    return `${formatSingle(range.from)} - ${formatSingle(range.to)}`;
  };

  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    onDateRangeChange?.(range);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange?.(undefined);
  };

  const hasSelection = dateRange?.from || dateRange?.to;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !hasSelection && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon size={16} className="mr-2" />
          {hasSelection ? (
            <span className="flex-1">{formatDateRange(dateRange!)}</span>
          ) : (
            <span className="flex-1">
              {placeholder || (language === 'ru' ? 'Выберите период' : 'Pick date range')}
            </span>
          )}
          {showClearButton && hasSelection && (
            <X 
              size={16} 
              className="ml-2 hover:text-destructive transition-colors cursor-pointer" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateRangeSelect}
          disabled={disabled}
          initialFocus
          locale={locale}
          fromDate={minDate}
          toDate={maxDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

interface QuickDatePickerProps {
  onDateSelect?: (date: Date) => void;
  onRangeSelect?: (range: { from: Date; to: Date }) => void;
  className?: string;
  showQuickOptions?: boolean;
}

export function QuickDatePicker({ 
  onDateSelect, 
  onRangeSelect, 
  className,
  showQuickOptions = true 
}: QuickDatePickerProps) {
  const { language } = useLanguage();
  
  const quickOptions = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    if (language === 'ru') {
      return [
        { label: 'Сегодня', action: () => onDateSelect?.(today) },
        { label: 'Вчера', action: () => onDateSelect?.(yesterday) },
        { label: 'За неделю', action: () => onRangeSelect?.({ from: weekAgo, to: today }) },
        { label: 'За месяц', action: () => onRangeSelect?.({ from: monthAgo, to: today }) },
      ];
    }
    
    return [
      { label: 'Today', action: () => onDateSelect?.(today) },
      { label: 'Yesterday', action: () => onDateSelect?.(yesterday) },
      { label: 'Last 7 days', action: () => onRangeSelect?.({ from: weekAgo, to: today }) },
      { label: 'Last 30 days', action: () => onRangeSelect?.({ from: monthAgo, to: today }) },
    ];
  }, [language, onDateSelect, onRangeSelect]);

  if (!showQuickOptions) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {quickOptions.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={option.action}
          className="text-xs h-8"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}