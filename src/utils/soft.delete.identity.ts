/** Tombstone unique email/phone on soft-delete so values can be reused. */

export function softDeleteEmail(email: string, userId: number): string {
    const prefix = `deleted.${userId}.`;
    const maxOrig = Math.max(0, 128 - prefix.length);
    return `${prefix}${email.slice(0, maxOrig)}`;
}

export function restoreSoftDeleteEmail(email: string, userId: number): string | null {
    const prefix = `deleted.${userId}.`;
    if (!email.startsWith(prefix)) {
        return null;
    }
    return email.slice(prefix.length);
}

export function softDeletePhone(phone: string, userId: number): string {
    const prefix = `d.${userId}.`;
    const maxOrig = Math.max(0, 128 - prefix.length);
    return `${prefix}${phone.slice(0, maxOrig)}`;
}

export function restoreSoftDeletePhone(phone: string, userId: number): string | null {
    const prefix = `d.${userId}.`;
    if (!phone.startsWith(prefix)) {
        return null;
    }
    return phone.slice(prefix.length);
}

export function isSoftDeletedEmail(email: string, userId: number): boolean {
    return email.startsWith(`deleted.${userId}.`);
}
