import HijriCalendar from "@/components/HijriCalendar";

export default function HomePage() {
  return (
    <main className="main-container">
      {/* Fatemi pattern background */}
      <div className="fatemi-pattern"></div>

      {/* Calendar */}
      <HijriCalendar />
    </main>
  );
}