import '@toba/tools';
import * as MockDate from 'mockdate';
import * as moment from 'moment';
import { dateTime, Duration } from '../';

const durations: Map<string, Duration> = new Map([
   ['date', Duration.Day],
   ['year', Duration.Year],
   ['month', Duration.Month],
   ['hour', Duration.Hour],
   ['minute', Duration.Minute],
   ['second', Duration.Second],
   ['millisecond', Duration.Millisecond]
]);

const units: Map<string, Duration> = new Map([
   ['Y', Duration.Year],
   ['years', Duration.Year],
   ['M', Duration.Month],
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

test('identifies leap years', () => {
   expect(dateTime('20000101').isLeapYear()).toBe(true);
   expect(dateTime('2100-01-01').isLeapYear()).toBe(false);
});

test('compares dates in terms of before/after/same', () => {
   const d1 = dateTime();
   const d2 = d1.clone().add(1, Duration.Day);
   const d3 = d1.clone().subtract(1, Duration.Day);
   expect(d3.isBefore(d1)).toBe(true);
   expect(d1.isSame(dateTime())).toBe(true);
   expect(d2.isAfter(d1)).toBe(true);
});

test('matches moment valueOf()', () => {
   const timestamp = 1523520536000;
   expect(dateTime(timestamp).valueOf()).toBe(moment(timestamp).valueOf());
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

test('matches moment constructor', () => {
   expect(dateTime().valueOf()).toBe(moment().valueOf());

   ['20130108', '2018-04-24', '2018-04-04T16:00:00.000Z'].forEach(t => {
      expect(dateTime(t).valueOf()).toBe(moment(t).valueOf());
   });
});

test('matches moment bad date values', () => {
   global.console.warn = jest.fn(); // suppress moment warnings
   ['bad-date', null].forEach(d => {
      expect(
         dateTime(d)
            .toString()
            .toLowerCase()
      ).toBe(
         moment(d)
            .toString()
            .toLowerCase()
      );
   });
});

test('validates dates', () => {
   expect(dateTime().isValid()).toBe(true);
   expect(dateTime('no-no').isValid()).toBe(false);
});

test('matches moment shortcut properties', () => {
   expect(dateTime().year).toBe(moment().year());
   expect(dateTime().month).toBe(moment().month());
   expect(dateTime().toDate()).toBe(moment().date());
   expect(dateTime().hour).toBe(moment().hour());
   expect(dateTime().minute).toBe(moment().minute());
   expect(dateTime().second).toBe(moment().second());
   expect(dateTime().millisecond).toBe(moment().millisecond());
   expect(dateTime().valueOf()).toBe(moment().valueOf());
   expect(dateTime().unix).toBe(moment().unix());
});

test('matches moment duration updates', () => {
   for (const [code, duration] of durations) {
      expect(
         dateTime()
            .set(duration, 11)
            .valueOf()
      ).toBe(
         moment()
            .set(code as moment.unitOfTime.Base, 11)
            .valueOf()
      );
   }
});

test('matches moment formatting', () => {
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

test('matches moment difference calculation', () => {
   const d1 = dateTime();
   const m1 = moment();
   const d2 = dateTime().add(1000, Duration.Day);
   const d3 = dateTime().subtract(1000, Duration.Day);
   const m2 = moment().add(1000, 'days');
   const m3 = moment().subtract(1000, 'days');

   ['2011010', '2013-02-08'].forEach(d => {
      const setDate = dateTime(d);
      const setMoment = moment(d);
      expect(d1.diff(setDate)).toBe(m1.diff(setMoment));
   });

   ['seconds', 'days', 'weeks', 'months', 'quarters', 'years'].forEach(
      (u: moment.unitOfTime.Base) => {
         const duration = units.get(u);
         expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
         expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
         expect(d1.diff(d3, duration)).toBe(m1.diff(m3, u));
         expect(d1.diff(d3, duration, true)).toBe(m1.diff(m3, u, true));
      }
   );
});

test('matches moment diff across months', () => {
   const d1 = dateTime('20160115');
   const d2 = dateTime('20160215');
   const d3 = dateTime('20170115');
   const m1 = moment('20160115');
   const m2 = moment('20160215');
   const m3 = moment('20170115');

   ['months', 'quarters', 'years'].forEach((u: moment.unitOfTime.Base) => {
      const duration = units.get(u);
      expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
      expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
      expect(d1.diff(d2, duration)).toBe(m1.diff(m2, u));
      expect(d1.diff(d2, duration, true)).toBe(m1.diff(m2, u, true));
      expect(d1.diff(d3, duration)).toBe(m1.diff(m3, u));
      expect(d1.diff(d3, duration, true)).toBe(m1.diff(m3, u, true));
   });
});

test('matches moment days-in-month calculation', () => {
   expect(dateTime().daysInMonth).toBe(moment().daysInMonth());
   expect(dateTime('20140201').daysInMonth).toBe(
      moment('20140201').daysInMonth()
   );
});

test('matches moment transforms', () => {
   expect(dateTime().toArray()).toEqual(moment().toArray());
   expect(dateTime().toJSON()).toBe(moment().toJSON());
   expect(dateTime().toISOString()).toBe(moment().toISOString());
   expect(dateTime().toObject()).toEqual(moment().toObject());
});

it('exports EcmaScript date object', () => {
   const d = dateTime();
   const m = moment();
   const baseDate = d.toDate();

   expect(baseDate).toEqual(m.toDate());
   expect(baseDate).toEqual(new Date());

   baseDate.setFullYear(1970);
   expect(baseDate.toUTCString()).not.toBe(d.toString());
});

it('matches moment start/end when no change', () => {
   expect(
      dateTime()
         .startOf(null)
         .valueOf()
   ).toBe(
      moment()
         .startOf(null)
         .valueOf()
   );
   expect(
      dateTime()
         .endOf(null)
         .valueOf()
   ).toBe(
      moment()
         .endOf(null)
         .valueOf()
   );
});

test('matches moment addition', () => {
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
      'M',
      'y'
   ].forEach((u: moment.unitOfTime.Base) => {
      expect(
         dateTime()
            .add(1, units.get(u))
            .valueOf()
      ).toBe(
         moment()
            .add(1, u)
            .valueOf()
      );
   });

   expect(
      dateTime('20111031')
         .add(1, Duration.Month)
         .valueOf()
   ).toBe(
      moment('20111031')
         .add(1, 'months')
         .valueOf()
   );
});

test('matches moment subtraction', () => {
   ['days'].forEach((u: moment.unitOfTime.Base) => {
      expect(
         dateTime()
            .subtract(1, units.get(u))
            .valueOf()
      ).toBe(
         moment()
            .subtract(1, u)
            .valueOf()
      );
   });
});
