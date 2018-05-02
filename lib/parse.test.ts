import moment from 'moment';
import MockDate from 'mockdate';
import { dateTime } from '../';

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

describe('Parse', () => {
   test('Now', () => {
      expect(dateTime().valueOf()).toBe(moment().valueOf());
   });

   test('String 20130208', () => {
      ['20130108', '2018-04-24'].forEach(t => {
         expect(dateTime(t).valueOf()).toBe(moment(t).valueOf());
      });
   });

   test('String ISO 8601 date, time and zone', () => {
      const time = '2018-04-04T16:00:00.000Z';
      expect(dateTime(time).valueOf()).toBe(moment(time).valueOf());
   });

   test('String Other, Null and isValid', () => {
      global.console.warn = jest.fn(); // moment.js otherString will throw warn
      expect(
         dateTime('otherString')
            .toString()
            .toLowerCase()
      ).toBe(
         moment('otherString')
            .toString()
            .toLowerCase()
      );
      expect(dateTime().isValid()).toBe(true);
      expect(dateTime('otherString').isValid()).toBe(false);
      expect(
         dateTime(null)
            .toString()
            .toLowerCase()
      ).toBe(
         moment(null)
            .toString()
            .toLowerCase()
      );
   });
});

test('Unix Timestamp Number (milliseconds) 1523520536000', () => {
   const timestamp = 1523520536000;
   expect(dateTime(timestamp).valueOf()).toBe(moment(timestamp).valueOf());
});

test('Clone not affect each other', () => {
   const base = dateTime(20170101);
   const year = base.year();
   const another = base.set(Duration.Year, year + 1);
   expect(another.unix - base.unix).toBe(31536000);
});

test('Clone with same value', () => {
   const base = dateTime();
   const year = base.year();
   const newBase = base.set('year', year + 1);
   const another = newBase.clone();
   expect(newBase.toString()).toBe(another.toString());
});
