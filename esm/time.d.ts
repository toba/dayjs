import { Duration, Month, Weekday } from '@toba/tools';
import { DateLike } from './tools';
/**
 * Convenience methods for working with dates and times, largely compatible with
 * the `Moment.js` library.
 *
 * @see https://momentjs.com/
 */
export declare class DateTime {
    /** Internal EcmaScript date */
    private _date;
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
    constructor(dateValue?: DateLike);
    /**
     * Update local copies of `Date` values.
     */
    private initialize;
    /**
     * Whether date is valid.
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L95
     */
    isValid(): boolean;
    isLeapYear(): boolean;
    isSame(other: DateTime, precision?: Duration): boolean;
    isBefore(other: DateTime, precision?: Duration): boolean;
    isAfter(other: DateTime, precision?: Duration): boolean;
    /**
     * Day of month.
     */
    readonly date: number;
    /**
     * Number of seconds since midnight, January 1, 1970.
     */
    readonly unix: number;
    /**
     * Number of milliseconds since midnight, January 1, 1970.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
     */
    valueOf(): number;
    /**
     * Number of milliseconds since midnight, January 1, 1970.
     */
    readonly value: number;
    /**
     * DateTime at the beginning of given timespan.
     */
    startOf(unit: Duration): DateTime;
    /**
     * DateTime at the end of given timespan.
     */
    endOf(unit: Duration): DateTime;
    /**
     * Update `DateTime` value.
     * @param unit Unit of time to change
     * @param value Value to change it to
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L233
     */
    set(unit: Duration, value: number): DateTime;
    /**
     * Special handling for month and year
     * @see https://github.com/moment/moment/pull/571
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L241
     */
    add(value: number, unit?: Duration): DateTime;
    subtract(value: number, unit?: Duration): DateTime;
    /**
     * Difference in milliseconds.
     */
    minus(other: DateTime): number;
    /**
     *
     * @see https://momentjs.com/docs/#/displaying/format/
     */
    format(pattern?: string): string;
    /**
     * FireFox bug requires rounding offset to quarter hour.
     * @see https://github.com/moment/moment/pull/1871
     */
    utcOffset(): number;
    /**
     * @param precise Whether to return unit fractions
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L332
     */
    diff(other: DateLike | DateTime, unit?: Duration, precise?: boolean): number;
    /**
     * Number of days in the month.
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L353
     */
    readonly daysInMonth: number;
    /**
     * Create new DateTime instance with same values.
     */
    clone(): DateTime;
    /**
     * Copy of the underlying EcmaScript date object.
     */
    toDate(): Date;
    toArray(): number[];
    toJSON(): string;
    toISOString(): string;
    toUTCString(): string;
    toString(): string;
    /**
     * `moment` compatible object representation.
     */
    toObject(): {
        years: number;
        months: number;
        date: Month;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
    };
}
/**
 * Method to construct a `DateTime` object.
 */
export declare const dateTime: (dateValue?: string | number | Date | undefined) => DateTime;
