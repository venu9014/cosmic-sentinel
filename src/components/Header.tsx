import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, Activity, Bot, Telescope, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface HeaderProps {
  isLoading?: boolean;
  lastUpdated?: Date;
  criticalCount?: number;
  onRefresh?: () => void;
}

export function Header({ isLoading, lastUpdated, criticalCount = 0, onRefresh }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="AstroTracking AI" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="font-orbitron text-xl md:text-2xl font-bold text-gradient-cosmic">
                AstroTracking AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Real-Time Monitoring & ML Classification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {criticalCount} CRITICAL
                </Badge>
              </motion.div>
            )}


            <Link to="/light-curve">
              <Button variant="outline" size="sm" className="gap-2">
                <Telescope className="w-4 h-4" />
                <span className="hidden sm:inline">Light Curve</span>
              </Button>
            </Link>

            <Link to="/chatbot">
              <Button variant="outline" size="sm" className="gap-2">
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AstroBot</span>
              </Button>
            </Link>

            <Link to="/research">
              <Button variant="outline" size="sm" className="gap-2">
                <FlaskConical className="w-4 h-4" />
                <span className="hidden sm:inline">Research</span>
              </Button>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3 h-3 text-success animate-pulse" />
              <span>Live Data</span>
            </div>

            {lastUpdated && (
              <span className="hidden lg:block text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <Button
              variant="glow"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
