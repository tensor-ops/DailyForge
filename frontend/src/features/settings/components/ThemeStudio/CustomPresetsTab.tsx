import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { BookmarkPlus, Download, Upload, RotateCcw, Trash2, Check } from 'lucide-react';

export const CustomPresetsTab: React.FC = () => {
  const {
    customPresets,
    saveCustomPreset,
    applyCustomPreset,
    deleteCustomPreset,
    exportThemeJson,
    importThemeJson,
    resetAppearance,
    resetAll,
  } = useTheme();

  const { success, error, info } = useToast();
  const [presetName, setPresetName] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    saveCustomPreset(presetName.trim());
    success('Preset Saved', `Your theme configuration has been saved as "${presetName.trim()}".`);
    setPresetName('');
  };

  const handleExport = () => {
    try {
      const jsonStr = exportThemeJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dailyforge-theme-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('Theme Exported', 'Theme JSON downloaded successfully.');
    } catch {
      error('Export Failed', 'Unable to create theme export file.');
    }
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importThemeJson(importJsonText.trim());
    if (res.success) {
      success('Theme Imported', 'Custom theme configuration applied successfully.');
      setImportJsonText('');
      setIsImportOpen(false);
    } else {
      error('Import Error', res.error || 'Invalid theme JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importThemeJson(content);
        if (res.success) {
          success('Theme Imported', `Loaded theme from "${file.name}".`);
        } else {
          error('Import Failed', res.error || 'Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Save Current Configuration */}
      <div className="p-4 rounded-xl border border-border/80 bg-surface-elevated space-y-3">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="h-4.5 w-4.5 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Save Current Visual Studio Profile
          </h4>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Store your customized mix of presets, accents, density, radius, and chart palettes for instant 1-click loading.
        </p>

        <form onSubmit={handleSavePreset} className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g. Deep Midnight Study"
            className="flex-1 px-3 py-2 text-xs bg-input border border-input-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!presetName.trim()}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-white hover:bg-primary-hover transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Save Preset
          </button>
        </form>
      </div>

      {/* 2. Saved Custom Presets List */}
      {customPresets.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
            Your Custom Presets ({customPresets.length})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                className="p-3 rounded-xl border border-border bg-surface-elevated flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="text-foreground font-extrabold block truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {preset.config.preset} · {preset.config.accent} · {preset.config.density}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      applyCustomPreset(preset);
                      success('Preset Applied', `Loaded "${preset.name}".`);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Apply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteCustomPreset(preset.id);
                      info('Preset Removed', `Deleted "${preset.name}".`);
                    }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Export & Import */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Export &amp; Import Theme Schema
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-muted flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
          >
            <div>
              <span className="text-foreground font-extrabold block">Export Theme (JSON)</span>
              <span className="text-[10px] text-muted-foreground block font-normal">
                Download your complete DailyForge configuration
              </span>
            </div>
            <Download className="h-4.5 w-4.5 text-primary shrink-0" />
          </button>

          {/* Import file upload label */}
          <label className="p-3.5 rounded-xl border border-border bg-surface-elevated hover:bg-muted flex items-center justify-between gap-3 text-left transition-all cursor-pointer">
            <div>
              <span className="text-foreground font-extrabold block">Import Theme File</span>
              <span className="text-[10px] text-muted-foreground block font-normal">
                Load .json file directly from disk
              </span>
            </div>
            <Upload className="h-4.5 w-4.5 text-primary shrink-0" />
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Paste JSON toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
          >
            {isImportOpen ? 'Hide JSON Paste Input' : 'Or paste Theme JSON directly...'}
          </button>

          {isImportOpen && (
            <div className="mt-2 space-y-2">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"schemaVersion": 1, "config": { ... }}'
                rows={4}
                className="w-full p-2.5 text-xs font-mono bg-input border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Validate &amp; Apply JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Reset Actions */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider text-danger">
          Theme Reset Options
        </label>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              resetAppearance();
              success('Theme Reset', 'Reset appearance to default Daily Forge Dark aesthetic.');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-surface-elevated hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Reset Appearance</span>
          </button>
          <button
            type="button"
            onClick={() => {
              resetAll();
              success('Factory Reset', 'All Theme Studio preferences restored to initial defaults.');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-danger/20 bg-danger/10 hover:bg-danger/20 text-danger transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-danger" />
            <span>Reset Everything (Factory Defaults)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
