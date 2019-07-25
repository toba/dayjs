import { Duration, is } from '@toba/tools';
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

function round(d: Date, unit: Duration, isUTC = false, atStartOf = true): Date {
   /**
    * Reset values for hours, minutes, seconds and milliseconds.
    */
   const timeValues: [number, number, number, number] = atStartOf
      ? [0, 0, 0, 0]
      : [23, 59, 59, 999];
   /**
    * Create new DateTime for given month, day and year.
    */
   const create = (
      day: number,
      m = d.getMonth(),
      y = d.getFullYear()
   ): Date => {
      const r = isUTC ? new Date(Date.UTC(y, m, day)) : new Date(y, m, day);
      return round(r, Duration.Day, isUTC, atStartOf);
   };
   //const d = new Date(base.toDate());

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
         const gap =
            (d.getDay() < weekStartDay ? d.getDay() + 7 : d.getDay()) -
            weekStartDay;

         return atStartOf
            ? create(d.getDate() - gap)
            : create(d.getDate() + (6 - gap));
      case Duration.Month:
         return atStartOf ? create(1) : create(0, d.getMonth() + 1);
      case Duration.Year:
         return atStartOf ? create(1, 0) : create(31, 11);
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
): DateTime => {
   /**
    * Reset values for hours, minutes, seconds and milliseconds.
    */
   const timeValues: [number, number, number, number] = atStartOf
      ? [0, 0, 0, 0]
      : [23, 59, 59, 999];
   /**
    * Create new DateTime for given month, day and year.
    */
   const create = (d: number, m = base.month, y = base.year): DateTime => {
      const dt = new DateTime(
         base.isUTC ? Date.UTC(y, m, d) : new Date(y, m, d)
      );
      return atStartOf ? dt : dt.endOf(Duration.Day);
   };
   const d = new Date(base.toDate());

   switch (unit) {
      case Duration.Second:
         const s = timeValues.slice(3)[0] as number;
         if (base.isUTC) {
            d.setUTCMilliseconds(s);
         } else {
            d.setMilliseconds(s);
         }
         break;
      case Duration.Minute:
         const m = timeValues.slice(2) as [number, number];
         if (base.isUTC) {
            d.setUTCSeconds(...m);
         } else {
            d.setSeconds(...m);
         }
         break;
      case Duration.Hour:
         const h = timeValues.slice(2) as [number, number, number];
         if (base.isUTC) {
            d.setUTCMinutes(...h);
         } else {
            d.setMinutes(...h);
         }
         break;
      case Duration.Day:
         if (base.isUTC) {
            d.setUTCHours(...timeValues);
         } else {
            d.setHours(...timeValues);
         }
         break;
      case Duration.Week:
         // TODO: handle locale week start
         // https://github.com/iamkun/dayjs/blob/dev/src/index.js#L184
         const weekStartDay = 0;
         const gap =
            (base.dayOfWeek < weekStartDay
               ? base.dayOfWeek + 7
               : base.dayOfWeek) - weekStartDay;

         return atStartOf
            ? create(base.dayOfMonth - gap)
            : create(base.dayOfMonth + (6 - gap));
      case Duration.Month:
         return atStartOf ? create(1) : create(0, base.month + 1);
      case Duration.Year:
         return atStartOf ? create(1, 0) : create(31, 11);
   }

   return new DateTime(d);
};

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
   return Math.abs(wholeMonths + adjust);
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
