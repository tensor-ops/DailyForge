import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GoalStatusBadge } from './GoalStatusBadge';
import { Goal } from '@/types/goal';
import {
  Calendar,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Copy,
  Archive,
  Trash2,
  Edit2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onPauseToggle: (goalId: string) => void;
  onDuplicate: (goalId: string) => void;
  onArchive: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onPauseToggle,
  onDuplicate,
  onArchive,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const velocity = goal.velocity || 0;
  const targetDateStr = goal.targetDate || goal.deadline || 'No deadline';
  const milestoneCount = goal.milestones?.length || 0;
  const completedMilestones =
    goal.milestones?.filter((m) => m.status === 'completed').length || 0;
  const habitCount = goal.habits?.length || 0;
  const taskCount = goal.tasks?.length || 0;

  return (
    <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between gap-4 hover:border-primary/30 transition-all group relative text-left">
      <div className="space-y-3.5">
        {/* Top Badges & Menu Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold bg-muted/30 border border-border text-muted-foreground px-2 py-0.5 rounded-full uppercase">
              {goal.category}
            </span>
            <GoalStatusBadge status={goal.status} />
            {goal.priority && goal.priority !== 'medium' && (
              <span
                className={cn(
                  'text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase',
                  goal.priority === 'critical'
                    ? 'bg-danger/20 text-danger'
                    : goal.priority === 'high'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {goal.priority}
              </span>
            )}
          </div>

          {/* Action dropdown menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Goal actions"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-surface-elevated border border-border rounded-xl shadow-2xl py-1 z-30 animate-scale-in text-xs font-semibold">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(goal);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted text-foreground text-left cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPauseToggle(goal.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted text-foreground text-left cursor-pointer"
                >
                  {goal.status === 'PAUSED' ? (
                    <>
                      <Play className="h-3.5 w-3.5 text-primary" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDuplicate(goal.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted text-foreground text-left cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onArchive(goal.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-muted text-foreground text-left cursor-pointer"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </button>
                <div className="my-1 border-t border-border/60" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(goal.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-danger/10 text-danger text-left cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title and description */}
        <div>
          <h3
            onClick={() => navigate(`/goals/${goal.id}`)}
            className="text-base font-extrabold text-foreground leading-snug cursor-pointer hover:text-primary transition-colors"
          >
            {goal.name}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal font-medium">
              {goal.description}
            </p>
          )}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 text-xs font-semibold">
          <div className="flex justify-between items-center text-slate-300">
            <span>Progress</span>
            <span className="font-extrabold text-foreground">{goal.progress || 0}%</span>
          </div>
          <ProgressBar value={goal.progress || 0} />
        </div>

        {/* Velocity and Expected Date */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-1 border-t border-border/40">
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              Velocity
            </span>
            <span
              className={cn(
                'font-extrabold flex items-center gap-1 mt-0.5',
                velocity > 0
                  ? 'text-success'
                  : velocity < 0
                  ? 'text-danger'
                  : 'text-slate-300'
              )}
            >
              {velocity > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : velocity < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{velocity > 0 ? `+${velocity}%` : `${velocity}%`} / wk</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase">
              Target Date
            </span>
            <span className="text-slate-300 flex items-center gap-1 mt-0.5 truncate font-medium">
              <Calendar className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{targetDateStr}</span>
            </span>
          </div>
        </div>

        {/* Milestone Summary & Linked Habits/Tasks */}
        <div className="pt-1 border-t border-border/40 space-y-2">
          {milestoneCount > 0 && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>Milestones:</span>
              <strong className="text-foreground font-bold">
                {completedMilestones} / {milestoneCount} completed
              </strong>
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              <span>{habitCount} habits</span>
            </span>
            <span className="flex items-center gap-1">
              <ListTodo className="h-3 w-3 text-blue-400" />
              <span>{taskCount} tasks</span>
            </span>
          </div>
        </div>
      </div>

      {/* Goal Details CTA */}
      <button
        onClick={() => navigate(`/goals/${goal.id}`)}
        className="w-full bg-surface-elevated hover:bg-muted border border-border/60 text-slate-200 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:border-primary/40 group-hover:text-primary shadow-sm"
      >
        <span>Goal Details</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </Card>
  );
};
