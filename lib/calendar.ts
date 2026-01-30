export const MISRI_MONTH_NAMES_EN = [
  "Moharram-ul-Haraam",
  "Safar-ul-Muzaffar",
  "Rabi-ul-Awwal",
  "Rabi-ul-Aakhar",
  "Jumadal-Ula",
  "Jumadal-Ukhra",
  "Rajab-ul-Asab",
  "Shaban-ul-Karim",
  "Ramadan-ul-Moazzam",
  "Shawwal-ul-Mukarram",
  "Zilqadat-il-Haraam",
  "Zilhaj-il-Haraam",
];

export const MISRI_MONTH_NAMES_AR = [
  "محرم الحرام",
  "صفر المظفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الأخرى",
  "رجب الأصب",
  "شعبان الكريم",
  "رمضان المعظم",
  "شوال المكرم",
  "ذي القعدة الحرام",
  "ذي الحجة الحرام",
];

const LEAP_YEARS_PATTERN = new Set([2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29]);
const MISRI_EPOCH_JD = 1948439;
const DAYS_IN_30_YEARS = 10631;

export function getMisriDate(date: string) {
  // Enforce strict YYYY-MM-DD parsing in UTC
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }

  const year = y;
  const month = m - 1; // JS-style
  const day = d;

  // Gregorian → Julian Day (UTC-safe)
  const a = Math.floor((14 - (month + 1)) / 12);
  const y2 = year + 4800 - a;
  const m2 = month + 1 + 12 * a - 3;

  const jd =
    day +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045;

  let daysSince = jd - MISRI_EPOCH_JD;

  // Normalize negative values
  let cycles = Math.floor(daysSince / DAYS_IN_30_YEARS);
  let remainingDays = daysSince - cycles * DAYS_IN_30_YEARS;

  if (remainingDays < 0) {
    cycles -= 1;
    remainingDays += DAYS_IN_30_YEARS;
  }

  let hijriYear = cycles * 30 + 1;

  for (let i = 1; i <= 30; i++) {
    const daysInYear = LEAP_YEARS_PATTERN.has(i) ? 355 : 354;
    if (remainingDays < daysInYear) break;
    remainingDays -= daysInYear;
    hijriYear++;
  }

  const cycleYear = ((hijriYear - 1) % 30) + 1;
  const isLeapYear = LEAP_YEARS_PATTERN.has(cycleYear);

  let hijriMonth = 0;

  for (let i = 0; i < 12; i++) {
    const daysInMonth =
      i === 11 ? (isLeapYear ? 30 : 29) : i % 2 === 0 ? 30 : 29;

    if (remainingDays < daysInMonth) {
      hijriMonth = i;
      break;
    }
    remainingDays -= daysInMonth;
  }

  const hijriDay = remainingDays + 1;

  const toArabicNumerals = (n: number) =>
    n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

  return {
    day: hijriDay,
    month: hijriMonth + 1,
    year: hijriYear,
    monthNameEn: MISRI_MONTH_NAMES_EN[hijriMonth],
    monthNameAr: MISRI_MONTH_NAMES_AR[hijriMonth],
    dayAr: toArabicNumerals(hijriDay),
    yearAr: toArabicNumerals(hijriYear),
    formattedEn: `${hijriDay}${getOrdinal(hijriDay)} ${MISRI_MONTH_NAMES_EN[hijriMonth]} ${hijriYear}`,
    formattedAr: `${toArabicNumerals(hijriDay)} ${MISRI_MONTH_NAMES_AR[hijriMonth]} ${toArabicNumerals(hijriYear)}`,
  };
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
