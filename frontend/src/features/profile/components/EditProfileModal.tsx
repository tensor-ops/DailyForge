import React, { useState } from 'react';
import { ProfileUserData } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { Edit3, User, Globe, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/dialogs/Dialog';

interface EditProfileModalProps {
  user: ProfileUserData;
  onClose: () => void;
  onSaved: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSaved }) => {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [timezone, setTimezone] = useState(user.timezone || 'UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Display name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await profileService.updateProfile({ name, username, bio, timezone });
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Edit Profile"
      description="Update your Daily Forge identity & preferences"
      icon={Edit3}
      size="sm"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-sunken border border-border/70">
          <Avatar name={name || user.name} size="md" className="h-14 w-14 text-lg font-extrabold" />
          <div>
            <span className="text-xs font-bold text-foreground block">{name || user.name}</span>
            <span className="text-[11px] text-muted-foreground">@{username || user.username}</span>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Avatar auto-generated from initials</p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            maxLength={100}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
            required
          />
        </div>

        {/* Username */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] uppercase font-bold text-muted-foreground">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-muted-foreground text-sm font-medium">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="your_handle"
              maxLength={50}
              className="w-full rounded-xl border border-border bg-surface pl-7 pr-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short note about your Daily Forge journey..."
            maxLength={300}
            rows={2}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition resize-none"
          />
          <span className="text-[10px] text-muted-foreground text-right block">{bio.length}/300</span>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          >
            <option value="UTC">UTC (Universal)</option>
            <option value="America/New_York">Eastern (US & Canada)</option>
            <option value="America/Chicago">Central (US & Canada)</option>
            <option value="America/Denver">Mountain (US & Canada)</option>
            <option value="America/Los_Angeles">Pacific (US & Canada)</option>
            <option value="America/Toronto">Toronto</option>
            <option value="America/Vancouver">Vancouver</option>
            <option value="America/Sao_Paulo">São Paulo</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris / Berlin</option>
            <option value="Europe/Moscow">Moscow</option>
            <option value="Asia/Dubai">Dubai</option>
            <option value="Asia/Kolkata">Mumbai / Kolkata (IST)</option>
            <option value="Asia/Singapore">Singapore</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Shanghai">Beijing / Shanghai</option>
            <option value="Australia/Sydney">Sydney</option>
            <option value="Pacific/Auckland">Auckland</option>
          </select>
        </div>

        {error && <p className="text-xs text-destructive font-bold">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="flex-1 text-xs font-bold gap-1.5"
            disabled={loading}
          >
            {success ? (
              <>
                <Check className="h-3.5 w-3.5" /> Saved!
              </>
            ) : loading ? (
              'Saving...'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
