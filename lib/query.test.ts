import moment from 'moment';
import MockDate from 'mockdate';
import { dateTime } from '../';

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

const testArr = [dateTime, moment];

test('identifies leap years', () => {
   expect(dateTime('20000101').isLeapYear()).toBe(true);
   expect(dateTime('2100-01-01').isLeapYear()).toBe(false);
});

it('Is Before Is After Is Same', () => {
   testArr.forEach(instance => {
      const d1 = instance();
      const d2 = d1.clone().add(1, 'day');
      const d3 = d1.clone().subtract(1, 'day');
      expect(d3.isBefore(d1)).toBe(true);
      expect(d1.isSame(instance())).toBe(true);
      expect(d2.isAfter(d1)).toBe(true);
   });
});
