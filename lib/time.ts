import { is, Duration, leadingZeros, month, weekday } from '@toba/tools';
import { DateLike } from '../';

/**
 * Convert date compatible values into an EcmaScript date.
 */
export function parseDateValue(d?: DateLike): Date {
   if (d === null) {
      // null yields invalid date
      return new Date(NaN);
   }
   if (d === undefined) {
      return new Date();
   }
   if (is.date(d)) {
      return d;
   }
   if (is.text(d)) {
      const matches = d.match(/^(\d{4})-?(\d{2})-?(\d{1,2})$/);
      if (is.array(matches)) {
         // 2018-08-08 or 20180808
         return new Date(
            parseInt(matches[1]),
            parseInt(matches[2]) - 1,
            parseInt(matches[3])
         );
      }
   }
   return new Date(d);
}

/**
 * Function from moment.js#monthDiff()
 */
export const monthDiff = (a: DateTime, b: DateTime) => {
   const wholeMonthDiff = (b.year - a.year) * 12 + (b.month - a.month);
   const anchor = a.clone().add(wholeMonthDiff, Duration.Month);
   let anchor2;
   let adjust;

   if (b.minus(anchor) < 0) {
      anchor2 = a.clone().add(wholeMonthDiff - 1, Duration.Month);
      adjust = b.minus(anchor) / anchor.minus(anchor2);
   } else {
      anchor2 = a.clone().add(wholeMonthDiff + 1, Duration.Month);
      adjust = b.minus(anchor) / anchor2.minus(anchor);
   }
   return Number(-(wholeMonthDiff + adjust)) || 0;
};

export const absFloor = (n: number) =>
   n < 0 ? Math.ceil(n) || 0 : Math.floor(n);

/**
 * Convenience methods for working with dates and times, largely compatible with
 * the `Moment.js` library.
 *
 * @see https://momentjs.com/
 */
export class DateTime {
   private _date: Date;
   timeZoneOffset: number;
   timeZone: string;
   year: number;
   month: number;
   dayOfMonth: number;
   dayOfWeek: number;
   hour: number;
   minute: number;
   second: number;
   millisecond: number;

   constructor(dateValue?: DateLike) {
      this._date = parseDateValue(dateValue);
      this.initialize();
   }

   /**
    * Update local copies of `Date` values.
    */
   private initialize(): DateTime {
      const d = this._date;
      this.timeZoneOffset = d.getTimezoneOffset() / 60;
      this.timeZone = (this.timeZoneOffset - 1)
         .toString()
         .replace(/^(.)?(\d)/, '$10$200')
         .padStart(5, '+');
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.dayOfMonth = d.getDate();
      this.dayOfWeek = d.getDay();
      this.hour = d.getHours();
      this.minute = d.getMinutes();
      this.second = d.getSeconds();
      this.millisecond = d.getMilliseconds();

      return this;
   }

   isValid(): boolean {
      return !(this._date.toString() === 'Invalid Date');
   }

   isLeapYear(): boolean {
      return (
         (this.year % 4 === 0 && this.year % 100 !== 0) || this.year % 400 === 0
      );
   }

   isSame(other: DateTime): boolean {
      return this.valueOf() === other.valueOf();
   }

   isBefore(other: DateTime): boolean {
      return this.valueOf() < other.valueOf();
   }

   isAfter(other: DateTime): boolean {
      return this.valueOf() > other.valueOf();
   }

   /**
    * Day of month.
    */
   get date(): number {
      return this._date.getDate();
   }

   get unix(): number {
      return Math.floor(this.valueOf() / 1000);
   }

   /**
    * Number of milliseconds since midnight, January 1, 1970.
    */
   valueOf() {
      return this._date.getTime();
   }

   /**
    * DateTime at start or end of a given timespan.
    * @param isStartOf Return start rather than end boundary
    */
   private boundary(unit: Duration, isStartOf = true): DateTime {
      /**
       * Reset values for hours, minutes, seconds and milliseconds.
       */
      const resetUnits = isStartOf ? [0, 0, 0, 0] : [23, 59, 59, 999];
      /**
       * Create new DateTime for given month, day and year.
       */
      const create = (d: number, m: number, y = this.year): DateTime => {
         const dt = new DateTime(new Date(y, m, d));
         return isStartOf ? dt : dt.endOf(Duration.Day);
      };

      /**
       * @param unit Largest unit to maintain (lesser units are reset)
       */
      const createAndSet = (unit: Duration): DateTime => {
         const d = this.toDate();

         switch (unit) {
            case Duration.Second:
               d.setMilliseconds.apply(d, resetUnits.slice(3));
               break;
            case Duration.Minute:
               d.setSeconds.apply(d, resetUnits.slice(2));
               break;
            case Duration.Hour:
               d.setMinutes.apply(d, resetUnits.slice(1));
               break;
            case Duration.Day:
               d.setHours.apply(d, resetUnits.slice(0));
               break;
         }

         return new DateTime(d);
      };

      switch (unit) {
         case Duration.Year:
            return isStartOf ? create(1, 0) : create(31, 11, this.year);
         case Duration.Month:
            return isStartOf
               ? create(1, this.month)
               : create(0, this.month + 1, this.year);
         case Duration.Week:
            return isStartOf
               ? create(this.dayOfMonth - this.dayOfWeek, this.month)
               : create(
                    this.dayOfMonth + (6 - this.dayOfWeek),
                    this.month,
                    this.year
                 );
         case Duration.Day:
         case Duration.Hour:
         case Duration.Minute:
         case Duration.Second:
            return createAndSet(unit);
         default:
            return this.clone();
      }
   }

   /**
    * DateTime at the beginning of given timespan.
    */
   startOf(unit: Duration): DateTime {
      return this.boundary(unit, true);
   }

   /**
    * DateTime at the end of given timespan.
    */
   endOf(unit: Duration): DateTime {
      return this.boundary(unit, false);
   }

   /**
    * Update `DateTime` value. This is meant for internal use only.
    * @param unit Unit of time to change
    * @param value Value to change it to
    */
   private update(unit: Duration, value: number) {
      switch (unit) {
         case Duration.Day:
            this._date.setDate(value);
            break;
         case Duration.Month:
            this._date.setMonth(value);
            break;
         case Duration.Year:
            this._date.setFullYear(value);
            break;
         case Duration.Hour:
            this._date.setHours(value);
            break;
         case Duration.Minute:
            this._date.setMinutes(value);
            break;
         case Duration.Second:
            this._date.setSeconds(value);
            break;
         case Duration.Millisecond:
            this._date.setMilliseconds(value);
            break;
         default:
            break;
      }
      return this.initialize();
   }

   set(unit: Duration, value: number): DateTime {
      return is.number(value) ? this.clone().update(unit, value) : this;
   }

   add(value: number, unit: Duration = Duration.Millisecond): DateTime {
      if (unit == Duration.Month) {
         let date = this.set(Duration.Month, 1).set(unit, this.month + value);
         date = date.set(
            Duration.Month,
            Math.min(this.dayOfMonth, date.daysInMonth)
         );
         return date;
      }
      if (unit == Duration.Year) {
         return this.set(unit, this.year + value);
      }
      const nextTimeStamp = this.valueOf() + value * unit;
      return new DateTime(nextTimeStamp);
   }

   subtract(value: number, unit: Duration = Duration.Millisecond): DateTime {
      return this.add(value * -1, unit);
   }

   /**
    * Difference in milliseconds.
    */
   minus(other: DateTime): number {
      return this.valueOf() - other.valueOf();
   }

   /**
    *
    * @see https://momentjs.com/docs/#/displaying/format/
    */
   format(pattern = 'YYYY-MM-DDTHH:mm:ssZ') {
      return pattern.replace(
         /Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|m{1,2}|s{1,2}|Z{1,2}/g,
         match => {
            switch (match) {
               case 'YY':
                  return String(this.year).slice(-2);
               case 'YYYY':
                  return String(this.year);
               case 'M':
                  return String(this.month + 1);
               case 'MM':
                  return leadingZeros(this.month + 1, 2);
               case 'MMM':
                  return month[this.month].slice(0, 3);
               case 'MMMM':
                  return month[this.month];
               case 'D':
                  return String(this.dayOfMonth);
               case 'DD':
                  return leadingZeros(this.dayOfMonth, 2);
               case 'd':
                  return String(this.dayOfWeek);
               case 'dddd':
                  return weekday[this.dayOfWeek];
               case 'H':
                  return this.hour.toString();
               case 'HH':
                  return leadingZeros(this.hour, 2);
               case 'm':
                  return this.minute.toString();
               case 'mm':
                  return leadingZeros(this.minute, 2);
               case 's':
                  return this.second.toString();
               case 'ss':
                  return leadingZeros(this.second, 2);
               case 'Z':
                  return `${this.timeZone.slice(0, -2)}:00`;
               default:
                  // 'ZZ'
                  return this.timeZone;
            }
         }
      );
   }

   /**
    * @param precise Whether to return unit fractions
    */
   diff(
      other: DateLike | DateTime,
      unit: Duration = Duration.Millisecond,
      precise = false
   ) {
      if (!(other instanceof DateTime)) {
         other = new DateTime(other);
      }
      const diff = this.valueOf() - other.valueOf();
      let result = monthDiff(this, other);
      switch (unit) {
         case Duration.Year:
            result /= 12;
            break;
         case Duration.Month:
            break;
         case Duration.Quarter:
            result /= 3;
            break;
         case Duration.Week:
         case Duration.Day:
         case Duration.Second:
            result = diff / unit;
            break;
         default:
            // milliseconds
            result = diff;
      }
      return precise ? result : absFloor(result);
   }

   /**
    * Number of days in the month.
    */
   get daysInMonth(): number {
      return this.endOf(Duration.Month).dayOfMonth;
   }

   /**
    * Create new DateTime instance with same values.
    */
   clone(): DateTime {
      return new DateTime(this._date.getTime());
   }

   /**
    * Copy of the underlying EcmaScript date object.
    */
   toDate(): Date {
      return new Date(this._date);
   }

   toArray(): number[] {
      return [
         this.year,
         this.month,
         this.dayOfMonth,
         this.hour,
         this.minute,
         this.second,
         this.millisecond
      ];
   }

   toJSON(): string {
      return this.toISOString();
   }

   toISOString() {
      return this.toDate().toISOString();
   }

   /**
    * `moment` compatible object representation.
    */
   toObject() {
      return {
         years: this.year,
         months: this.month,
         date: this.dayOfMonth,
         hours: this.hour,
         minutes: this.minute,
         seconds: this.second,
         milliseconds: this.millisecond
      };
   }

   toString() {
      return this._date.toUTCString();
   }
}

/**
 * Method to construct a `DateTime` object.
 */
export const dateTime = (dateValue?: DateLike) => new DateTime(dateValue);
