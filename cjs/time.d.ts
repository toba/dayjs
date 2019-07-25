import { Duration } from '@toba/tools';
/**
 * Types that can represent a date.
 */
export declare type DateLike = Date | string | number;
/**
 * Convert date compatible values into an EcmaScript date. If text, the value
 * is expected to be ordered year, month, day.
 */
export declare function parseDateValue(value?: DateLike): Date;
/**
 * Name of `Date.set` method for given time unit.
 */
export declare function methodName(unit: Duration, isUTC?: boolean): (keyof Date) | null;
/**
 * Copy a `DateTime` and set it's values to either the beginning or end of the
 * given `Duration`. For example, if a `DateTime` in the middle of a month is
 * passed with `Duration.Month` and `atStartOf = true` then the output
 * `DateTime` will be the same except set to the first of the month.
 *
 * @param unit Most specific unit to retain (smaller units are reset)
 * @param atStartOf
 */
export declare const copyAndSetTime: (unit: Duration.Second | Duration.Minute | Duration.Hour | Duration.Day, basis: DateTime, atStartOf?: boolean) => DateTime;
/**
 * How many months apart are two dates.
 *
 * @see https://github.com/moment/moment/blob/c58511b94eba1000c1d66b23e9a9ff963ff1cc89/moment.js#L3277
 */
export declare const monthsApart: (a: DateTime, b: DateTime) => number;
export declare const absFloor: (n: number) => number;
export declare function zoneText(zoneOffset: number): string;
/**
 * Convenience methods for working with dates and times, largely compatible with
 * the `Moment.js` library.
 *
 * @see https://momentjs.com/
 */
export declare class DateTime {
    /** Internal EcmaScript date */
    private esDate;
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
     * DateTime at start or end of a given timespan.
     * @param atStartOf Return start rather than end boundary
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L158
     */
    private boundary;
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
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L206
     */
    private update;
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
    toString(): string;
    /**
     * `moment` compatible object representation.
     */
    toObject(): {
        years: number;
        months: number;
        date: number;
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
