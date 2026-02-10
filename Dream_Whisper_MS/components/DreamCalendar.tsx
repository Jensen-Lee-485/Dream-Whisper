'use client';

import { DreamRecord } from '@/utils/dreamStorage';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, Sparkles } from 'lucide-react';

interface DreamCalendarProps {
  history: DreamRecord[];
  onSelectDate: (records: DreamRecord[]) => void;
}

export default function DreamCalendar({ history, onSelectDate }: DreamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 按日期 key 分组梦境
  const dreamsByDate = useMemo(() => {
    const map = new Map<string, DreamRecord[]>();
    history.forEach(record => {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = map.get(key) || [];
      map.set(key, [...existing, record]);
    });
    return map;
  }, [history]);

  // 生成当月日历网格
  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = new Array(startOffset).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }, [year, month]);

  const getDateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const getDreamCount = (date: Date | null): number => {
    if (!date) return 0;
    return dreamsByDate.get(getDateKey(date))?.length || 0;
  };

  const today = new Date();
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  };

  const getHeatmapClass = (count: number, todayFlag: boolean): string => {
    const base = 'aspect-square rounded-lg transition-all duration-300 relative';
    const ring = todayFlag ? 'ring-2 ring-indigo-400/70' : '';

    if (count === 0) {
      return `${base} ${ring} bg-indigo-950/20 border border-indigo-500/10`;
    }
    if (count <= 2) {
      return `${base} ${ring} bg-indigo-500/35 border border-indigo-400/30 cursor-pointer hover:scale-105 hover:shadow-[0_0_16px_rgba(99,102,241,0.5)]`;
    }
    return `${base} ${ring} bg-purple-500/50 border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.4)] cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)]`;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    const records = dreamsByDate.get(getDateKey(date));
    if (records && records.length > 0) {
      onSelectDate(records);
    }
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  // 本月有梦境的天数
  const monthDreamDays = useMemo(() => {
    let count = 0;
    for (const week of calendar) {
      for (const date of week) {
        if (date && getDreamCount(date) > 0) count++;
      }
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar, dreamsByDate]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-indigo-950/20 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-5 md:p-8 shadow-2xl">

        {/* 头部 */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-indigo-300" />
            <h2 className="text-xl text-indigo-100 font-light tracking-wide">梦境日历</h2>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-indigo-200">
              本月记录 <span className="font-bold text-purple-300">{monthDreamDays}</span> 天
            </span>
          </div>
        </div>

        {/* 月份选择器 */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg text-indigo-100 font-medium tracking-wide">
            {year}年{month + 1}月
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="text-center text-indigo-400/50 text-[10px] md:text-xs font-medium py-1.5">
              {day}
            </div>
          ))}
        </div>

        {/* 日历格子 */}
        <div className="space-y-1.5 md:space-y-2">
          {calendar.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1.5 md:gap-2">
              {week.map((date, dayIdx) => {
                const count = getDreamCount(date);
                const dateKey = date ? getDateKey(date) : null;

                return (
                  <div
                    key={dayIdx}
                    className="relative"
                    onMouseEnter={() => dateKey && setHoveredDate(dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {date ? (
                      <>
                        <button
                          onClick={() => handleDateClick(date)}
                          disabled={count === 0}
                          className={getHeatmapClass(count, isToday(date))}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[11px] md:text-sm font-medium ${
                              count > 0 ? 'text-white' : isToday(date) ? 'text-indigo-300' : 'text-indigo-500/40'
                            }`}>
                              {date.getDate()}
                            </span>
                          </div>
                          {count >= 3 && (
                            <Sparkles className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-300/80" />
                          )}
                        </button>

                        {/* Tooltip */}
                        {hoveredDate === dateKey && count > 0 && (
                          <div className="absolute z-50 -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-indigo-900/95 backdrop-blur-md rounded-lg border border-indigo-400/30 whitespace-nowrap text-[10px] text-indigo-100 shadow-xl pointer-events-none">
                            {count} 个梦境
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-indigo-900/95" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="aspect-square" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="mt-6 pt-5 border-t border-indigo-500/10 flex items-center justify-center gap-4 md:gap-6 flex-wrap text-[10px] md:text-xs">
          <span className="text-indigo-400/50">图例:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-indigo-950/20 border border-indigo-500/10" />
            <span className="text-indigo-300/60">无记录</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-indigo-500/35 border border-indigo-400/30" />
            <span className="text-indigo-300/60">1-2个</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-purple-500/50 shadow-[0_0_6px_rgba(168,85,247,0.4)]" />
            <span className="text-indigo-300/60">3+个</span>
          </div>
        </div>

        {/* 空状态 */}
        {history.length === 0 && (
          <div className="mt-6 text-center py-10">
            <CalendarIcon className="w-10 h-10 text-indigo-500/25 mx-auto mb-3" />
            <p className="text-indigo-300/50 text-sm">还没有记录任何梦境</p>
            <p className="text-indigo-400/30 text-xs mt-1.5">开始记录，见证你的梦境旅程</p>
          </div>
        )}
      </div>
    </div>
  );
}
