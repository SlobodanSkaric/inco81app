/** Integer cents helpers to avoid IEEE float drift on money. */

export function moneyToCents(value: unknown): number {
    const raw = String(value ?? "0").trim();
    if (!raw || raw === "NaN") {
        return 0;
    }
    const negative = raw.startsWith("-");
    const cleaned = raw.replace(/^-/, "").replace(/,/g, "");
    const [wholePart, fracPart = ""] = cleaned.split(".");
    const whole = Number(wholePart || "0");
    if (!Number.isFinite(whole)) {
        return 0;
    }

    // Half-up round to 2 decimal places (supports longer fractional tails from floats).
    const fracDigits = (fracPart + "000").slice(0, 3);
    let frac = Number(fracDigits.slice(0, 2));
    const third = Number(fracDigits[2] || "0");
    if (third >= 5) {
        frac += 1;
    }
    let cents = whole * 100 + frac;
    if (frac >= 100) {
        cents = (whole + 1) * 100 + (frac - 100);
    }
    return negative ? -cents : cents;
}

export function centsToMoney(cents: number): string {
    const negative = cents < 0;
    const abs = Math.abs(Math.trunc(cents));
    const whole = Math.floor(abs / 100);
    const frac = String(abs % 100).padStart(2, "0");
    return `${negative ? "-" : ""}${whole}.${frac}`;
}

export function sumMoneyToCents(values: unknown[]): number {
    return values.reduce<number>((sum, v) => sum + moneyToCents(v), 0);
}
