import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card/60 border border-border backdrop-blur-sm text-[10px] font-mono whitespace-nowrap leading-tight">
      <Clock className="w-3 h-3 text-primary animate-pulse shrink-0" />
      <span className="text-foreground font-semibold">
        {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
}
