import '@toba/test';
import { Month } from '@toba/tools';
import { dateTime, Duration } from './';
import { monthsApart, copyAndRound, roundDate, daysInMonth } from './tools';

test('rounds date to nearest time unit', () => {
   const d = new Date(2018, Month.September, 14, 7, 32, 12);

   const expectEndTimes = (t: Date, h = 23, m = 59, s = 59, ms = 999) => {
      expectStartTimes(t, h, m, s, ms);
   };

   const expectStartTimes = (t: Date, h = 0, m = 0, s = 0, ms = 0) => {
      expect(t.getHours()).toBe(h);
      expect(t.getMinutes()).toBe(m);
      expect(t.getSeconds()).toBe(s);
      expect(t.getMilliseconds()).toBe(ms);
   };

   const minuteStart = roundDate(d, Duration.Minute);
   const minuteEnd = roundDate(d, Duration.Minute, false);

   expectStartTimes(minuteStart, 7, 32);
   expect(minuteEnd.getSeconds()).toBe(59);
   // original object shouldn't be changed
   expect(d.getSeconds()).toBe(12);

   const dayStart = roundDate(d, Duration.Day);
   const dayEnd = roundDate(d, Duration.Day, false);

   expectStartTimes(dayStart);
   expectEndTimes(dayEnd);

   const monthStart = roundDate(d, Duration.Month);
   const monthEnd = roundDate(d, Duration.Month, false);

   expectStartTimes(monthStart);
   expect(monthStart.getDate()).toBe(1);
   expect(monthStart.getHours()).toBe(0);

   expectEndTimes(monthEnd);
   expect(monthEnd.getDate()).toBe(30);
   expect(monthEnd.getMinutes()).toBe(59);

   const yearStart = roundDate(d, Duration.Year);
   const yearEnd = roundDate(d, Duration.Year, false);

   expectStartTimes(yearStart);
   expect(yearStart.getDate()).toBe(1);
   expect(yearStart.getMonth()).toBe(0);

   expectEndTimes(yearEnd);
   expect(yearEnd.getMonth()).toBe(Month.December);
});

test('gets number of days in month', () => {
   const months: Map<Month, number> = new Map([
      [Month.January, 31],
      [Month.February, 28],
      [Month.March, 31],
      [Month.April, 30],
      [Month.May, 31],
      [Month.June, 30],
      [Month.July, 31],
      [Month.August, 31],
      [Month.September, 30],
      [Month.October, 31],
      [Month.November, 30],
      [Month.December, 31]
   ]);

   months.forEach((days, m) => {
      const d = new Date(2018, m, 14);
      expect(daysInMonth(d)).toBe(days);
   });
});

test('copies date-time with rounded time', () => {
   const dt = dateTime(new Date(2018, 8, 14, 7, 32, 12));

   expect(copyAndRound(dt, Duration.Minute).second).toBe(0);
   expect(copyAndRound(dt, Duration.Minute, false).second).toBe(59);
   // original object shouldn't be changed
   expect(dt.second).toBe(12);

   expect(copyAndRound(dt, Duration.Day).hour).toBe(0);
   expect(copyAndRound(dt, Duration.Day, false).hour).toBe(23);
   expect(copyAndRound(dt, Duration.Day, false).millisecond).toBe(999);
});

test('calculates months apart', () => {
   const d1 = dateTime();
   const d2 = d1.add(3, Duration.Month);
   expect(d2.isSame(d1)).toBe(false);
   expect(monthsApart(d1, d2)).toBe(3);
});
