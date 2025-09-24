import { parseISO, format, addHours } from 'date-fns';
import { MarketRow } from '../types';

export const loadDataFromFile = async (): Promise<MarketRow[]> => {
  try {
    const response = await fetch('/data.txt');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
};

export const normalizeHour = (tranHour: string | number): number => {
  if (typeof tranHour === 'string') {
    const match = tranHour.match(/(\d+):00/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return tranHour;
};

export const sortMarketData = (data: MarketRow[]): MarketRow[] => {
  return data.sort((a, b) => {
    const dateA = new Date(a.tranDate + 'T00:00:00');
    const dateB = new Date(b.tranDate + 'T00:00:00');
    const hourA = normalizeHour(a.tranHour);
    const hourB = normalizeHour(b.tranHour);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return hourA - hourB;
  });
};

export const findIndexByDateHour = (
  data: MarketRow[],
  targetDate: string,
  targetHour: number
): number => {
  return data.findIndex(row => {
    const rowDate = format(new Date(row.tranDate), 'yyyy-MM-dd');
    const rowHour = normalizeHour(row.tranHour);
    return rowDate === targetDate && rowHour === targetHour;
  });
};

export const takeNext = (
  data: MarketRow[],
  startIndex: number,
  count: number
): MarketRow[] => {
  if (startIndex === -1 || startIndex >= data.length) {
    return [];
  }
  
  const result: MarketRow[] = [];
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % data.length;
    result.push(data[index]);
  }
  return result;
};

export const formatDateTime = (date: string, hour: number): string => {
  const baseDate = new Date(date + 'T00:00:00');
  const targetDate = addHours(baseDate, hour);
  return format(targetDate, 'MM/dd HH:mm');
};