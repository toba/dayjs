import '@toba/tools';
import { dateTime, Duration } from './';
import { monthsApart, copyAndRound } from './tools';

test.only('copies date-time with rounded time', () => {
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
