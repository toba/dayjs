import { Duration, is, Month } from '@toba/tools';
import { DateTime } from './time';

/**
 * Types that can represent a date.
 */
export type DateLike = Date | string | number;

/**
 * Convert date compatible values into an EcmaScript date. If text, the value
 * is expected to be ordered year, month, day.
 */
export function parseDateValue(value?: DateLike): Date {
   if (value === null) {
      // null yields invalid date
      return new Date(NaN);
   }
   if (value === undefined) {
      return new Date();
   }
   if (is.date(value)) {
      return value;
   }
   if (is.text(value)) {
      const matches = value.match(/^(\d{4})-?(\d{2})-?(\d{1,2})$/);
      if (is.array<string>(matches)) {
         // 2018-08-08 or 20180808
         const d = parseInt(matches[3]);
         const m = parseInt(matches[2]) - 1;
         if (d == 0 || m < 0) {
            throw Error(`Could not parse date: "${value}"`);
         }
         return new Date(parseInt(matches[1]), m, d);
      }
   }
   return new Date(value);
}

/**
 * Round basic date to nearest `Duration` unit.
 */
export function roundDate(
   base: Date,
   unit: Duration,
   atStartOf = true,
   isUTC = false
): Date {
   const d = new Date(base);
   /**
    * Reset values for hours, minutes, seconds and milliseconds.
    */
   const timeValues: [number, number, number, number] = atStartOf
      ? [0, 0, 0, 0]
      : [23, 59, 59, 999];
   /**
    * Create new `Date` for given month, day and year.
    */
   const create = (
      day: number,
      m = base.getMonth(),
      y = base.getFullYear()
   ): Date =>
      isUTC
         ? new Date(Date.UTC(y, m, day, ...timeValues))
         : new Date(y, m, day, ...timeValues);

   switch (unit) {
      case Duration.Second:
         const s = timeValues.slice(3)[0] as number;
         if (isUTC) {
            d.setUTCMilliseconds(s);
         } else {
            d.setMilliseconds(s);
         }
         return d;
      case Duration.Minute:
         const m = timeValues.slice(2) as [number, number];
         if (isUTC) {
            d.setUTCSeconds(...m);
         } else {
            d.setSeconds(...m);
         }
         return d;
      case Duration.Hour:
         const h = timeValues.slice(2) as [number, number, number];
         if (isUTC) {
            d.setUTCMinutes(...h);
         } else {
            d.setMinutes(...h);
         }
         return d;
      case Duration.Day:
         if (isUTC) {
            d.setUTCHours(...timeValues);
         } else {
            d.setHours(...timeValues);
         }
         return d;
      case Duration.Week:
         // TODO: handle locale week start
         // https://github.com/iamkun/dayjs/blob/dev/src/index.js#L184
         const weekStartDay = 0;
         const dayOfWeek = d.getDay();
         const dayOfMonth = d.getDate();
         const gap =
            (dayOfWeek < weekStartDay ? dayOfWeek + 7 : dayOfWeek) -
            weekStartDay;

         return atStartOf
            ? create(dayOfMonth - gap)
            : create(dayOfMonth + (6 - gap));
      case Duration.Month:
         return atStartOf ? create(1) : create(0, d.getMonth() + 1);
      case Duration.Year:
         return atStartOf
            ? create(1, Month.January)
            : create(31, Month.December);
   }
   return d;
}

/**
 * DateTime truncated to start or end of a given timespan.
 * @param base `DateTime` to be copied
 * @param unit `Duration` to round to
 * @param atStartOf Return start rather than end boundary
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L158
 */
export const copyAndRound = (
   base: DateTime,
   unit: Duration,
   atStartOf = true
): DateTime =>
   new DateTime(roundDate(base.toDate(), unit, atStartOf, base.isUTC));

/**
 * How many months apart are two dates.
 *
 * @see https://github.com/moment/moment/blob/c58511b94eba1000c1d66b23e9a9ff963ff1cc89/moment.js#L3277
 */
export const monthsApart = (a: DateTime, b: DateTime) => {
   const wholeMonths = (b.year - a.year) * 12 + (b.month - a.month);
   const anchor = a.clone().add(wholeMonths, Duration.Month);
   let anchor2: DateTime;
   let adjust: number;

   if (b.minus(anchor) < 0) {
      anchor2 = a.clone().add(wholeMonths - 1, Duration.Month);
      adjust = b.minus(anchor) / anchor.minus(anchor2);
   } else {
      anchor2 = a.clone().add(wholeMonths + 1, Duration.Month);
      adjust = b.minus(anchor) / anchor2.minus(anchor);
   }
   return wholeMonths + adjust;
};

export const absFloor = (n: number) =>
   n < 0 ? Math.ceil(n) || 0 : Math.floor(n);

export function zoneText(zoneOffset: number): string {
   const hour = zoneOffset * -1;
   const replacer = hour > -10 && hour < 10 ? '$10$200' : '$1$200';
   return String(hour)
      .replace(/^(.)?(\d)/, replacer)
      .padStart(5, '+');
}

/**
 * Number of days in the month.
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L353
 */
export const daysInMonth = (d: Date): number =>
   roundDate(d, Duration.Month, false).getDate();

/**
 * Update given unit of `Date` (returns same instance, not clone).
 * @param unit Unit of time to change
 * @param value Value to change it to
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L206
 */
export function setUnitValue(
   d: Date,
   unit: Duration,
   value: number,
   isUTC = false
): Date {
   switch (unit) {
      case Duration.Year:
      case Duration.Month:
         const dayOfMonth = d.getDate();
         // set to first day so month or year update doesn't cause
         // unexpected roll-over
         setUnitValue(d, Duration.Day, 1, isUTC);

         if (unit == Duration.Year) {
            if (isUTC) {
               d.setUTCFullYear(value);
            } else {
               d.setFullYear(value);
            }
         } else {
            if (isUTC) {
               d.setUTCMonth(value);
            } else {
               d.setMonth(value);
            }
         }
         const restoreDay = Math.min(dayOfMonth, daysInMonth(d));
         setUnitValue(d, Duration.Day, restoreDay, isUTC);
         break;
      case Duration.Day:
         if (isUTC) {
            d.setUTCDate(value);
         } else {
            d.setDate(value);
         }
         break;
      case Duration.Hour:
         if (isUTC) {
            d.setUTCHours(value);
         } else {
            d.setHours(value);
         }
         break;
      case Duration.Minute:
         if (isUTC) {
            d.setUTCMinutes(value);
         } else {
            d.setMinutes(value);
         }
         break;
      case Duration.Second:
         if (isUTC) {
            d.setUTCSeconds(value);
         } else {
            d.setSeconds(value);
         }
         break;
      case Duration.Millisecond:
         if (isUTC) {
            d.setUTCMilliseconds(value);
         } else {
            d.setMilliseconds(value);
         }
         break;
   }
   return d;
}
