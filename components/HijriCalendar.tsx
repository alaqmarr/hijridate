"use client";

import { useState, useEffect, useCallback } from "react";
import { getMisriDate, MISRI_MONTH_NAMES_EN, MISRI_MONTH_NAMES_AR } from "@/lib/calendar";

interface HijriDate {
    day: number;
    month: number;
    year: number;
    monthNameEn: string;
    monthNameAr: string;
    dayAr: string;
    yearAr: string;
    formattedEn: string;
    formattedAr: string;
}

const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Helper to check if a Hijri year is a leap year in the Misri calendar
const LEAP_YEARS_PATTERN = new Set([2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29]);
const isLeapYear = (year: number) => LEAP_YEARS_PATTERN.has(((year - 1) % 30) + 1);

// Get days in a Hijri month
const getDaysInMonth = (month: number, year: number) => {
    if (month === 12) return isLeapYear(year) ? 30 : 29;
    return month % 2 === 1 ? 30 : 29;
};

// Convert Hijri date to approximate Gregorian for weekday calculation
const hijriToGregorian = (day: number, month: number, year: number) => {
    const MISRI_EPOCH_JD = 1948439;
    const DAYS_IN_30_YEARS = 10631;

    let daysSince = 0;
    const cycles = Math.floor((year - 1) / 30);
    daysSince += cycles * DAYS_IN_30_YEARS;

    const remainingYears = ((year - 1) % 30) + 1;
    for (let i = 1; i < remainingYears; i++) {
        daysSince += LEAP_YEARS_PATTERN.has(i) ? 355 : 354;
    }

    for (let i = 1; i < month; i++) {
        daysSince += getDaysInMonth(i, year);
    }
    daysSince += day - 1;

    const jd = MISRI_EPOCH_JD + daysSince;

    // Julian Day to Gregorian
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((b * 146097) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);

    const gDay = e - Math.floor((153 * m + 2) / 5) + 1;
    const gMonth = m + 3 - 12 * Math.floor(m / 10);
    const gYear = b * 100 + d - 4800 + Math.floor(m / 10);

    return new Date(gYear, gMonth - 1, gDay);
};

export default function HijriCalendar() {
    const [today, setToday] = useState<HijriDate | null>(null);
    const [currentMonth, setCurrentMonth] = useState(1);
    const [currentYear, setCurrentYear] = useState(1446);
    const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);

    useEffect(() => {
        // Get today's Hijri date
        const todayGregorian = new Date().toISOString().slice(0, 10);
        const hijriToday = getMisriDate(todayGregorian);
        setToday(hijriToday);
        setCurrentMonth(hijriToday.month);
        setCurrentYear(hijriToday.year);
    }, []);

    useEffect(() => {
        // Build calendar grid
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = hijriToGregorian(1, currentMonth, currentYear);
        const startWeekday = firstDay.getDay();

        const days: (number | null)[] = [];
        // Add empty slots for days before the 1st
        for (let i = 0; i < startWeekday; i++) {
            days.push(null);
        }
        // Add the actual days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
        }
        setCalendarDays(days);
    }, [currentMonth, currentYear]);

    const goToPrevMonth = useCallback(() => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    }, [currentMonth]);

    const goToNextMonth = useCallback(() => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    }, [currentMonth]);

    const goToToday = useCallback(() => {
        if (today) {
            setCurrentMonth(today.month);
            setCurrentYear(today.year);
        }
    }, [today]);

    const isToday = (day: number) =>
        today && day === today.day && currentMonth === today.month && currentYear === today.year;

    const toArabicNumerals = (n: number) =>
        n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

    if (!today) {
        return (
            <div className="calendar-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            {/* Header with current Hijri date */}
            <div className="calendar-header">
                <div className="header-date-ar">{today.formattedAr}</div>
                <div className="header-date-en">{today.formattedEn} H</div>
            </div>

            {/* Navigation */}
            <div className="calendar-nav">
                <button onClick={goToPrevMonth} className="nav-btn" aria-label="Previous month">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6" />
                    </svg>
                </button>

                <div className="nav-month">
                    <div className="month-ar">{MISRI_MONTH_NAMES_AR[currentMonth - 1]}</div>
                    <div className="month-en">
                        {MISRI_MONTH_NAMES_EN[currentMonth - 1]} {currentYear}
                    </div>
                </div>

                <button onClick={goToNextMonth} className="nav-btn" aria-label="Next month">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,6 15,12 9,18" />
                    </svg>
                </button>
            </div>

            {/* Today button */}
            <button onClick={goToToday} className="today-btn">
                Go to Today
            </button>

            {/* Weekday headers */}
            <div className="weekday-headers">
                {WEEKDAYS_EN.map((day, i) => (
                    <div key={day} className="weekday">
                        <span className="weekday-en">{day}</span>
                        <span className="weekday-ar">{WEEKDAYS_AR[i]}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid">
                {calendarDays.map((day, i) => (
                    <div
                        key={i}
                        className={`calendar-day ${day ? "has-day" : "empty"} ${day && isToday(day) ? "is-today" : ""}`}
                    >
                        {day && (
                            <>
                                <span className="day-number">{day}</span>
                                <span className="day-number-ar">{toArabicNumerals(day)}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Year display */}
            <div className="year-display">
                <span className="year-ar">{toArabicNumerals(currentYear)} هـ</span>
            </div>
        </div>
    );
}
