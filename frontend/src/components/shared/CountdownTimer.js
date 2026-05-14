'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function getTimeLeft(endTime) {
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    ended: false,
  };
}

export default function CountdownTimer({ endTime, compact = false }) {
  const [time, setTime] = useState(getTimeLeft(endTime));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(endTime)), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (time.ended) {
    return <span className="text-red-400 text-xs font-semibold flex items-center gap-1"><Clock size={12} /> Ended</span>;
  }

  if (compact) {
    return (
      <span className="text-yellow-400 text-xs font-semibold flex items-center gap-1">
        <Clock size={12} />
        {time.days > 0 ? `${time.days}d ${time.hours}h` : time.hours > 0 ? `${time.hours}h ${time.minutes}m` : `${time.minutes}m ${time.seconds}s`}
      </span>
    );
  }

  const Unit = ({ val, label }) => (
    <div className="text-center">
      <div className="text-lg font-bold text-white tabular-nums"
        style={{ minWidth: 32, background: 'rgba(7,11,26,0.8)', borderRadius: 8, padding: '4px 8px', border: '1px solid rgba(30,58,95,0.6)' }}>
        {String(val).padStart(2, '0')}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Clock size={14} className="text-yellow-400 flex-shrink-0" />
      <div className="flex items-center gap-1.5">
        {time.days > 0 && <Unit val={time.days} label="d" />}
        <Unit val={time.hours} label="h" />
        <span className="text-slate-500 font-bold mb-4">:</span>
        <Unit val={time.minutes} label="m" />
        <span className="text-slate-500 font-bold mb-4">:</span>
        <Unit val={time.seconds} label="s" />
      </div>
    </div>
  );
}
