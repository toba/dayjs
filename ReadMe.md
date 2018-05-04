[![npm package](https://img.shields.io/npm/v/@toba/time.svg)](https://www.npmjs.org/package/@toba/time)
[![Build Status](https://travis-ci.org/toba/time.svg?branch=master)](https://travis-ci.org/toba/time)
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
[![Dependencies](https://img.shields.io/david/toba/time.svg)](https://david-dm.org/toba/time)
[![DevDependencies](https://img.shields.io/david/dev/toba/time.svg)](https://david-dm.org/toba/time#info=devDependencies&view=list)
[![codecov](https://codecov.io/gh/toba/tools/branch/master/graph/badge.svg)](https://codecov.io/gh/toba/time)

> @toba/time is a minimalist JavaScript library for modern browsers with a largely Moment.js-compatible API. If you use Moment.js, you already know how to use @toba/time.

```ts
dateTime()
   .startOf('month')
   .add(1, 'day')
   .set('year', 2018)
   .format('YYYY-MM-DD HH:mm:ss');
```

*  🕒 Familiar Moment.js API & patterns
*  💪 Immutable
*  🔥 Chainable
*  📦 2kb mini library
*  👫 All browsers support

---

## Installation

You have multiple ways of getting Day.js:

*  Via NPM:

```console
npm install dayjs --save
```

```ts
var dayjs = require('dayjs');
dateTime().format();
```

*  Via CDN:

```html
<!-- Latest compiled and minified JavaScript -->
<script src="https://unpkg.com/dayjs"></script>
<script>
  dateTime().format();
</script>
```

*  Via download and self-hosting:

Just download the latest version of Day.js at [https://unpkg.com/dayjs](https://unpkg.com/dayjs)

## Getting Started

Instead of modifying the native `Date.prototype`, Day.js creates a wrapper for the Date object, called `DateTime` object.
`DateTime` object is immutable, that is to say, all API operation will return a new `DateTime` object.

## API

API will always return a new `DateTime` object if not specified.

*  [Parse](#parse)
   *  [Now](#now)
   *  [String](#string)
   *  [Unix Timestamp (milliseconds)](#unix-timestamp-milliseconds)
   *  [Date](#date)
   *  [Clone](#clone)
   *  [Validation](#validation)
*  [Get + Set](#get--set)
   *  [Year](#year)
   *  [Month](#month)
   *  [Date of Month](#date-of-month)
   *  [Hour](#hour)
   *  [Minute](#minute)
   *  [Second](#second)
   *  [Millisecond](#millisecond)
   *  [Set](#set)
*  [Manipulate](#manipulate)
   *  [Add](#add)
   *  [Subtract](#subtract)
   *  [Start of Time](#start-of-time)
   *  [End of Time](#end-of-time)
*  [Display](#display)
   *  [Format](#format)
   *  [Difference](#different)
   *  [Unix Timestamp (milliseconds)](#unix-timestamp-milliseconds-1)
   *  [Unix Timestamp (seconds)](#unix-timestamp-seconds)
   *  [Days in Month](#days-in-month)
   *  [As Javascript Date](#as-javascript-date)
   *  [As Array](#as-array)
   *  [As JSON](#as-json)
   *  [As ISO 8601 String](#as-iso-8601-string)
   *  [As Object](#as-object)
   *  [As String](#as-string)
*  [Query](#query)
   *  [Is Before](#is-before)
   *  [Is Same](#is-same)
   *  [Is After](#is-after)
   *  [Is Leap Year](#is-leap-year)

---

### Parse

Simply call `dateTime()` with one of the supported input types.

#### Now

To get the current date and time, just call dateTime() with no parameters.

```ts
dateTime();
```

### String

Creating from a string matches [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.

```ts
dateTime(String);
dateTime('1995-12-25');
```

### Unix Timestamp (milliseconds)

Passing an integer value representing the number of milliseconds since the Unix Epoch (Jan 1 1970 12AM UTC).

```ts
dateTime(Number);
dateTime(1318781876406);
```

### Date

Passing a pre-existing native Javascript Date object.

```ts
dateTime(Date);
dateTime(new Date(2018, 8, 18));
```

### Clone

All `DateTime` are immutable. If you want a copy of the object, just call `.clone()`.
Calling dateTime() on a `DateTime` object will also clone it.

```ts
dateTime(Dayjs);
dateTime().clone();
```

### Validation

*  returns a Boolean

Check whether the `DateTime` object considers the date invalid.

```ts
dateTime().isValid();
```

---

### Get + Set

Get and set date.

#### Year

*  returns a Number

Get year.

```ts
dateTime().year;
```

#### Month

*  returns a Number

Get month.

```ts
dateTime().month;
```

#### Date of Month

*  returns a Number

Get day of the month.

```ts
dateTime().date;
```

#### Hour

*  returns a Number

Get hour.

```ts
dateTime().hour;
```

#### Minute

*  returns a Number

Get minute.

```ts
dateTime().minute;
```

#### Second

*  returns a Number

Get second.

```ts
dateTime().second;
```

#### Millisecond

*  returns a Number

Get millisecond.

```ts
dateTime().millisecond;
```

#### Set

Date setter.
Units are case insensitive

```ts
dateTime().set((unit: String), (value: Int));
dateTime().set('month', 3); // April
dateTime().set('second', 30);
```

---

### Manipulate

Once you have a `DateTime` object, you may want to manipulate it in some way like this:

```ts
dateTime()
   .startOf('month')
   .add(1, 'day')
   .subtract(1, 'year');
```

#### Add

Returns a new `DateTime` object by adding time.

```ts
dateTime().add((value: Number), (unit: String));
dateTime().add(7, 'day');
```

#### Subtract

Returns a new `DateTime` object by subtracting time. exactly the same as `dateTime#add`.

```ts
dateTime().subtract((value: Number), (unit: String));
dateTime().subtract(7, 'year');
```

#### Start of Time

Returns a new `DateTime` object by by setting it to the start of a unit of time.

```ts
dateTime().startOf((unit: String));
dateTime().startOf('year');
```

#### End of Time

Returns a new `DateTime` object by by setting it to the end of a unit of time.

```ts
dateTime().endOf((unit: String));
dateTime().endOf('month');
```

---

### Display

Once parsing and manipulation are done, you need some way to display the `DateTime` object.

#### Format

*  returns a String

Takes a string of tokens and replaces them with their corresponding date values.

```ts
dateTime().format(String);
dateTime().format(); // "2014-09-08T08:02:17-05:00" (ISO 8601, no fractional seconds)
dateTime().format('[YYYY] MM-DDTHH:mm:ssZ'); // "[2014] 09-08T08:02:17-05:00"
```

List of all available formats:

| Format | Output           | Description                           |
| ------ | ---------------- | ------------------------------------- |
| `YY`   | 18               | Two digit year                        |
| `YYYY` | 2018             | Four digit year                       |
| `M`    | 1-12             | The month, beginning at 1             |
| `MM`   | 01-12            | The month, with preceeding 0          |
| `MMM`  | Jan-Dec          | The abbreviated month name            |
| `MMMM` | January-December | The full month name                   |
| `D`    | 1-31             | The day of the month                  |
| `DD`   | 01-31            | The day of the month, preceeding 0    |
| `d`    | 0-6              | The day of the week, with Sunday as 0 |
| `dddd` | Sunday-Saturday  | The name of the day of the week       |
| `H`    | 0-23             | The hour                              |
| `HH`   | 00-23            | The hour, with preceeding 0           |
| `m`    | 0-59             | The minute                            |
| `mm`   | 00-59            | The minute, with preceeding 0         |
| `s`    | 0-59             | The second                            |
| `ss`   | 00-59            | The second, with preceeding 0         |
| `Z`    | +5:00            | The offset from UTC                   |
| `ZZ`   | +0500            | The offset from UTC with preceeding 0 |

#### Difference

*  returns a Number

Get the difference of two `DateTime` object in milliseconds or other unit.

```ts
dateTime().diff(Dayjs, unit);
dateTime().diff(dateTime(), 'years'); // 0
```

#### Unix Timestamp (milliseconds)

*  returns a Number

Outputs the number of milliseconds since the Unix Epoch

```ts
dateTime().valueOf();
```

#### Unix Timestamp (seconds)

*  returns a Number

Outputs a Unix timestamp (the number of seconds since the Unix Epoch).

```ts
dateTime().unix();
```

#### Days in Month

*  returns a Number

Get the number of days in the current month.

```ts
dateTime().daysInMonth();
```

#### As JavaScript Date

*  returns a JavaScript `Date` object

Get copy of the native `Date` object from `DateTime` object.

```ts
dateTime().toDate();
```

#### As Array

*  returns a Array

Returns an array that mirrors the parameters from new Date().

```ts
dateTime().toArray(); //[2018, 8, 18, 00, 00, 00, 000];
```

#### As JSON

*  returns a JSON String

Serializing an `DateTime` to JSON, will return an ISO8601 string.

```ts
dateTime().toJSON(); //"2018-08-08T00:00:00.000Z"
```

#### As ISO 8601 String

*  returns a String

Formats a string to the ISO8601 standard.

```ts
dateTime().toISOString();
```

#### As Object

*  returns a Object

Returns an object with year, month ... millisecond.

```ts
dateTime().toObject(); // { years:2018, months:8, date:18, hours:0, minutes:0, seconds:0, milliseconds:0}
```

#### As String

*  returns a String

```ts
dateTime().toString();
```

---

### Query

#### Is Before

*  returns a Boolean

Check if a `DateTime` object is before another `DateTime` object.

```ts
dateTime().isBefore(DateTime);
dateTime().isBefore(dateTime()); // false
```

#### Is Same

*  returns a Boolean

Check if a `DateTime` object is same as another `DateTime` object.

```ts
dateTime().isSame(DateTime);
dateTime().isSame(dateTime()); // true
```

#### Is After

*  returns a Boolean

Check if a `DateTime` object is after another `DateTime` object.

```ts
dateTime().isAfter(DateTime);
dateTime().isAfter(dateTime()); // false
```

#### Is Leap Year

*  returns a Boolean

Check if a year is a leap year.

```ts
dateTime().isLeapYear();
dateTime('2000-01-01').isLeapYear(); // true
```

---

## License

MIT
