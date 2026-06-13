'use client';

import * as React from 'react';
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isWithinInterval,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { SessionItem } from '@/app/student/sessions/types';

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = END_HOUR - START_HOUR;
const ROW_HEIGHT = 48; // px per hour
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface Props {
  sessions: SessionItem[];
  onSelect?: (s: SessionItem) => void;
}

export function WeekCalendar({ sessions, onSelect }: Props) {
  const [anchor, setAnchor] = React.useState(() => new Date());
  const weekStart = React.useMemo(
    () => startOfWeek(anchor, { weekStartsOn: 0 }),
    [anchor],
  );
  const weekEnd = React.useMemo(() => addDays(weekStart, 7), [weekStart]);
  const days = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const today = new Date();

  const weekSessions = React.useMemo(
    () =>
      sessions.filter((s) => {
        const d = new Date(s.startsAt);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      }),
    [sessions, weekStart, weekEnd],
  );

  const blockFor = (s: SessionItem) => {
    const start = new Date(s.startsAt);
    const end = new Date(s.endsAt);
    const dayIdx = days.findIndex((d) => isSameDay(d, start));
    if (dayIdx === -1) return null;
    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();
    const top = ((startMin - START_HOUR * 60) / 60) * ROW_HEIGHT;
    const height = Math.max(24, ((endMin - startMin) / 60) * ROW_HEIGHT - 2);
    return { dayIdx, top, height };
  };

  return (
    <div className='border-primary-100 overflow-hidden rounded-lg border bg-white'>
      {/* toolbar */}
      <div className='border-primary-100 flex items-center justify-between gap-2 border-b px-4 py-3'>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => setAnchor((d) => addWeeks(d, -1))}
            aria-label='Minggu sebelumnya'
          >
            <ChevronLeft className='size-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => setAnchor((d) => addWeeks(d, 1))}
            aria-label='Minggu berikutnya'
          >
            <ChevronRight className='size-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setAnchor(new Date())}
          >
            Hari ini
          </Button>
          <DatePicker
            selected={anchor}
            onChange={(d: Date | null) => d && setAnchor(d)}
            dateFormat='dd MMM yyyy'
            popperPlacement='bottom-end'
            className='border-primary-200 focus:border-primary-400 focus:ring-primary-300/30 mono h-8 w-32 rounded-md border bg-white px-2 text-xs tabular-nums focus:ring-2 focus:outline-none'
            aria-label='Pilih tanggal'
          />
        </div>
        <div className='text-sm font-semibold'>
          {format(weekStart, 'd MMM')} –{' '}
          {format(addDays(weekStart, 6), 'd MMM yyyy')}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <div
          className='grid min-w-[640px]'
          style={{
            gridTemplateColumns: `4rem repeat(7, minmax(100px, 1fr))`,
          }}
        >
          {/* header day row */}
          <div className='bg-primary-50/40 border-primary-100 border-r border-b' />
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={i}
                className={cn(
                  'bg-primary-50/40 border-primary-100 border-r border-b px-2 py-2 text-center text-xs last:border-r-0',
                  isToday && 'text-primary-700 font-bold',
                )}
              >
                <div className='font-semibold'>{DAYS[i]}</div>
                <div className='mono text-[11px] tabular-nums'>
                  {format(d, 'd MMM')}
                </div>
              </div>
            );
          })}

          {/* time gutter + day columns */}
          <div className='border-primary-100 border-r'>
            {Array.from({ length: HOURS }).map((_, h) => (
              <div
                key={h}
                className='mono text-muted-foreground border-primary-100/60 border-b pt-1 pr-2 text-right text-[10px] tabular-nums last:border-b-0'
                style={{ height: ROW_HEIGHT }}
              >
                {format(new Date(0, 0, 0, START_HOUR + h), 'h a')}
              </div>
            ))}
          </div>

          {days.map((d, dayIdx) => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={dayIdx}
                className={cn(
                  'border-primary-100 relative border-r last:border-r-0',
                  isToday && 'bg-primary-50/30',
                )}
                style={{ height: HOURS * ROW_HEIGHT }}
              >
                {/* hour grid lines */}
                {Array.from({ length: HOURS }).map((_, h) => (
                  <div
                    key={h}
                    className='border-primary-100/60 border-b last:border-b-0'
                    style={{ height: ROW_HEIGHT }}
                  />
                ))}

                {/* sessions */}
                {weekSessions
                  .map((s) => ({ s, b: blockFor(s) }))
                  .filter(
                    (
                      x,
                    ): x is {
                      s: SessionItem;
                      b: NonNullable<ReturnType<typeof blockFor>>;
                    } => x.b !== null && x.b.dayIdx === dayIdx,
                  )
                  .map(({ s, b }) => {
                    const names =
                      s.attendees
                        ?.map((a) => a.student?.user.name)
                        .filter(Boolean) ?? [];
                    const label =
                      names.length === 0
                        ? 'Sesi'
                        : names.length === 1
                          ? (names[0] as string)
                          : `${names[0]} +${names.length - 1}`;
                    return (
                      <button
                        key={s.id}
                        type='button'
                        onClick={() => onSelect?.(s)}
                        className='bg-primary-100 hover:bg-primary-200 border-primary-500 text-primary-900 absolute right-1 left-1 overflow-hidden rounded border-y border-r border-l-4 px-2 py-1 text-left text-[11px] shadow-sm transition-colors'
                        style={{ top: b.top, height: b.height }}
                        title={`${names.join(', ') || 'Sesi'} · ${format(new Date(s.startsAt), 'HH:mm')}–${format(new Date(s.endsAt), 'HH:mm')}`}
                      >
                        <div className='mono text-primary-800 truncate text-[10px] font-semibold tabular-nums'>
                          {format(new Date(s.startsAt), 'HH:mm')}
                        </div>
                        <div className='truncate font-medium'>{label}</div>
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
