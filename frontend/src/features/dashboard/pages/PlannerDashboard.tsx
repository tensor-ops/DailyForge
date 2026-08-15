import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { Plus, AlertTriangle, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export const PlannerDashboard: React.FC = () => {
  const { success, info } = useToast();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Capacity states (simulates overload conditions: Planned 5h 10m > Available 4h 20m)
  const availableCapacity = '4h 20m';
  const plannedCapacity = '5h 10m';
  const isOverloaded = true;

  const [blocks, setBlocks] = useState([
    { id: '1', name: 'Morning Jog', time: '07:00 AM - 07:30 AM', type: 'Habit', category: 'Fitness', duration: '30m' },
    { id: '2', name: 'DSA Practice', time: '09:00 AM - 10:30 AM', type: 'Habit', category: 'Study', duration: '1h 30m' },
    { id: '3', name: 'Work Sprint', time: '11:00 AM - 01:00 PM', type: 'Task', category: 'Work', duration: '2h' },
    { id: '4', name: 'Project Coding', time: '03:00 PM - 05:00 PM', type: 'Task', category: 'Work', duration: '2h' },
    { id: '5', name: 'Reading', time: '09:00 PM - 09:30 PM', type: 'Habit', category: 'Personal', duration: '30m' },
  ]);

  const handleShiftReading = () => {
    success('Reading postponed!', 'Reading task shifted to tomorrow. Capacity balanced.');
    setBlocks((prev) => prev.filter((b) => b.id !== '5'));
  };

  const handleAction = (actName: string) => {
    info('Schedule adjustment', `Executing: ${actName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none">
      {/* Header */}
      <PageHeader
        title="Planner"
        description="Design your day around what matters."
        actions={
          <button
            onClick={() => handleAction('Create Timeblock')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Schedule</span>
          </button>
        }
      />

      {/* Controller: Day/Week/Month Switcher */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex bg-card p-1 border border-border rounded-xl text-xs font-bold text-slate-300 w-max shrink-0">
          {([
            { id: 'day', label: 'Day' },
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors focus:outline-none',
                viewMode === v.id ? 'bg-primary text-foreground font-extrabold' : 'hover:text-foreground hover:bg-muted/30'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Date navigations */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <button onClick={() => handleAction('Prev week')} className="p-1.5 rounded-lg bg-card border border-border hover:bg-surface-elevated cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-foreground uppercase tracking-wider text-[10px] font-bold">Aug 15 — Aug 21, 2026</span>
          <button onClick={() => handleAction('Next week')} className="p-1.5 rounded-lg bg-card border border-border hover:bg-surface-elevated cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Side Calendar Blocks */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <h3 className="text-sm font-semibold text-foreground">Time Blocks ({viewMode.toUpperCase()})</h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aug 15</span>
            </div>
            
            <div className="space-y-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 hover:border-border transition-colors relative group"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-1 h-8 rounded-full",
                      block.category === 'Fitness' ? 'bg-success' : block.category === 'Study' ? 'bg-primary' : 'bg-warning'
                    )} />
                    <div className="text-left">
                      <h4 className="text-foreground font-bold leading-none">{block.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{block.time} ({block.duration})</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-muted px-2 py-0.5 rounded border border-white/5 text-slate-300 font-bold uppercase">
                      {block.type}
                    </span>
                    <button
                      onClick={() => handleAction(`Edit block ${block.name}`)}
                      className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                      title="Adjust block"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                  No active items scheduled for today.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side Capacity & Smart Recommendations Panel */}
        <div className="space-y-5">
          {/* Capacity Panel Widget */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Capacity Panel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Focus capacity validation metrics</p>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center text-foreground">
                <span>Available Capacity</span>
                <span>{availableCapacity}</span>
              </div>
              <div className="flex justify-between items-center text-foreground">
                <span>Planned Schedule</span>
                <span className="text-warning">{plannedCapacity}</span>
              </div>
            </div>

            {/* Over capacity alert */}
            {isOverloaded && blocks.some((b) => b.id === '5') && (
              <div className="p-3 rounded-xl border bg-warning/10 border-warning/20 text-warning text-xs font-semibold space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 animate-pulse" />
                  <span className="font-bold">Over Capacity Detected</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Your planned routines (5.2h) exceed your recent average capacity (4.3h).
                </p>
                <div className="pt-1.5 border-t border-warning/10 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-warning font-bold">Recommendation: Move Reading → Tomorrow</span>
                  <button
                    onClick={handleShiftReading}
                    className="bg-card hover:bg-warning/20 text-warning border border-warning/20 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Smart Scheduling windows */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Optimal Windows</h3>
            </div>
            
            <div className="space-y-3 text-xs font-semibold">
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-primary block uppercase">DSA Practice</span>
                  <span className="text-foreground font-bold">7:30 PM - 9:00 PM</span>
                </div>
                <span className="text-[9px] bg-success/15 border border-success/20 text-success px-1.5 py-0.5 rounded-full font-bold">92% peak</span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-primary block uppercase">Exercise</span>
                  <span className="text-foreground font-bold">6:00 PM - 7:00 PM</span>
                </div>
                <span className="text-[9px] bg-success/15 border border-success/20 text-success px-1.5 py-0.5 rounded-full font-bold">88% peak</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
