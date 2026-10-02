import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';

/**
 * DateTimePicker — Rentora
 * -----------------------------------------------------------------------
 * Thin wrapper around react-datepicker, styled to match the dark theme.
 * Accepts `bookedSlots` and `maxQuantity` to visually mark booked days
 * and disable fully-booked time options directly in the calendar.
 *
 * Props:
 *  - label: string
 *  - selected: Date | null
 *  - onChange: (date: Date) => void
 *  - minDate: Date (optional)
 *  - maxDate: Date (optional)
 *  - error: string (optional)
 *  - bookedSlots: Array<{ startTime, endTime, quantity }> (optional)
 *  - maxQuantity: number (optional — listing.quantity)
 *  - openingTime / closingTime: "HH:mm" or "HH:mm:ss" (optional, venues only)
 *  - isEnd: boolean — true for the end-time picker (end may equal closing time)
 */

// "09:30:00" -> 570 (minutes since midnight). A closing time of 00:00 means end of day (1440).
function toMinutes(value, isClosing = false) {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  const mins = h * 60 + (m || 0);
  return isClosing && mins === 0 ? 24 * 60 : mins;
}

export default function DateTimePicker({
  label,
  selected,
  onChange,
  minDate,
  maxDate,
  error,
  bookedSlots = [],
  maxQuantity = 1,
  openingTime,
  closingTime,
  isEnd = false,
}) {
  const openMins = toMinutes(openingTime);
  const closeMins = toMinutes(closingTime, true);
  const hasHours = openMins !== null && closeMins !== null && closeMins > openMins;

  function bookedQuantityOnDay(date) {
    return bookedSlots
      .filter((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        return (
          date.toDateString() === slotStart.toDateString() ||
          date.toDateString() === slotEnd.toDateString() ||
          (date > slotStart && date < slotEnd)
        );
      })
      .reduce((sum, slot) => sum + slot.quantity, 0);
  }

  function dayClassName(date) {
    const booked = bookedQuantityOnDay(date);
    if (booked === 0) return undefined;
    return booked >= maxQuantity ? 'rt-day-full' : 'rt-day-partial';
  }

  function renderDayContents(dayOfMonth, date) {
    const booked = bookedQuantityOnDay(date);
    return (
      <span className="relative">
        {dayOfMonth}
        {booked > 0 && <span className="rt-day-dot" />}
      </span>
    );
  }

  function filterTime(time) {
    // 1) outside opening hours -> not selectable
    if (hasHours) {
      const mins = time.getHours() * 60 + time.getMinutes();
      const withinHours = isEnd
        ? mins > openMins && mins <= closeMins // end can be exactly at closing time
        : mins >= openMins && mins < closeMins; // start can be exactly at opening time
      if (!withinHours) return false;
    }

    // 2) fully booked -> not selectable
    const booked = bookedSlots
      .filter((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        return time >= slotStart && time < slotEnd;
      })
      .reduce((sum, slot) => sum + slot.quantity, 0);
    return booked < maxQuantity;
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A7F76]">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-lg border bg-[#181512] px-3 py-2 transition-colors ${
          error ? 'border-red-500/50' : 'border-[#2A2622] focus-within:border-[#C2542D]/60'
        }`}
      >
        <CalendarDays size={15} className="shrink-0 text-[#8A7F76]" />
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeIntervals={30}
          minDate={minDate}
          maxDate={maxDate}
          filterTime={filterTime}
          dayClassName={dayClassName}
          renderDayContents={renderDayContents}
          dateFormat="MMM d, yyyy 'at' h:mm aa"
          placeholderText="Select date & time"
          className="w-full bg-transparent text-sm text-[#F5F0EB] placeholder:text-[#5A524A] outline-none"
          calendarClassName="rt-datepicker"
          popperPlacement="bottom-start"
        />
      </div>
      {error && <p className="mt-1.5 pl-1 text-[11.5px] text-red-400">{error}</p>}

      {hasHours && (
        <p className="mt-1.5 pl-1 text-[10.5px] text-[#6B615A]">
          Open {openingTime.slice(0, 5)} – {closingTime.slice(0, 5)}
        </p>
      )}

      {bookedSlots.length > 0 && (
        <div className="mt-1.5 flex items-center gap-3 pl-1 text-[10.5px] text-[#6B615A]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#D4A574]/50" />
            Partially booked
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#E07856]" />
            Fully booked
          </span>
        </div>
      )}
    </div>
  );
}