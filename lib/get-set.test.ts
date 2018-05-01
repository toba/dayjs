import '@toba/test';
import { Time } from '@toba/tools';
import moment from 'moment';
import MockDate from 'mockdate';
import { dateTime } from '../';

beforeEach(() => {
   MockDate.set(new Date());
});

afterEach(() => {
   MockDate.reset();
});

test('Year', () => {
   expect(dateTime().year).toBe(moment().year());
});

test('Month', () => {
   expect(dateTime().month).toBe(moment().month());
});

test('Date', () => {
   expect(dateTime().date).toBe(moment().date());
});

test('Hour', () => {
   expect(dateTime().hour).toBe(moment().hour());
});

test('Minute', () => {
   expect(dateTime().minute).toBe(moment().minute());
});

test('Second', () => {
   expect(dateTime().second).toBe(moment().second());
});

test('Millisecond', () => {
   expect(dateTime().millisecond).toBe(moment().millisecond());
});

test('Set Day', () => {
   expect(
      dateTime()
         .set(Time.Day, 30)
         .valueOf()
   ).toBe(
      moment()
         .set('date', 30)
         .valueOf()
   );
});

test('Set Month', () => {
   expect(
      dateTime()
         .set(Time.Month, 11)
         .valueOf()
   ).toBe(
      moment()
         .set('month', 11)
         .valueOf()
   );
});

test('Set Year', () => {
   expect(
      dateTime()
         .set(Time.Year, 2008)
         .valueOf()
   ).toBe(
      moment()
         .set('year', 2008)
         .valueOf()
   );
});

test('Set Hour', () => {
   expect(
      dateTime()
         .set(Time.Hour, 6)
         .valueOf()
   ).toBe(
      moment()
         .set('hour', 6)
         .valueOf()
   );
});

test('Set Minute', () => {
   expect(
      dateTime()
         .set(Time.Minute, 59)
         .valueOf()
   ).toBe(
      moment()
         .set('minute', 59)
         .valueOf()
   );
});

test('Set Second', () => {
   expect(
      dateTime()
         .set(Time.Second, 59)
         .valueOf()
   ).toBe(
      moment()
         .set('second', 59)
         .valueOf()
   );
});

test('Set Millisecond', () => {
   expect(
      dateTime()
         .set(Time.Millisecond, 999)
         .valueOf()
   ).toBe(
      moment()
         .set('millisecond', 999)
         .valueOf()
   );
});

test('Set Unknown String', () => {
   const newDate = dateTime().set('Unknown String', 1);
   expect(newDate.valueOf()).toBe(
      moment()
         .set('Unknown String', 1)
         .valueOf()
   );
});

test('Set Not Int', () => {
   const newDate = dateTime().set(Time.Year, 'Not Int');
   expect(newDate.valueOf()).toBe(
      moment()
         .set('year', 'Not Int')
         .valueOf()
   );
});

test('Immutable Set', () => {
   const d1 = dateTime();
   const d2 = d1.set(Time.Year, 2011);
   const m1 = moment();
   const m2 = m1.set('year', 2011);
   expect(d1.valueOf()).not.toBe(d2.valueOf());
   expect(m1.valueOf()).toBe(m2.valueOf());
});
