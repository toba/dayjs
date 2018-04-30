import moment from 'moment';
import MockDate from 'mockdate';
import { dateTime } from '../';

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

describe('StartOf EndOf', () => {
   it('StartOf EndOf Year ... with s and upper case', () => {
      const testArr = [
         'Year',
         'year',
         'YearS',
         'month',
         'day',
         'date',
         'week',
         'hour',
         'minute',
         'second'
      ];
      testArr.forEach(d => {
         expect(
            dateTime()
               .startOf(d)
               .valueOf()
         ).toBe(
            moment()
               .startOf(d)
               .valueOf()
         );
         expect(
            dateTime()
               .endOf(d)
               .valueOf()
         ).toBe(
            moment()
               .endOf(d)
               .valueOf()
         );
      });
   });

   it('StartOf EndOf Other -> no change', () => {
      expect(
         dateTime()
            .startOf('otherString')
            .valueOf()
      ).toBe(
         moment()
            .startOf('otherString')
            .valueOf()
      );
      expect(
         dateTime()
            .endOf('otherString')
            .valueOf()
      ).toBe(
         moment()
            .endOf('otherString')
            .valueOf()
      );
   });
});

it('Add Time days', () => {
   expect(
      dateTime()
         .add(1, 's')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 's')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'seconds')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'seconds')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'm')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'm')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'minutes')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'minutes')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'h')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'h')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'hours')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'hours')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'w')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'w')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'weeks')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'weeks')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'd')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'd')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'days')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'days')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'M')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'M')
         .valueOf()
   );
   expect(
      dateTime()
         .add(1, 'y')
         .valueOf()
   ).toBe(
      moment()
         .add(1, 'y')
         .valueOf()
   );
   expect(
      dateTime('20111031')
         .add(1, 'months')
         .valueOf()
   ).toBe(
      moment('20111031')
         .add(1, 'months')
         .valueOf()
   );
});

it('Subtract Time days', () => {
   expect(
      dateTime()
         .subtract(1, 'days')
         .valueOf()
   ).toBe(
      moment()
         .subtract(1, 'days')
         .valueOf()
   );
});
