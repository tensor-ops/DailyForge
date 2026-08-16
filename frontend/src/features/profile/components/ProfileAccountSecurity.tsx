import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { profileService } from '@/services/profileService';
import {
  ShieldCheck,
  Key,
  Download,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileAccountSecurityProps {
  email: string;
  onExportData: () => void;
}

export const ProfileAccountSecurity: React.FC<ProfileAccountSecurityProps> = ({
  email,
  onExportData,
}) => {
  const { logout } = useAuth();

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setPasswordError('');
    setPasswordLoading(true);
    try {
      const res = await profileService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password updated successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await profileService.deleteAccount(deletePassword);
      logout();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Incorrect password. Account deletion aborted.');
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Account &amp; Security
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Credentials, data management, and account control</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Account Info */}
        <div className="p-4 rounded-xl bg-surface border border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Active Session</span>
              <span className="text-[11px] text-muted-foreground">{email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {/* Change Password */}
        <div className="p-4 rounded-xl bg-surface border border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Change Password</span>
                <span className="text-[11px] text-muted-foreground">Update your login credentials</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold"
              onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(''); setPasswordSuccess(''); }}
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </Button>
          </div>

          {passwordSuccess && (
            <div className="text-xs font-bold text-success flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {passwordSuccess}
            </div>
          )}

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-9 text-xs font-medium text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-9 text-xs font-medium text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                required
              />

              {passwordError && (
                <p className="text-xs text-destructive font-bold">{passwordError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </div>

        {/* Export Data */}
        <div className="p-4 rounded-xl bg-surface border border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Export My Data</span>
              <span className="text-[11px] text-muted-foreground">Download a full JSON backup of your habits, goals, and insights</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportData}
            className="text-xs font-bold text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
          >
            Export
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-destructive block">Delete Account</span>
                <span className="text-[11px] text-muted-foreground">Permanently remove your Daily Forge account and all data</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowDeleteConfirm(!showDeleteConfirm); setDeleteError(''); }}
              className="text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {showDeleteConfirm ? 'Cancel' : 'Delete'}
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2 text-xs">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span className="text-foreground font-medium">
                  This action is irreversible. All your habits, completions, goals, and insights will be permanently deleted.
                </span>
              </div>
              <input
                type="password"
                placeholder="Confirm with your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-xs font-medium text-foreground placeholder-muted-foreground outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/30 transition"
              />
              {deleteError && (
                <p className="text-xs text-destructive font-bold">{deleteError}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full text-xs font-black text-destructive border-destructive/40 hover:bg-destructive hover:text-white transition"
              >
                {deleteLoading ? 'Deleting Account...' : 'Yes, Permanently Delete My Account'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
