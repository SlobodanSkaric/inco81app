export function dataUtils(datasandtimes: string): Date {
    const [dataParts, timeParts] = datasandtimes.split(" ");

    if(!dataParts || !timeParts){
        throw new Error("Invalid date and time format");
    }

    const[year, mount, day] = dataParts.split("-").map(Number);
    const[hours, minutes, seconds] = timeParts.split(":").map(Number);

    if ([year, mount, day, hours, minutes, seconds].some((n) => Number.isNaN(n))) {
        throw new Error("Invalid date and time format");
    }

    const date = new Date(year, mount - 1, day, hours, minutes, seconds);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== mount - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hours ||
        date.getMinutes() !== minutes ||
        date.getSeconds() !== seconds
    ) {
        throw new Error("Invalid calendar date or time");
    }

    return date;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

export function curentDateFormatToISOString(date: Date = new Date()): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Calendar day as YYYY-MM-DD so lexicographic order matches chronological order. */
export function calendarDateKey(value: string): string | null {
    const datePart = value.trim().split(/[T ]/)[0];
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(datePart);
    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    const probe = new Date(year, month - 1, day);
    if (
        probe.getFullYear() !== year ||
        probe.getMonth() !== month - 1 ||
        probe.getDate() !== day
    ) {
        return null;
    }

    return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Inclusive local-day bounds for YYYY-MM-DD keys. */
export function calendarRangeBounds(startDateKey: string, endDateKey: string): { start: Date; end: Date } {
    const [ys, ms, ds] = startDateKey.split("-").map(Number);
    const [ye, me, de] = endDateKey.split("-").map(Number);
    return {
        start: new Date(ys, ms - 1, ds, 0, 0, 0, 0),
        end: new Date(ye, me - 1, de, 23, 59, 59, 999),
    };
}

/** Milliseconds of [shiftStart, shiftEnd] that fall inside [rangeStart, rangeEnd]. */
export function clippedOverlapMs(
    shiftStart: Date,
    shiftEnd: Date,
    rangeStart: Date,
    rangeEnd: Date,
): number {
    const start = Math.max(shiftStart.getTime(), rangeStart.getTime());
    const end = Math.min(shiftEnd.getTime(), rangeEnd.getTime());
    return Math.max(0, end - start);
}