import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Clock, Check, Plus, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TodayDashboardProps {
  onOpenCreateHabit?: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({ onOpenCreateHabit }) => {
  const { user } = useAuth();
  const { success, info } = useToast();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Mock checklist habits state
  const [todayHabits, setTodayHabits] = useState([
    { id: '1', name: 'DSA Practice', category: 'Study', time: '09:00 AM', duration: '1h 30m', streak: 12, completed: true },
    { id: '2', name: 'Morning Jog', category: 'Fitness', time: '07:00 AM', duration: '30m', streak: 5, completed: true },
    { id: '3', name: 'System Design', category: 'Study', time: '11:00 AM', duration: '1h', streak: 8, completed: true },
    { id: '4', name: 'Reading', category: 'Personal', time: '09:00 PM', duration: '30m', streak: 17, completed: false },
    { id: '5', name: 'Mindfulness Breathe', category: 'Mindfulness', time: '08:00 AM', duration: '10m', streak: 20, completed: true },
    { id: '6', name: 'Exercise', category: 'Fitness', time: '06:30 PM', duration: '45m', streak: 4, completed: false },
    { id: '7', name: 'Hydration Intake', category: 'Health', time: 'Anytime', duration: '5m', streak: 22, completed: true },
    { id: '8', name: 'Project Coding', category: 'Work', time: '03:00 PM', duration: '2h', streak: 15, completed: true },
    { id: '9', name: 'Journaling', category: 'Personal', time: '10:00 PM', duration: '15m', streak: 9, completed: true },
  ]);

  const toggleCheck = (id: string) => {
    setTodayHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextState = !h.completed;
          if (nextState) {
            success('Logged done! ✓', `"${h.name}" completed today.`);
          }
          return { ...h, completed: nextState };
        }
        return h;
      })
    );
  };

  const completedCount = todayHabits.filter((h) => h.completed).length;
  const totalCount = todayHabits.length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Time metrics calculations
  // DSA (1.5h), Jog (0.5h), System (1h), Mindfulness (0.16h), Hydration (0.08h), Coding (2h), Journal (0.25h) -> completed is ~5.5h
  const focusTimeHours = 2;
  const focusTimeMinutes = 40;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none">
      {/* Header */}
      <PageHeader
        title={`Good morning, ${user?.name || 'Developer'}`}
        description={`Today — ${formattedDate}`}
        actions={
          <button
            onClick={onOpenCreateHabit}
            className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add</span>
          </button>
        }
      >
        <span className="text-xs text-muted-foreground font-semibold italic">
          &quot;Focus on what matters most.&quot;
        </span>
      </PageHeader>

      {/* Top Cockpit Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Ring */}
        <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex items-center justify-between gap-4 md:col-span-2">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today&apos;s Progress</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{progressPercent}%</p>
            <p className="text-xs text-muted-foreground font-semibold">
              {completedCount} / {totalCount} completed • <strong className="text-primary font-extrabold">{remainingCount} remaining</strong>
            </p>
          </div>
          <div className="h-20 w-20 shrink-0">
            <ProgressRing value={progressPercent} size={80} strokeWidth={8} color="#2563EB" />
          </div>
        </Card>

        {/* Focus Hours Metric */}
        <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col justify-between h-full">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Focus Time</span>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{focusTimeHours}h {focusTimeMinutes}m</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Logged execution time</p>
          </div>
        </Card>

        {/* Daily Capacity tracker */}
        <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Daily Capacity</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Available: <span className="font-extrabold">4h 20m</span>
            </p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              Planned: <span className="text-primary font-bold">3h 40m</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold">
              Remaining margin: <strong className="text-success font-extrabold">40m</strong>
            </p>
          </div>
        </Card>
      </div>

      {/* Main split grid: Cockpit checklists, timeline scheduling and capacities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left main cockpit checklist */}
        <div className="lg:col-span-2 space-y-5">
          {/* Next Best Action Card */}
          <Card className="bg-primary/5 border border-primary/20 rounded-[14px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-primary" /> Next Best Action
              </span>
              <h3 className="text-lg font-extrabold text-slate-100">DSA Practice</h3>
              <p className="text-xs text-muted-foreground font-semibold">
                High impact routine • Best scheduled window: <strong className="text-slate-200">7:30 PM</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto font-bold text-xs">
              <button
                onClick={() => success('Execution started! ⚡', 'Timer initialized.')}
                className="flex-1 sm:flex-initial bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-all cursor-pointer text-center"
              >
                Start
              </button>
              <button
                onClick={() => info('Schedule shifted', 'Window postponed.')}
                className="flex-1 sm:flex-initial bg-[#101622] hover:bg-[#131B29] border border-[#1D293D] text-slate-300 px-4 py-2 rounded-xl transition-all cursor-pointer text-center"
              >
                Reschedule
              </button>
            </div>
          </Card>

          {/* Today's interactive habits checklist */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground text-left">Today&apos;s Habits checklist</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/10 pb-2 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 w-12 text-center">Done</th>
                    <th className="py-2.5 pl-2">Habit</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Scheduled</th>
                    <th className="py-2.5">Duration</th>
                    <th className="py-2.5 text-right pr-2">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {todayHabits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-3 text-center">
                        <button
                          onClick={() => toggleCheck(habit.id)}
                          className={cn(
                            "h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer mx-auto",
                            habit.completed
                              ? "bg-primary border-primary text-white"
                              : "border-[#1D293D] hover:border-primary/50 text-transparent"
                          )}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        </button>
                      </td>
                      <td className="py-3 pl-2 text-slate-100 font-extrabold">
                        {habit.name}
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-white/5 text-slate-300">
                          {habit.category}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{habit.time}</td>
                      <td className="py-3 text-muted-foreground">{habit.duration}</td>
                      <td className="py-3 text-right pr-2 text-warning font-mono">🔥 {habit.streak}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right timeline and priorities sidebar column */}
        <div className="space-y-5">
          {/* Today's Schedule timeline */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground text-left">Today&apos;s Schedule</h3>
            <div className="space-y-4 relative border-l border-[#1D293D]/60 pl-4 ml-1">
              {[
                { time: '09:00 AM', event: 'DSA Practice', description: 'Study' },
                { time: '11:00 AM', event: 'Work Sprint', description: 'Project System Design' },
                { time: '03:00 PM', event: 'Project Coding', description: 'Sprint UI deployment' },
                { time: '06:30 PM', event: 'Exercise routine', description: 'Fitness' },
                { time: '09:00 PM', event: 'Reading target', description: 'Personal growth' },
              ].map((item, idx) => (
                <div key={idx} className="relative group text-xs font-semibold">
                  {/* Timeline dot */}
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-primary bg-[#080C14] group-hover:scale-125 transition-transform" />
                  <div className="text-left">
                    <span className="text-[10px] text-primary font-bold">{item.time}</span>
                    <h4 className="text-slate-100 font-bold leading-none mt-0.5">{item.event}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Focus Priorities */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground text-left">Daily Focus Priorities</h3>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-left">
                <span className="text-[9px] font-bold text-primary uppercase block mb-0.5">Priority 1</span>
                Solve 3 Leetcode patterns
              </div>
              <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-left">
                <span className="text-[9px] font-bold text-primary uppercase block mb-0.5">Priority 2</span>
                Deploy design system component library
              </div>
              <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-left">
                <span className="text-[9px] font-bold text-primary uppercase block mb-0.5">Priority 3</span>
                Read 15 pages of Atomic Habits
              </div>
            </div>
          </Card>

          {/* End of Day review card */}
          <Card className="bg-[#101622] border border-primary/20 rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">End of Day</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Conclude today&apos;s consistency review</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold border-b border-border/5 pb-3">
              <div>
                <span className="text-[10px] text-muted-foreground">Completions</span>
                <p className="text-slate-100 font-extrabold">{completedCount} logged</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Remaining</span>
                <p className="text-primary font-bold">{remainingCount} targets</p>
              </div>
            </div>
            <button
              onClick={() => success('Day review completed! ✦', 'Keep building consistency.')}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              Complete Day Review
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
