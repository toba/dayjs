import { Duration } from '@toba/tools';
import { DateTime } from './time';
// export const padStart = (text: string, length: number, pad: string) => {
//    if (!text || text.length >= length) return text;
//    return `${Array(length + 1 - text.length).join(pad)}${text}`;
// };

// export const isNumber = n => !Number.isNaN(parseFloat(n)) && Number.isFinite(n);

export const monthDiff = (a: DateTime, b: DateTime) => {
   // function from moment.js monthDiff
   const wholeMonthDiff = (b.year - a.year) * 12 + (b.month - a.month);
   const anchor = a.clone().add(wholeMonthDiff, Duration.Month);
   let anchor2;
   let adjust;
   if (b - anchor < 0) {
      anchor2 = a.clone().add(wholeMonthDiff - 1, Duration.Month);
      adjust = (b - anchor) / (anchor - anchor2);
   } else {
      anchor2 = a.clone().add(wholeMonthDiff + 1, Duration.Month);
      adjust = (b - anchor) / (anchor2 - anchor);
   }
   return Number(-(wholeMonthDiff + adjust)) || 0;
};

export const absFloor = (n: number) =>
   n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
