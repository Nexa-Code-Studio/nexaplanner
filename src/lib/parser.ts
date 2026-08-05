export interface ParsedEvent {
  title: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agustus: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9,
  nov: 10, november: 10,
  des: 11, desember: 11,
};

function parseMonth(monthStr: string): number {
  const normalized = monthStr.toLowerCase().trim();
  const month = MONTH_MAP[normalized];
  if (month === undefined) {
    // Default to January if unknown
    return 0;
  }
  return month;
}

function formatDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function parseTimelineText(text: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = text.split("\n").map(l => l.trim());
  
  if (lines.length === 0) return [];

  // Finding category
  let currentCategory = "Umum";
  let i = 0;

  // Let's assume the first line that is non-empty is the category, unless it contains a date pattern
  while (i < lines.length && lines[i] === "") {
    i++;
  }
  
  if (i < lines.length && !lines[i].match(/\d+/)) {
    currentCategory = lines[i];
    i++;
  }

  // Iterate to find Date ranges followed by titles
  while (i < lines.length) {
    const line = lines[i];
    if (line === "") {
      i++;
      continue;
    }

    // Check if it's a date line
    // Regex matches patterns like:
    // - "20 Jun - 4 Jul 2026"
    // - "5 - 15 Jul 2026"
    // - "18 Jul 2026"
    const dateRangeRegex = /^(\d+)(?:\s+([a-zA-Z\s]+))?\s*-\s*(\d+)\s+([a-zA-Z\s]+)\s+(\d{4})$/;
    const singleDateRegex = /^(\d+)\s+([a-zA-Z\s]+)\s+(\d{4})$/;

    let matchRange = line.match(dateRangeRegex);
    let matchSingle = line.match(singleDateRegex);

    if (matchRange) {
      const startDay = parseInt(matchRange[1], 10);
      const startMonthStr = matchRange[2]; // Can be undefined (e.g. 5 - 15 Jul 2026)
      const endDay = parseInt(matchRange[3], 10);
      const endMonthStr = matchRange[4];
      const year = parseInt(matchRange[5], 10);

      const endMonth = parseMonth(endMonthStr);
      const startMonth = startMonthStr ? parseMonth(startMonthStr) : endMonth;

      const startDate = formatDate(year, startMonth, startDay);
      const endDate = formatDate(year, endMonth, endDay);

      // The next non-empty line should be the event title
      i++;
      while (i < lines.length && lines[i] === "") {
        i++;
      }
      
      const title = i < lines.length ? lines[i] : "Event Tanpa Judul";
      events.push({
        title,
        category: currentCategory,
        startDate,
        endDate,
      });
    } else if (matchSingle) {
      const day = parseInt(matchSingle[1], 10);
      const monthStr = matchSingle[2];
      const year = parseInt(matchSingle[3], 10);

      const month = parseMonth(monthStr);
      const dateStr = formatDate(year, month, day);

      // The next non-empty line should be the event title
      i++;
      while (i < lines.length && lines[i] === "") {
        i++;
      }

      const title = i < lines.length ? lines[i] : "Event Tanpa Judul";
      events.push({
        title,
        category: currentCategory,
        startDate: dateStr,
        endDate: dateStr,
      });
    } else {
      // If it doesn't match a date, it could be a category update line
      if (line.length > 3 && !line.match(/\d+/) && lines[i - 1] === "") {
        currentCategory = line;
      }
    }
    i++;
  }

  return events;
}
