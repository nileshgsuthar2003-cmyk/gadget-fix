import { createFileRoute } from '@tanstack/react-router'
import { DesktopHeader, DesktopFooter } from '../components/shell'
import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await api.getSettings();
        if (res && res.settings) {
          setContent(res.settings.terms_policy || 'No terms and conditions have been set yet.');
        }
      } catch (error) {
        setContent('Failed to load terms and conditions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <DesktopHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-8">Terms & Conditions</h1>
        
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
            {content}
          </div>
        )}
      </main>
      <DesktopFooter />
    </div>
  );
}
