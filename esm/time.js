import { is, leadingZeros, month, weekday } from '@toba/tools';
/**
 * Convert date compatible values into an EcmaScript date. If text, the value
 * is expected to be ordered year, month, day.
 */
export function parseDateValue(value) {
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
        if (is.array(matches)) {
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
 * Map `Duration` to the `Date` method name used to update that time value.
 */
const durationMethod = new Map([
    [220752000000 /* Year */, 'setFullYear'],
    [220752000000 /* Month */, 'setMonth'],
    [86400000 /* Day */, 'setDate'],
    [3600000 /* Hour */, 'setHours'],
    [60000 /* Minute */, 'setMinutes'],
    [1000 /* Second */, 'setSeconds'],
    [1 /* Millisecond */, 'setMilliseconds']
]);
/**
 * Name of `Date.set` method for given time unit.
 */
export function methodName(unit, isUTC = false) {
    if (durationMethod.has(unit)) {
        const name = durationMethod.get(unit);
        return isUTC ? name.replace('set', 'setUTC') : name;
    }
    return null;
}
/**
 * Copy a `DateTime` and set it's values to either the beginning or end of the
 * given `Duration`. For example, if a `DateTime` in the middle of a month is
 * passed with `Duration.Month` and `atStartOf = true` then the output
 * `DateTime` will be the same except set to the first of the month.
 *
 * @param unit Most specific unit to retain (smaller units are reset)
 * @param atStartOf
 */
export const copyAndSetTime = (unit, basis, atStartOf = true) => {
    const method = methodName(unit, basis.isUTC);
    /**
     * Reset values for hours, minutes, seconds and milliseconds.
     */
    const resetUnits = atStartOf ? [0, 0, 0, 0] : [23, 59, 59, 999];
    if (method === null) {
        throw Error(`No set method defined for time unit ${unit} (ms)`);
    }
    const d = new Date(basis.toDate());
    let slice = 0;
    switch (unit) {
        case 1000 /* Second */:
            slice = 3;
            break;
        case 60000 /* Minute */:
            slice = 2;
            break;
        case 3600000 /* Hour */:
            slice = 1;
            break;
        case 86400000 /* Day */:
            slice = 0;
            break;
        default:
            throw Error(`Unknown duration: ${unit} ms`);
    }
    //d[method].apply(d, resetUnits.slice(slice));
    return new DateTime(d);
};
/**
 * How many months apart are two dates.
 *
 * @see https://github.com/moment/moment/blob/c58511b94eba1000c1d66b23e9a9ff963ff1cc89/moment.js#L3277
 */
export const monthsApart = (a, b) => {
    const wholeMonths = (b.year - a.year) * 12 + (b.month - a.month);
    const anchor = a.clone().add(wholeMonths, 220752000000 /* Month */);
    let anchor2;
    let adjust;
    if (b.minus(anchor) < 0) {
        anchor2 = a.clone().add(wholeMonths - 1, 220752000000 /* Month */);
        adjust = b.minus(anchor) / anchor.minus(anchor2);
    }
    else {
        anchor2 = a.clone().add(wholeMonths + 1, 220752000000 /* Month */);
        adjust = b.minus(anchor) / anchor2.minus(anchor);
    }
    return Math.abs(wholeMonths + adjust);
};
export const absFloor = (n) => n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
export function zoneText(zoneOffset) {
    const hour = zoneOffset * -1;
    const replacer = hour > -10 && hour < 10 ? '$10$200' : '$1$200';
    return String(hour)
        .replace(/^(.)?(\d)/, replacer)
        .padStart(5, '+');
}
/**
 * Convenience methods for working with dates and times, largely compatible with
 * the `Moment.js` library.
 *
 * @see https://momentjs.com/
 */
export class DateTime {
    constructor(dateValue) {
        this.esDate = parseDateValue(dateValue);
        this.initialize();
    }
    /**
     * Update local copies of `Date` values.
     */
    initialize() {
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
    isValid() {
        return this.esDate.toString() !== 'Invalid Date';
    }
    isLeapYear() {
        return ((this.year % 4 === 0 && this.year % 100 !== 0) || this.year % 400 === 0);
    }
    isSame(other, precision = 1 /* Millisecond */) {
        return (this.startOf(precision).value <= other.value &&
            other.value <= this.endOf(precision).value);
    }
    isBefore(other, precision = 1 /* Millisecond */) {
        return this.endOf(precision).value < other.value;
    }
    isAfter(other, precision = 1 /* Millisecond */) {
        return this.startOf(precision).value > other.value;
    }
    /**
     * Day of month.
     */
    get date() {
        return this.esDate.getDate();
    }
    /**
     * Number of seconds since midnight, January 1, 1970.
     */
    get unix() {
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
     * DateTime at start or end of a given timespan.
     * @param atStartOf Return start rather than end boundary
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L158
     */
    boundary(unit, atStartOf = true) {
        /**
         * Create new DateTime for given month, day and year.
         */
        const create = (d, m = this.month, y = this.year) => {
            const dt = new DateTime(this.isUTC ? Date.UTC(y, m, d) : new Date(y, m, d));
            return atStartOf ? dt : dt.endOf(86400000 /* Day */);
        };
        switch (unit) {
            case 220752000000 /* Year */:
                return atStartOf ? create(1, 0) : create(31, 11);
            case 220752000000 /* Month */:
                return atStartOf ? create(1) : create(0, this.month + 1);
            case 604800000 /* Week */:
                // TODO: handle locale week start
                // https://github.com/iamkun/dayjs/blob/dev/src/index.js#L184
                const weekStartDay = 0;
                const gap = (this.dayOfWeek < weekStartDay
                    ? this.dayOfWeek + 7
                    : this.dayOfWeek) - weekStartDay;
                return atStartOf
                    ? create(this.dayOfMonth - gap)
                    : create(this.dayOfMonth + (6 - gap));
            case 86400000 /* Day */:
            case 3600000 /* Hour */:
            case 60000 /* Minute */:
            case 1000 /* Second */:
                return copyAndSetTime(unit, this, atStartOf);
            default:
                return this.clone();
        }
    }
    /**
     * DateTime at the beginning of given timespan.
     */
    startOf(unit) {
        return this.boundary(unit, true);
    }
    /**
     * DateTime at the end of given timespan.
     */
    endOf(unit) {
        return this.boundary(unit, false);
    }
    /**
     * Update `DateTime` value.
     * @param unit Unit of time to change
     * @param value Value to change it to
     * @see https://github.com/iamkun/dayjs/blob/master/src/index.js#L206
     */
    update(unit, value) {
        const d = this.esDate;
        let _;
        switch (unit) {
            case 220752000000 /* Year */:
            case 220752000000 /* Month */:
                const firstMonthDay = this.clone().set(86400000 /* Day */, 1);
                const newDay = Math.min(this.date, firstMonthDay.daysInMonth);
                const i = firstMonthDay.esDate;
                if (unit == 220752000000 /* Year */) {
                    _ = this.isUTC ? i.setUTCFullYear(value) : i.setFullYear(value);
                }
                else {
                    _ = this.isUTC ? i.setUTCMonth(value) : i.setMonth(value);
                }
                firstMonthDay.initialize();
                this.esDate = firstMonthDay.set(86400000 /* Day */, newDay).toDate();
                break;
            case 86400000 /* Day */:
                value = this.date + (value - this.dayOfWeek);
                _ = this.isUTC ? d.setUTCDate(value) : d.setDate(value);
                break;
            case 3600000 /* Hour */:
                _ = this.isUTC ? d.setUTCHours(value) : d.setHours(value);
                break;
            case 60000 /* Minute */:
                _ = this.isUTC ? d.setUTCMinutes(value) : d.setMinutes(value);
                break;
            case 1000 /* Second */:
                _ = this.isUTC ? d.setUTCSeconds(value) : d.setSeconds(value);
                break;
            case 1 /* Millisecond */:
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
    set(unit, value) {
        return is.number(value) ? this.clone().update(unit, value) : this;
    }
    /**
     * Special handling for month and year
     * @see https://github.com/moment/moment/pull/571
     */
    add(value, unit = 1 /* Millisecond */) {
        switch (unit) {
            case 220752000000 /* Year */:
                return this.set(unit, this.year + value);
            case 220752000000 /* Month */:
                // let date = this.set(Duration.Day, 1).set(unit, this.month + value);
                // date = date.set(
                //    Duration.Day,
                //    Math.min(this.dayOfMonth, date.daysInMonth)
                // );
                // return date;
                return this.set(unit, this.month + value);
            case 604800000 /* Week */:
                return this.set(86400000 /* Day */, this.date + value);
            case 86400000 /* Day */:
                return this.set(unit, this.date + value * 7);
            default:
                const nextTimeStamp = this.value + value * unit;
                return new DateTime(nextTimeStamp);
        }
    }
    subtract(value, unit = 1 /* Millisecond */) {
        return this.add(value * -1, unit);
    }
    /**
     * Difference in milliseconds.
     */
    minus(other) {
        return this.value - other.value;
    }
    /**
     *
     * @see https://momentjs.com/docs/#/displaying/format/
     */
    format(pattern = 'YYYY-MM-DDTHH:mm:ssZ') {
        return pattern.replace(/Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|m{1,2}|s{1,2}|Z{1,2}/g, match => {
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
        });
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
    diff(other, unit = 1 /* Millisecond */, precise = false) {
        if (!(other instanceof DateTime)) {
            other = new DateTime(other);
        }
        const diff = this.value - other.value;
        const zoneDiff = (other.utcOffset() - this.utcOffset()) * 60000 /* Minute */;
        let result = monthsApart(this, other);
        switch (unit) {
            case 220752000000 /* Year */:
                result /= 12;
                break;
            case 220752000000 /* Month */:
                break;
            case 55188000000 /* Quarter */:
                result /= 3;
                break;
            case 604800000 /* Week */:
            case 86400000 /* Day */:
                result = (diff - zoneDiff) / unit;
                break;
            case 3600000 /* Hour */:
            case 60000 /* Minute */:
            case 1000 /* Second */:
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
    get daysInMonth() {
        return this.endOf(220752000000 /* Month */).dayOfMonth;
    }
    /**
     * Create new DateTime instance with same values.
     */
    clone() {
        return new DateTime(this.esDate.getTime());
    }
    /**
     * Copy of the underlying EcmaScript date object.
     */
    toDate() {
        return new Date(this.esDate);
    }
    toArray() {
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
    toJSON() {
        return this.toISOString();
    }
    toISOString() {
        return this.esDate.toISOString();
    }
    toString() {
        return this.esDate.toUTCString();
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
export const dateTime = (dateValue) => new DateTime(dateValue);
