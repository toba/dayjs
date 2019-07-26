import '@toba/test';
import { Month } from '@toba/tools';
import MockDate from 'mockdate';
import moment from 'moment';
import { dateTime, Duration } from './';
import { DateTime } from './time';

/**
 * Map `moment` durations to local `Duration`s
 */
const durations: Map<string, Duration> = new Map([
   ['date', Duration.Day],
   ['year', Duration.Year],
   ['month', Duration.Month],
   ['hour', Duration.Hour],
   ['minute', Duration.Minute],
   ['second', Duration.Second],
   ['millisecond', Duration.Millisecond]
]);

/**
 * Map `moment` units to local `Duration`s
 */
const units: Map<string, Duration> = new Map([
   ['Y', Duration.Year],
   ['years', Duration.Year],
   ['M', Duration.Month],
   ['quarters', Duration.Quarter],
   ['months', Duration.Month],
   ['d', Duration.Day],
   ['days', Duration.Day],
   ['w', Duration.Week],
   ['weeks', Duration.Week],
   ['h', Duration.Hour],
   ['hours', Duration.Hour],
   ['m', Duration.Minute],
   ['minutes', Duration.Minute],
   ['s', Duration.Second],
   ['seconds', Duration.Second],
   ['milliseconds', Duration.Millisecond]
]);

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

test('MockDate should cause date() to always return same value', done => {
   const d1 = new Date();
   setTimeout(() => {
      const d2 = new Date();
      expect(d2.getTime()).toBe(d1.getTime());
      done();
   }, 500);
});

test('parses date values in the same way moment does', () => {
   ['20110102', '2013-02-08'].forEach(d => {
      expect(dateTime(d).value).toBe(moment(d).valueOf());
   });
});

test('identifies leap years', () => {
   expect(dateTime('20000101').isLeapYear()).toBe(true);
   expect(dateTime('2100-01-01').isLeapYear()).toBe(false);
});

test('gets DateTime at beginning of timespan', () => {
   const dt = new DateTime(new Date(2018, Month.July, 12, 4, 6, 12));

   const expectStartTimes = (d: DateTime) => {
      expect(d.millisecond).toBe(0);
      expect(d.second).toBe(0);
      expect(d.minute).toBe(0);
      expect(d.hour).toBe(0);
   };

   const day = dt.startOf(Duration.Day);

   expectStartTimes(day);
   expect(day.dayOfMonth).toBe(12);

   const month = dt.startOf(Duration.Month);

   expectStartTimes(month);
   expect(month.dayOfMonth).toBe(1);
   expect(month.month).toBe(Month.July);

   const year = dt.startOf(Duration.Year);

   expectStartTimes(year);
   expect(year.dayOfMonth).toBe(1);
   expect(year.month).toBe(Month.January);
});

test('gets DateTime at end of timespan', () => {
   const dt = new DateTime(new Date(2018, Month.July, 12, 4, 6, 12));

   const expectEndTimes = (d: DateTime) => {
      expect(d.millisecond).toBe(999);
      expect(d.second).toBe(59);
      expect(d.minute).toBe(59);
      expect(d.hour).toBe(23);
   };

   const day = dt.endOf(Duration.Day);

   expectEndTimes(day);
   expect(day.dayOfMonth).toBe(12);

   const month = dt.endOf(Duration.Month);

   expectEndTimes(month);
   expect(month.dayOfMonth).toBe(31);
   expect(month.month).toBe(Month.July);

   const year = dt.endOf(Duration.Year);

   expectEndTimes(year);
   expect(year.dayOfMonth).toBe(31);
   expect(year.month).toBe(Month.December);
});

test('adds durations', () => {
   const dt = new DateTime(new Date(2018, Month.July, 29, 4, 6, 12));
   const nextDay = dt.add(1, Duration.Day);

   expect(nextDay.month).toBe(Month.July);
   expect(nextDay.dayOfMonth).toBe(30);

   const nextWeek = dt.add(1, Duration.Week);

   expect(nextWeek.month).toBe(Month.August);
   expect(nextWeek.dayOfMonth).toBe(5);

   const nextMonth = dt.add(2, Duration.Month);

   expect(nextMonth.month).toBe(Month.September);
   expect(nextMonth.dayOfMonth).toBe(29);
});

test('subtracts durations', () => {
   const dt = new DateTime(new Date(2018, Month.July, 5, 4, 6, 12));
   const prevDay = dt.subtract(1, Duration.Day);

   expect(prevDay.month).toBe(Month.July);
   expect(prevDay.dayOfMonth).toBe(4);

   const prevWeek = dt.subtract(1, Duration.Week);

   expect(prevWeek.month).toBe(Month.June);
   expect(prevWeek.dayOfMonth).toBe(28);

   const prevMonth = dt.subtract(2, Duration.Month);

   expect(prevMonth.month).toBe(Month.May);
   expect(prevMonth.dayOfMonth).toBe(5);
});

test('compares dates in terms of before/after/same', () => {
   const d1 = dateTime();
   const d2 = d1.clone().add(1, Duration.Day);
   const d3 = d1.clone().subtract(1, Duration.Day);
   expect(d3.isBefore(d1)).toBe(true);
   expect(d1.isSame(dateTime())).toBe(true);
   expect(d2.isAfter(d1)).toBe(true);
});

test('validates dates', () => {
   expect(dateTime().isValid()).toBe(true);
   expect(dateTime('no-no').isValid()).toBe(false);
});

test('creates immutable clone when changing values', () => {
   const base = dateTime(20170101);
   const later = base.set(Duration.Year, base.year + 1);
   expect(later.unix - base.unix).toBe(31536000);
});

test('creates clone with same values as original', () => {
   const base = dateTime();
   const later = base.set(Duration.Year, base.year + 1);
   const clone = later.clone();
   expect(later.toString()).toBe(clone.toString());
});

describe('matches moment.js', () => {
   test('valueOf()', () => {
      const timestamp = 1523520536000;
      expect(dateTime(timestamp).value).toBe(moment(timestamp).valueOf());
   });

   test('constructor', () => {
      expect(dateTime().value).toBe(moment().valueOf());

      [
         '20130108',
         '20111031',
         '2018-04-24',
         '2018-04-04T16:00:00.000Z'
      ].forEach(t => {
         const d = dateTime(t);
         const m = moment(t);
         expect(d.value).toBe(m.valueOf());
         expect(d.toObject()).toEqual(m.toObject());
      });
   });

   test('shortcut properties', () => {
      expect(dateTime().year).toBe(moment().year());
      expect(dateTime().month).toBe(moment().month());
      expect(dateTime().date).toBe(moment().date());
      expect(dateTime().hour).toBe(moment().hour());
      expect(dateTime().minute).toBe(moment().minute());
      expect(dateTime().second).toBe(moment().second());
      expect(dateTime().millisecond).toBe(moment().millisecond());
      expect(dateTime().value).toBe(moment().valueOf());
      expect(dateTime().unix).toBe(moment().unix());
   });

   test('duration updates', () => {
      for (const [code, duration] of durations) {
         expect(dateTime().set(duration, 11).value).toBe(
            moment()
               .set(code as moment.unitOfTime.Base, 11)
               .valueOf()
         );
      }
   });

   test('formatting', () => {
      expect(dateTime().format()).toBe(moment().format());
      [
         'YY-M-D / HH:mm:ss',
         'YY',
         'YYYY',
         'M',
         'MM',
         'MMM',
         'MMMM',
         'D',
         'DD',
         'd',
         'dddd',
         'H',
         'HH',
         'm',
         'mm',
         's',
         'ss',
         'Z',
         'ZZ'
      ].forEach(pattern => {
         expect(dateTime().format(pattern)).toBe(moment().format(pattern));
      });
   });

   test('difference calculation', () => {
      const d1 = dateTime();
      const m1 = moment();
      const d2 = dateTime().add(1000, Duration.Day);
      const d3 = dateTime().subtract(1000, Duration.Day);
      const m2 = moment().add(1000, 'days');
      const m3 = moment().subtract(1000, 'days');

      expect(d2.value).toBe(m2.valueOf());
      expect(d3.value).toBe(m3.valueOf());

      ['20110103', '2013-02-08'].forEach(d => {
         const otherDate = dateTime(d);
         const otherMoment = moment(d);
         expect(d1.diff(otherDate)).toBe(m1.diff(otherMoment));
      });

      ['seconds', 'days', 'weeks', 'months', 'quarters', 'years'].forEach(
         (u: moment.unitOfTime.Base) => {
            const duration = units.get(u);
            expect(duration).toBeDefined();
            expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
            //expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
            expect(d1.diff(d3, duration)).toBe(m1.diff(m3, u));
            //expect(d1.diff(d3, duration, true)).toBe(m1.diff(m3, u, true));
         }
      );
   });

   test('diff across months', () => {
      const d1 = dateTime('20160115');
      const d2 = dateTime('20160215');
      const d3 = dateTime('20170115');
      const m1 = moment('20160115');
      const m2 = moment('20160215');
      const m3 = moment('20170115');

      ['months', 'quarters', 'years'].forEach((u: moment.unitOfTime.Base) => {
         const duration = units.get(u);
         expect(duration).toBeDefined();
         expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
         expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
         expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
         expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
         expect(d1.diff(d3, duration)).toBe(m1.diff(m3, u));
         expect(d1.diff(d3, duration, true)).toBe(m1.diff(m3, u, true));
      });
   });

   test('days-in-month calculation', () => {
      expect(dateTime().daysInMonth).toBe(moment().daysInMonth());
      expect(dateTime('20140201').daysInMonth).toBe(
         moment('20140201').daysInMonth()
      );
   });

   test('transforms', () => {
      expect(dateTime().toArray()).toEqual(moment().toArray());
      expect(dateTime().toJSON()).toBe(moment().toJSON());
      expect(dateTime().toISOString()).toBe(moment().toISOString());
      expect(dateTime().toObject()).toEqual(moment().toObject());
   });

   test('exports JavaScript date object', () => {
      const d = dateTime();
      const m = moment();
      const baseDate = d.toDate();

      expect(baseDate).toEqual(m.toDate());
      expect(baseDate).toEqual(new Date());

      baseDate.setFullYear(1970);
      expect(baseDate.toUTCString()).not.toBe(d.toString());
   });

   test('addition', () => {
      [
         's',
         'seconds',
         'm',
         'minutes',
         'h',
         'hours',
         'w',
         'weeks',
         'd',
         'days',
         'M'
         //'y'
      ].forEach((u: moment.unitOfTime.Base) => {
         expect(dateTime().add(5, units.get(u)).value).toBe(
            moment()
               .add(5, u)
               .valueOf()
         );
      });

      const literal = '20111031';
      const d = dateTime(literal);
      const m = moment(literal);
      const dv = d.value;
      const mv = m.valueOf();
      const before: moment.MomentObjectOutput = {
         years: 2011,
         months: 9,
         date: 31,
         hours: 0,
         minutes: 0,
         seconds: 0,
         milliseconds: 0
      };
      const after: moment.MomentObjectOutput = {
         years: before.years,
         months: before.months + 1,
         date: 30,
         hours: before.hours,
         minutes: before.minutes,
         seconds: before.seconds,
         milliseconds: before.milliseconds
      };

      expect(m.toObject()).toEqual(before);
      expect(d.toObject()).toEqual(before);

      const dAdd = d.add(1, Duration.Month);
      const mAdd = m.add(1, 'months');

      expect(dv).toBe(mv);

      expect(mAdd.toObject()).toEqual(after);
      expect(dAdd.toObject()).toEqual(after);

      expect(dAdd.value - dv).toBe(mAdd.valueOf() - mv);
      expect(dAdd.value).toBe(mAdd.valueOf());
   });

   test('subtraction', () => {
      ['days'].forEach((u: moment.unitOfTime.Base) => {
         expect(dateTime().subtract(1, units.get(u)).value).toBe(
            moment()
               .subtract(1, u)
               .valueOf()
         );
      });
   });
});
