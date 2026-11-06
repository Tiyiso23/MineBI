/**
 * South African Currency (ZAR / Rands) & South Africa Standard Time (SAST, UTC+2) Formatters
 */

export function formatZAR(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'R 0.00';
  }

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `R ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `R ${(amount / 1_000).toFixed(1)}k`;
  }

  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCostPerTon(costPerTon: number): string {
  return `R ${costPerTon.toFixed(2)} / ton`;
}

/**
 * Formats a date/timestamp into South Africa Standard Time (SAST, UTC+2)
 */
export function formatSASTDateTime(dateInput?: string | number | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return 'Invalid Date';

  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${formatter.format(date)} SAST`;
}

export function formatSASTDate(dateInput?: string | number | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return 'Invalid Date';

  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return formatter.format(date);
}

export function formatSASTTime(dateInput?: string | number | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return '--:--';

  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${formatter.format(date)} SAST`;
}

/**
 * Returns active South African mining shift based on current SAST time:
 * Day Shift: 06:00 - 18:00 SAST
 * Night Shift: 18:00 - 06:00 SAST
 */
export function getSASTShiftDetails(): {
  timeStr: string;
  shiftName: 'Day Shift' | 'Night Shift';
  shiftCode: 'Shift A' | 'Shift B';
  hoursRemaining: number;
} {
  const now = new Date();
  // Get hour in SAST
  const hourPart = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    hour: 'numeric',
    hour12: false,
  }).format(now);

  const sastHour = parseInt(hourPart, 10);
  const isDayShift = sastHour >= 6 && sastHour < 18;

  const hoursRemaining = isDayShift ? 18 - sastHour : sastHour >= 18 ? 30 - sastHour : 6 - sastHour;

  return {
    timeStr: formatSASTTime(now),
    shiftName: isDayShift ? 'Day Shift' : 'Night Shift',
    shiftCode: isDayShift ? 'Shift A' : 'Shift B',
    hoursRemaining,
  };
}
