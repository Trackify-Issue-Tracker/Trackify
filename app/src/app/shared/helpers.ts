// Shared constants and helper functions used by the pages and dialogs
import { HttpErrorResponse } from '@angular/common/http';
import { Issue, ItemPriority, ItemStatus, ItemType } from '../api.service';

export const STATUSES: ItemStatus[] = Object.values(ItemStatus);
export const PRIORITIES: ItemPriority[] = Object.values(ItemPriority);
export const TYPES: ItemType[] = Object.values(ItemType);

export const PRIORITY_RANK: Record<string, number> = {
    [ItemPriority.Critical]: 0,
    [ItemPriority.High]: 1,
    [ItemPriority.Medium]: 2,
    [ItemPriority.Low]: 3,
};

export const TYPE_ICONS: Record<string, string> = {
    [ItemType.Bug]: 'bug',
    [ItemType.Task]: 'check-circle',
    [ItemType.Improvement]: 'trending-up',
    [ItemType.Feature]: 'sparkle',
    [ItemType.Other]: 'tag',
};

/** CSS class for the colored status dot, e.g. 'In progress' -> 's-in-progress' */
export function statusClass(status: string): string {
    return 's-' + status.toLowerCase().replace(/\s+/g, '-');
}

export function isOpen(issue: Issue): boolean {
    return issue.status !== ItemStatus.Done && issue.status !== ItemStatus.Closed;
}

/** Parses a YYYY-MM-DD (or full ISO) string as a local date. Returns null if it is empty/invalid. */
export function parseDate(value?: string | null): Date | null {
    if (!value) { return null; }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    // The API returns timestamps like '2026-10-10 00:23:42.66', which not every browser can parse as is
    const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value.replace(' ', 'T'));
    return isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole days from today until the due date (negative when overdue), null if there is no due date */
export function daysUntilDue(issue: Issue): number | null {
    const due = parseDate(issue.date_due);
    if (!due) { return null; }
    return Math.round((due.getTime() - startOfToday().getTime()) / 86400000);
}

export function isOverdue(issue: Issue): boolean {
    const days = daysUntilDue(issue);
    return days !== null && days < 0 && isOpen(issue);
}

export function dueLabel(issue: Issue): string {
    const days = daysUntilDue(issue);
    if (days === null) { return ''; }
    // Finished issues are never overdue, just show the date
    if (!isOpen(issue)) { return issue.date_due ?? ''; }
    if (days < 0) { return `${-days}d overdue`; }
    if (days === 0) { return 'Due today'; }
    if (days === 1) { return 'Due tomorrow'; }
    return `Due in ${days}d`;
}

/** Labels are stored as a comma separated string */
export function splitLabels(labels?: string | null): string[] {
    return (labels ?? '').split(',').map(label => label.trim()).filter(label => label.length > 0);
}

/** Today as YYYY-MM-DD, used for the started/closed timestamps */
export function today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The fields to send to the API when an item moves to a new status */
export function statusChange(item: { date_started?: string; date_closed?: string }, status: ItemStatus):
    { status: ItemStatus; date_started?: string; date_closed?: string } {
    const patch: { status: ItemStatus; date_started?: string; date_closed?: string } = { status };
    if (status === ItemStatus.InProgress && !item.date_started) {
        patch.date_started = today();
    }
    if ((status === ItemStatus.Done || status === ItemStatus.Closed) && !item.date_closed) {
        patch.date_closed = today();
    }
    return patch;
}

/** Sorts by priority (most urgent first) and then by due date (soonest first, no due date last) */
export function byUrgency(a: Issue, b: Issue): number {
    const priority = (PRIORITY_RANK[a.priority ?? ''] ?? 4) - (PRIORITY_RANK[b.priority ?? ''] ?? 4);
    if (priority !== 0) { return priority; }
    return byDueDate(a, b);
}

export function byDueDate(a: Issue, b: Issue): number {
    const dueA = parseDate(a.date_due)?.getTime() ?? Infinity;
    const dueB = parseDate(b.date_due)?.getTime() ?? Infinity;
    if (dueA === dueB) { return 0; }
    return dueA < dueB ? -1 : 1;
}

export function errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
        return error.error?.message ?? error.message;
    }
    return error instanceof Error ? error.message : 'Something went wrong';
}

/** A stable hue (0-359) for a project's avatar, derived from its name */
export function projectHue(name: string): number {
    let hash = 0;
    for (const char of name) { hash = (hash * 31 + char.charCodeAt(0)) % 360; }
    return hash;
}

export function initial(name: string): string {
    return (name.trim()[0] ?? '?').toUpperCase();
}

/** Which bucket of the timeline an open issue falls in, based on its due date */
export function dueGroup(issue: Issue): string {
    const days = daysUntilDue(issue);
    if (days === null) { return 'No due date'; }
    if (days < 0) { return 'Overdue'; }
    if (days === 0) { return 'Today'; }
    if (days === 1) { return 'Tomorrow'; }
    if (days <= 7) { return 'This week'; }
    return 'Later';
}

export function greeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
