import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarField } from '@/components/StarField';
import { LiveClock } from '@/components/LiveClock';
import { DeveloperSection } from '@/components/DeveloperSection';

export default function DevelopedBy() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <StarField />

      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" state={{ showDashboard: true }}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-orbitron text-lg font-bold leading-tight">Developed By</h1>
            <p className="text-xs text-muted-foreground">Meet the team behind AstroTrack</p>
          </div>
          <div className="ml-auto">
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        <DeveloperSection />
      </main>
    </div>
  );
}
