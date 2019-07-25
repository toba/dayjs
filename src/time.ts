import {
   is,
   Duration,
   leadingZeros,
   month,
   weekday,
   Month,
   Weekday
} from '@toba/tools';
import {
   DateLike,
   parseDateValue,
   zoneText,
   monthsApart,
   absFloor,
   copyAndRound
} from './tools';

/**
 * Convenience methods for working with dates and times, largely compatible with
 * the `Moment.js` library.
 *
 * @see https://momentjs.com/
 */
export class DateTime {
   /** Internal EcmaScript date */
   private esDate: Date;
   timeZoneOffset: number;
   timeZone: string;
   year: number;
   month: number;
   dayOfMonth: Month;
   dayOfWeek: Weekday;
   hour: number;
   minute: number;
   second: number;
   millisecond: number;
   isUTC: boolean;

   constructor(dateValue?: DateLike) {
      this.esDate = parseDateValue(dateValue);
      this.initialize();
   }

   /**
    * Update local copies of `Date` values.
    */
   private initialize(): this {
      const d = this.esDate;
      this.timeZoneOffset = d.getTimezoneOffset() / 60;
      this.timeZone = zoneText(this.timeZoneOffset);
      this.year = d.getFullYear();
      this.month = d.getMonth();
      this.dayOfMonth = d.getDate();
      this.dayOfWeek = d.getDay();
      this.hour = d.getHours();
      this.minute = d.getMinutes();
      this.second = d.getSeconds();
      this.millisecond = d.getMilliseconds();
      this.isUTC = false;

      return this;
   }

   /**
    * Whether date is valid.
    * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L95
    */
   isValid(): boolean {
      return this.esDate.toString() !== 'Invalid Date';
   }

   isLeapYear(): boolean {
      return (
         (this.year % 4 === 0 && this.year % 100 !== 0) || this.year % 400 === 0
      );
   }

   isSame(
      other: DateTime,
      precision: Duration = Duration.Millisecond
   ): boolean {
      return (
         this.startOf(precision).value <= other.value &&
         other.value <= this.endOf(precision).value
      );
   }

   isBefore(
      other: DateTime,
      precision: Duration = Duration.Millisecond
   ): boolean {
      return this.endOf(precision).value < other.value;
   }

   isAfter(
      other: DateTime,
      precision: Duration = Duration.Millisecond
   ): boolean {
      return this.startOf(precision).value > other.value;
   }

   /**
    * Day of month.
    */
   get date(): number {
      return this.esDate.getDate();
   }

   /**
    * Number of seconds since midnight, January 1, 1970.
    */
   get unix(): number {
      return Math.floor(this.value / 1000);
   }

   /**
    * Number of milliseconds since midnight, January 1, 1970.
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
    */
   valueOf() {
      return this.esDate.getTime();
   }

   /**
    * Number of milliseconds since midnight, January 1, 1970.
    */
   get value() {
      return this.valueOf();
   }

   /**
    * DateTime at the beginning of given timespan.
    */
   startOf(unit: Duration): DateTime {
      return copyAndRound(this, unit, true);
   }

   /**
    * DateTime at the end of given timespan.
    */
   endOf(unit: Duration): DateTime {
      return copyAndRound(this, unit, false);
   }

   /**
    * Update `DateTime` value.
    * @param unit Unit of time to change
    * @param value Value to change it to
    * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L206
    */
   private update(unit: Duration, value: number): this {
      const d = this.esDate;
      let _: number;

      switch (unit) {
         case Duration.Year:
         case Duration.Month:
            const firstMonthDay = this.clone().set(Duration.Day, 1);
            const newDay = Math.min(this.date, firstMonthDay.daysInMonth);
            const i = firstMonthDay.esDate;

            if (unit == Duration.Year) {
               _ = this.isUTC ? i.setUTCFullYear(value) : i.setFullYear(value);
            } else {
               _ = this.isUTC ? i.setUTCMonth(value) : i.setMonth(value);
            }
            firstMonthDay.initialize();
            this.esDate = firstMonthDay.set(Duration.Day, newDay).toDate();

            break;
         case Duration.Day:
            //value = this.date + (value - this.dayOfWeek);
            _ = this.isUTC ? d.setUTCDate(value) : d.setDate(value);
            break;
         case Duration.Hour:
            _ = this.isUTC ? d.setUTCHours(value) : d.setHours(value);
            break;
         case Duration.Minute:
            _ = this.isUTC ? d.setUTCMinutes(value) : d.setMinutes(value);
            break;
         case Duration.Second:
            _ = this.isUTC ? d.setUTCSeconds(value) : d.setSeconds(value);
            break;
         case Duration.Millisecond:
            _ = this.isUTC
               ? d.setUTCMilliseconds(value)
               : d.setMilliseconds(value);
            break;
         default:
            break;
      }

      return this.initialize();
   }

   /**
    * Update `DateTime` value.
    * @param unit Unit of time to change
    * @param value Value to change it to
    * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L233
    */
   set(unit: Duration, value: number): DateTime {
      return is.number(value) ? this.clone().update(unit, value) : this;
   }

   /**
    * Special handling for month and year
    * @see https://github.com/moment/moment/pull/571
    */
   add(value: number, unit: Duration = Duration.Millisecond): DateTime {
      switch (unit) {
         case Duration.Year:
            return this.set(unit, this.year + value);
         case Duration.Month:
            // let date = this.set(Duration.Day, 1).set(unit, this.month + value);
            // date = date.set(
            //    Duration.Day,
            //    Math.min(this.dayOfMonth, date.daysInMonth)
            // );
            // return date;
            return this.set(unit, this.month + value);
         case Duration.Week:
            return this.set(Duration.Day, this.date + value * 7);
         case Duration.Day:
            return this.set(unit, this.date + value);
         default:
            const nextTimeStamp = this.value + value * unit;
            return new DateTime(nextTimeStamp);
      }
   }

   subtract(value: number, unit: Duration = Duration.Millisecond): DateTime {
      return this.add(value * -1, unit);
   }

   /**
    * Difference in milliseconds.
    */
   minus(other: DateTime): number {
      return this.value - other.value;
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
                  return String(this.hour);
               case 'HH':
                  return leadingZeros(this.hour, 2);
               case 'm':
                  return String(this.minute);
               case 'mm':
                  return leadingZeros(this.minute, 2);
               case 's':
                  return String(this.second);
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
    * FireFox bug requires rounding offset to quarter hour.
    * @see https://github.com/moment/moment/pull/1871
    */
   utcOffset() {
      return -Math.round(this.esDate.getTimezoneOffset() / 15) * 15;
   }

   /**
    * @param precise Whether to return unit fractions
    * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L332
    */
   diff(
      other: DateLike | DateTime,
      unit: Duration = Duration.Millisecond,
      precise = false
   ): number {
      if (!(other instanceof DateTime)) {
         other = new DateTime(other);
      }
      const diff = this.value - other.value;
      const zoneDiff = (other.utcOffset() - this.utcOffset()) * Duration.Minute;
      let result = monthsApart(other, this);

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
            result = (diff - zoneDiff) / unit;
            break;
         case Duration.Hour:
         case Duration.Minute:
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
    * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L353
    */
   get daysInMonth(): number {
      return this.endOf(Duration.Month).dayOfMonth;
   }

   /**
    * Create new DateTime instance with same values.
    */
   clone(): DateTime {
      return new DateTime(this.esDate.getTime());
   }

   /**
    * Copy of the underlying EcmaScript date object.
    */
   toDate(): Date {
      return new Date(this.esDate);
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
      return this.esDate.toISOString();
   }

   toUTCString() {
      return this.esDate.toUTCString();
   }

   toString() {
      return this.toISOString();
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
}

/**
 * Method to construct a `DateTime` object.
 */
export const dateTime = (dateValue?: DateLike) => new DateTime(dateValue);
