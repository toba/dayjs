import moment from 'moment';
import MockDate from 'mockdate';
import { Time } from '@toba/tools';
import { dateTime } from '../';

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

it('Format no formatStr', () => {
   expect(dateTime().format()).toBe(moment().format());
});

it('Format Year YY YYYY', () => {
   expect(dateTime().format('YY')).toBe(moment().format('YY'));
   expect(dateTime().format('YYYY')).toBe(moment().format('YYYY'));
});

it('Format Month M MM MMM MMMM', () => {
   expect(dateTime().format('M')).toBe(moment().format('M'));
   expect(dateTime().format('MM')).toBe(moment().format('MM'));
   expect(dateTime().format('MMM')).toBe(moment().format('MMM'));
   expect(dateTime().format('MMMM')).toBe(moment().format('MMMM'));
});

it('Format Day of Month D DD 1 - 31', () => {
   expect(dateTime().format('D')).toBe(moment().format('D'));
   expect(dateTime().format('DD')).toBe(moment().format('DD'));
});

it('Format Day of Week d Sun - Sat', () => {
   expect(dateTime().format('d')).toBe(moment().format('d'));
   expect(dateTime().format('dddd')).toBe(moment().format('dddd'));
});

it('Format Hour H HH 24-hour', () => {
   expect(dateTime().format('H')).toBe(moment().format('H'));
   expect(dateTime().format('HH')).toBe(moment().format('HH'));
});

it('Format Minute m mm', () => {
   expect(dateTime().format('m')).toBe(moment().format('m'));
   expect(dateTime().format('mm')).toBe(moment().format('mm'));
});

it('Format Second s sss', () => {
   expect(dateTime().format('s')).toBe(moment().format('s'));
   expect(dateTime().format('ss')).toBe(moment().format('ss'));
});

it('Format Time Zone ZZ', () => {
   expect(dateTime().format('Z')).toBe(moment().format('Z'));
   expect(dateTime().format('ZZ')).toBe(moment().format('ZZ'));
});

it('Format Complex with other string - : / ', () => {
   const string = 'YY-M-D / HH:mm:ss';
   expect(dateTime().format(string)).toBe(moment().format(string));
});

describe('Difference', () => {
   it('empty -> default milliseconds', () => {
      const dateString = '20110101';
      const d1 = dateTime();
      const d2 = dateTime(dateString);
      const m1 = moment();
      const m2 = moment(dateString);
      expect(d1.diff(d2)).toBe(m1.diff(m2));
   });

   it('diff -> none dayjs object', () => {
      const dateString = '2013-02-08';
      const d1 = dateTime();
      const d2 = new Date(dateString);
      const m1 = moment();
      const m2 = new Date(dateString);
      expect(d1.diff(d2)).toBe(m1.diff(m2));
   });

   it('diff -> in seconds, days, weeks, months, quarters, years ', () => {
      const d1 = dateTime();
      const d2 = dateTime().add(1000, Time.Day);
      const d3 = dateTime().subtract(1000, Time.Day);
      const m1 = moment();
      const m2 = moment().add(1000, 'days');
      const m3 = moment().subtract(1000, 'days');
      const units = ['seconds', 'days', 'weeks', 'months', 'quarters', 'years'];
      units.forEach(unit => {
         expect(d1.diff(d2, unit)).toBe(m1.diff(m2, unit));
         expect(d1.diff(d2, unit, true)).toBe(m1.diff(m2, unit, true));
         expect(d1.diff(d3, unit)).toBe(m1.diff(m3, unit));
         expect(d1.diff(d3, unit, true)).toBe(m1.diff(m3, unit, true));
      });
   });

   it('Special diff in month according to moment.js', () => {
      const dayjsA = dateTime('20160115');
      const dayjsB = dateTime('20160215');
      const dayjsC = dateTime('20170115');
      const momentA = moment('20160115');
      const momentB = moment('20160215');
      const momentC = moment('20170115');
      const units = ['months', 'quarters', 'years'];
      units.forEach(unit => {
         expect(dayjsA.diff(dayjsB, unit)).toBe(momentA.diff(momentB, unit));
         expect(dayjsA.diff(dayjsB, unit, true)).toBe(
            momentA.diff(momentB, unit, true)
         );
         expect(dayjsA.diff(dayjsC, unit)).toBe(momentA.diff(momentC, unit));
         expect(dayjsA.diff(dayjsC, unit, true)).toBe(
            momentA.diff(momentC, unit, true)
         );
      });
   });
});

it('Unix Timestamp (milliseconds)', () => {
   expect(dateTime().valueOf()).toBe(moment().valueOf());
});

it('Unix Timestamp (seconds)', () => {
   expect(dateTime().unix).toBe(moment().unix());
});

it('Days in Month', () => {
   expect(dateTime().daysInMonth()).toBe(moment().daysInMonth());
   expect(dateTime('20140201').daysInMonth()).toBe(
      moment('20140201').daysInMonth()
   );
});

it('As Javascript Date -> toDate', () => {
   const base = dateTime();
   const momentBase = moment();
   const jsDate = base.toDate();
   expect(jsDate).toEqual(momentBase.toDate());
   expect(jsDate).toEqual(new Date());

   jsDate.setFullYear(1970);
   expect(jsDate.toUTCString()).not.toBe(base.toString());
});

it('As Array -> toArray', () => {
   expect(dateTime().toArray()).toEqual(moment().toArray());
});

it('As JSON -> toJSON', () => {
   expect(dateTime().toJSON()).toBe(moment().toJSON());
});

it('As ISO 8601 String -> toISOString e.g. 2013-02-04T22:44:30.652Z', () => {
   expect(dateTime().toISOString()).toBe(moment().toISOString());
});

it('As Object -> toObject', () => {
   expect(dateTime().toObject()).toEqual(moment().toObject());
});
