import { Duration } from '@toba/tools';
import { DateTime } from './time';
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
 * Round basic date to nearest `Duration` unit.
 */
export declare function roundDate(base: Date, unit: Duration, atStartOf?: boolean, isUTC?: boolean): Date;
/**
 * DateTime truncated to start or end of a given timespan.
 * @param base `DateTime` to be copied
 * @param unit `Duration` to round to
 * @param atStartOf Return start rather than end boundary
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L158
 */
export declare const copyAndRound: (base: DateTime, unit: Duration, atStartOf?: boolean) => DateTime;
/**
 * How many months apart are two dates.
 *
 * @see https://github.com/moment/moment/blob/c58511b94eba1000c1d66b23e9a9ff963ff1cc89/moment.js#L3277
 */
export declare const monthsApart: (a: DateTime, b: DateTime) => number;
export declare const absFloor: (n: number) => number;
export declare function zoneText(zoneOffset: number): string;
/**
 * Number of days in the month.
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L353
 */
export declare const daysInMonth: (d: Date) => number;
/**
 * Update given unit of `Date` (returns same instance, not clone).
 * @param unit Unit of time to change
 * @param value Value to change it to
 * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L206
 */
export declare function setUnitValue(d: Date, unit: Duration, value: number, isUTC?: boolean): Date;
