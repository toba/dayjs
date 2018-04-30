import { is, Time, leadingZeros, month, weekday } from '@toba/tools';
import { DateLike } from '../';
import * as Utils from './utils';

/**
 * Parse
 */
function parseDateValue(d?: DateLike): Date {
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

export class DateTime {
   private date: Date;
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
      this.date = parseDateValue(dateValue);
      this.initialize();
   }

   /**
    * Update local copies of `Date` values.
    */
   private initialize(): DateTime {
      const d = this.date;
      this.timeZoneOffset = d.getTimezoneOffset() / 60;
      this.timeZone = (this.timeZoneOffset - 1)
         .toString()
         .replace(/^(.)?(\d)/, '$10$200');

      // this.$zoneStr = Utils.padStart(
      //    String(this.$zone * -1).replace(/^(.)?(\d)/, '$10$200'),
      //    5,
      //    '+'
      // );

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
      return !(this.date.toString() === 'Invalid Date');
   }

   isLeapYear(): boolean {
      return (
         (this.year % 4 === 0 && this.year % 100 !== 0) || this.year % 400 === 0
      );
   }

   isSame(other: Time): boolean {
      return this.valueOf() === other.valueOf();
   }

   isBefore(other: Time): boolean {
      return this.valueOf() < other.valueOf();
   }

   isAfter(other: Time): boolean {
      return this.valueOf() > other.valueOf();
   }

   get unix(): number {
      return Math.floor(this.valueOf() / 1000);
   }

   /**
    * Number of milliseconds since midnight, January 1, 1970.
    */
   valueOf() {
      return this.date.getTime();
   }

   startOf(unit: Time, isStartOf = true): DateTime {
      const instanceFactory = (d: number, m: number, y = this.year) => {
         const dt = new DateTime(new Date(y, m, d));
         return isStartOf ? dt : dt.endOf(Time.Day);
      };

      const instanceFactorySet = (method: string, slice: number) => {
         const start = [0, 0, 0, 0];
         const end = [23, 59, 59, 999];

         return new DateTime(
            this.toDate()[method].apply(
               this.toDate(),
               isStartOf ? start.slice(slice) : end.slice(slice)
            )
         );
      };
      switch (unit) {
         case Time.Year:
            return isStartOf
               ? instanceFactory(1, 0)
               : instanceFactory(31, 11, this.year);
         case Time.Month:
            return isStartOf
               ? instanceFactory(1, this.month)
               : instanceFactory(0, this.month + 1, this.year);
         case Time.Week:
            return isStartOf
               ? instanceFactory(this.dayOfMonth - this.dayOfWeek, this.month)
               : instanceFactory(
                    this.dayOfMonth + (6 - this.dayOfWeek),
                    this.month,
                    this.year
                 );
         case Time.Day:
            return instanceFactorySet('setHours', 0);
         case Time.Hour:
            return instanceFactorySet('setMinutes', 1);
         case Time.Minute:
            return instanceFactorySet('setSeconds', 2);
         case Time.Second:
            return instanceFactorySet('setMilliseconds', 3);
         default:
            return this.clone();
      }
   }

   /**
    * DateTime at the end of given timespan.
    */
   endOf(unit: Time): DateTime {
      return this.startOf(unit, false);
   }

   /**
    * Update `DateTime` value. This is meant for internal use only
    * @param unit Unit of time to change
    * @param value Value to change it to
    */
   private update(unit: Time, value: number) {
      switch (unit) {
         case Time.Day:
            this.date.setDate(value);
            break;
         case Time.Month:
            this.date.setMonth(value);
            break;
         case Time.Year:
            this.date.setFullYear(value);
            break;
         case Time.Hour:
            this.date.setHours(value);
            break;
         case Time.Minute:
            this.date.setMinutes(value);
            break;
         case Time.Second:
            this.date.setSeconds(value);
            break;
         case Time.Millisecond:
            this.date.setMilliseconds(value);
            break;
         default:
            break;
      }
      return this.initialize();
   }

   set(unit: Time, value: number) {
      return is.number(value) ? this.clone().update(unit, value) : this;
   }

   add(value: number, unit: Time): DateTime {
      if (['M', C.M].indexOf(unit) > -1) {
         let date = this.set(C.DATE, 1).set(C.M, this.$M + value);
         date = date.set(C.DATE, Math.min(this.dayOfMonth, date.daysInMonth()));
         return date;
      }
      if (['y', C.Y].indexOf(unit) > -1) {
         return this.set(C.Y, this.$y + value);
      }
      const nextTimeStamp = this.valueOf() + value * unit;
      return new DateTime(nextTimeStamp);
   }

   subtract(value: number, unit: Time): DateTime {
      return this.add(value * -1, unit);
   }

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

   diff(other: DateLike | DateTime, unit: Time, float = false) {
      if (!(other instanceof DateTime)) {
         other = parseDateValue(other);
      }

      const that = input instanceof DateTime ? input : new DateTime(input);
      const diff = this - that;
      let result = Utils.monthDiff(this, that);
      switch (unit) {
         case Time.Year:
            result /= 12;
            break;
         case C.M:
            break;
         case C.Q:
            result /= 3;
            break;
         case Time.Week:
            result = diff / C.MILLISECONDS_A_WEEK;
            break;
         case Time.Day:
            result = diff / C.MILLISECONDS_A_DAY;
            break;
         case Time.Second:
            result = diff / C.MILLISECONDS_A_SECOND;
            break;
         default:
            // milliseconds
            result = diff;
      }
      return float ? result : Utils.absFloor(result);
   }

   /**
    * Number of days in the month.
    */
   get daysInMonth(): number {
      return this.endOf(Time.Month).dayOfMonth;
   }

   clone(): DateTime {
      return new DateTime(this.date);
   }

   toDate(): Date {
      return this.date;
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
      return this.date.toUTCString();
   }
}

export const dateTime = (dateValue?: DateLike) => new DateTime(dateValue);
