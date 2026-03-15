import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/60 border border-border backdrop-blur-sm text-xs font-mono">
      <Clock className="w-3 h-3 text-primary animate-pulse" />
      <span className="text-muted-foreground">
        {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
      <span className="text-foreground font-semibold">
        {now.toLocaleTimeString('en-US', { hour12: true })}
      </span>
      <span className="text-muted-foreground">UTC{now.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(Math.floor(now.getTimezoneOffset() / 60))}</span>
    </div>
  );
}
