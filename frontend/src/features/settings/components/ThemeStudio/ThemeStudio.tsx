import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LivePreview } from './LivePreview';
import { PresetsGrid } from './PresetsGrid';
import { AppearanceTab } from './AppearanceTab';
import { LayoutTab } from './LayoutTab';
import { TypographyChartsTab } from './TypographyChartsTab';
import { AccessibilityTab } from './AccessibilityTab';
import { CustomPresetsTab } from './CustomPresetsTab';
import { Palette, Sliders, Layout, BarChart2, Eye, BookmarkCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

type StudioSection = 'appearance' | 'layout' | 'typography' | 'accessibility' | 'presets';

export const ThemeStudio: React.FC = () => {
  const [activeSection, setActiveSection] = useState<StudioSection>('appearance');

  const navItems = [
    { id: 'appearance' as StudioSection, label: 'Appearance', icon: Palette, desc: 'Mode, Accents & Surfaces' },
    { id: 'layout' as StudioSection, label: 'Layout & Density', icon: Layout, desc: 'Radius, Spacing & Sidebar' },
    { id: 'typography' as StudioSection, label: 'Typography & Charts', icon: BarChart2, desc: 'Scale & Data Palettes' },
    { id: 'accessibility' as StudioSection, label: 'Accessibility & Motion', icon: Eye, desc: 'Contrast, Focus & Speed' },
    { id: 'presets' as StudioSection, label: 'Custom & Export', icon: BookmarkCheck, desc: 'Save & Import Schemas' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Live Interactive Workspace Preview */}
      <Card className="p-5 sm:p-6 space-y-4">
        <LivePreview />
      </Card>

      {/* 2. 10 Theme Presets Gallery */}
      <Card className="p-5 sm:p-6 space-y-4">
        <PresetsGrid />
      </Card>

      {/* 3. Deep Modular Customization Studio */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-primary" />
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Granular Design Studio
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Fine-tune every visual token, surface interaction, and data visualization palette
              </p>
            </div>
          </div>

          {/* Section Selector Tabs */}
          <div className="flex flex-wrap gap-1 bg-surface-sunken p-1 rounded-xl border border-border text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer select-none text-[11px]',
                    isActive
                      ? 'bg-surface-elevated text-foreground font-extrabold shadow-xs border border-border/70'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="pt-1">
          {activeSection === 'appearance' && <AppearanceTab />}
          {activeSection === 'layout' && <LayoutTab />}
          {activeSection === 'typography' && <TypographyChartsTab />}
          {activeSection === 'accessibility' && <AccessibilityTab />}
          {activeSection === 'presets' && <CustomPresetsTab />}
        </div>
      </Card>
    </div>
  );
};
