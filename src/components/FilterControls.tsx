import { motion } from 'framer-motion';
import { Search, Filter, SortDesc, AlertTriangle, Shield, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  riskFilter: string;
  onRiskFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FilterControls({
  searchQuery,
  onSearchChange,
  riskFilter,
  onRiskFilterChange,
  sortBy,
  onSortChange,
}: FilterControlsProps) {
  const riskFilters = [
    { value: 'all', label: 'All Asteroids', icon: Sparkles },
    { value: 'critical', label: 'Critical Only', icon: AlertTriangle },
    { value: 'high', label: 'High Risk', icon: AlertTriangle },
    { value: 'hazardous', label: 'Hazardous', icon: AlertTriangle },
    { value: 'safe', label: 'Safe Only', icon: Shield },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-space rounded-xl p-4 mb-6"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search asteroids by name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-muted/30 border-border focus:border-primary"
          />
        </div>

        <div className="flex gap-3">
          <Select value={riskFilter} onValueChange={onRiskFilterChange}>
            <SelectTrigger className="w-[180px] bg-muted/30 border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {riskFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  <div className="flex items-center gap-2">
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] bg-muted/30 border-border">
              <SortDesc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="risk">Risk Score</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="velocity">Velocity</SelectItem>
              <SelectItem value="diameter">Diameter</SelectItem>
              <SelectItem value="date">Approach Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
