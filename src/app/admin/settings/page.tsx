'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSettingsPage() {
  const { firestore } = useFirebase();
  const [watchLiveUrl, setWatchLiveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      if (!firestore) return;
      try {
        const settingsRef = doc(firestore, 'settings', 'general');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setWatchLiveUrl(data.watchLiveUrl || '');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [firestore]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
      setError('Firestore not initialized');
      return;
    }

    // Verify admin session before saving
    try {
      const authCheck = await fetch('/api/admin/check-auth');
      if (!authCheck.ok) {
        setError('Admin session expired. Please login again.');
        return;
      }
    } catch (err) {
      setError('Failed to verify admin session');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const settingsRef = doc(firestore, 'settings', 'general');
      await setDoc(settingsRef, {
        watchLiveUrl: watchLiveUrl || '',
        updatedAt: new Date(),
      }, { merge: true });

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Make sure you are logged in.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure global site settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watch Live Settings</CardTitle>
          <CardDescription>
            Configure where users can watch Manchester United matches live. This link will appear during live matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-900">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="watchLiveUrl">Watch Live URL</Label>
              <Input
                id="watchLiveUrl"
                type="url"
                placeholder="https://example.com/watch-live"
                value={watchLiveUrl}
                onChange={(e) => setWatchLiveUrl(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full URL where users can watch live matches (e.g., streaming service, YouTube live, etc.)
              </p>
              {watchLiveUrl && (
                <a
                  href={watchLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Preview link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
