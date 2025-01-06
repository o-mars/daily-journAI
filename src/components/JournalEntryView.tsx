import { JournalEntry } from "@/src/models/journal.entry";
import { useState, useEffect, useRef } from "react";
import Conversation from "./Conversation";
import { TransformedEntryView } from "./TransformedEntryView";
import '@/src/styles/JournalEntryView.css';
import Image from "next/image";
import { updateJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";
import { trackEvent } from "@/src/services/metricsSerivce";
import { generateTransformedEntry } from "@/src/client/openai.service.client";

interface JournalEntryViewProps {
  entry: JournalEntry;
}

const getEntryDisplayText = (entry: JournalEntry) => {
  if (entry.userTitle && entry.userTitle !== '') return entry.userTitle;
  if (entry.title) return entry.title;
  if (entry.summary) {
    const words = entry.summary.split(' ').slice(0, 10).join(' ');
    return words + (entry.summary.split(' ').length > 10 ? '...' : '');
  }
  return '';
};

function calculateTitleSize(title: string, containerWidth: number): string {
  const charWidth = 10; // Approximate width of a character in pixels
  const titleLength = title.length;
  const approximateWidth = titleLength * charWidth;

  if (approximateWidth < containerWidth * 0.6) return 'size-xl';
  if (approximateWidth < containerWidth * 0.8) return 'size-lg';
  if (approximateWidth < containerWidth * 0.9) return 'size-md';
  if (approximateWidth < containerWidth * 1.0) return 'size-sm';
  return 'size-xs';
}

export function JournalEntryView({ entry }: JournalEntryViewProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'transformed'>('conversation');
  const [editedTitle, setEditedTitle] = useState(getEntryDisplayText(entry));
  const [editedTransformedEntry, setEditedTransformedEntry] = useState(entry.transformedEntry);
  const [isEdited, setIsEdited] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'none' | 'success' | 'error'>('none');
  const { user, syncLocalUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [titleSizeClass, setTitleSizeClass] = useState('size-lg');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(getEntryDisplayText(entry));
    setEditedTransformedEntry(entry.transformedEntry);
    setIsEdited(false);
  }, [entry]);

  useEffect(() => {
    const updateTitleSize = () => {
      if (titleRef.current) {
        const containerWidth = titleRef.current.parentElement?.offsetWidth || 0;
        const sizeClass = calculateTitleSize(editedTitle, containerWidth);
        setTitleSizeClass(sizeClass);
      }
    };

    updateTitleSize();
    window.addEventListener('resize', updateTitleSize);
    return () => window.removeEventListener('resize', updateTitleSize);
  }, [editedTitle]);

  const handleCancel = () => {
    setEditedTitle(getEntryDisplayText(entry));
    setEditedTransformedEntry(entry.transformedEntry);
    setIsEdited(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const updates: Partial<JournalEntry> = {};
      if (editedTitle !== entry.userTitle) updates.userTitle = editedTitle;
      if (editedTransformedEntry !== entry.transformedEntry) updates.transformedEntry = editedTransformedEntry;

      await updateJournalEntry(entry.id!, updates);
      trackEvent("journals", "journal-updated", { userId: user?.userId, journalId: entry.id! });
      if (updates.userTitle) trackEvent("journals", "journal-title-updated", { userId: user?.userId, journalId: entry.id! });
      if (updates.transformedEntry) trackEvent("journals", "journal-notes-updated", { userId: user?.userId, journalId: entry.id! });
      if (updates.userTitle === entry.title) trackEvent("journals", "journal-title-reverted", { userId: user?.userId, journalId: entry.id! });
      setIsLoading(false);
      setUpdateStatus('success');
      await syncLocalUser();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setUpdateStatus('error');
    } finally {
      setTimeout(() => {
        setUpdateStatus('none');
        setIsEdited(false);
      }, 500);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setEditedTitle(newTitle);
    setIsEdited(newTitle !== entry.title || editedTransformedEntry !== entry.transformedEntry);
  };

  const handleTransformedEntryChange = (newText: string) => {
    setEditedTransformedEntry(newText);
    setIsEdited(editedTitle !== entry.title || newText !== entry.transformedEntry);
  };

  const handleGenerateNotes = async () => {
    setIsLoading(true);
    setIsEdited(true);
    try {
      const response = await generateTransformedEntry(entry.conversation);
      setEditedTransformedEntry(response.transformedEntry);
    } catch {
      setIsEdited(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="journal-entry-view">
      <div className="content">
        <div className="content-card">
          <div className="content-card-header">
            <div className="content-card-header-title">
              <input
                ref={titleRef}
                type="text"
                value={editedTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`title-input ${titleSizeClass}`}
              />
            </div>
          </div>
          <div className="content-card-body">
            {activeTab === 'conversation' ? (
              <Conversation messages={entry.conversation} />
            ) : (
              <TransformedEntryView
                text={editedTransformedEntry || ''}
                onChange={handleTransformedEntryChange}
              />
            )}
          </div>
          <div className="content-card-footer">
            <div className="footer-left">
              {activeTab === 'transformed' && (
                <button
                  className="generate-notes-button"
                  onClick={handleGenerateNotes}
                  disabled={isLoading}
                >
                  <Image width={24} height={24} src="/icons/page.png" alt="Generate Notes" />
                </button>
              )}
            </div>
            <div className="save-actions">
              {isEdited && (
                <>
                  {isLoading ? (
                    <div className="save-status spinner" />
                  ) : updateStatus === 'none' ? (
                    <>
                      <button className="cancel-button" onClick={handleCancel}>
                        <Image width={24} height={23} src="/icons/cross-mark-red.png" alt="Cancel" />
                      </button>
                      <button className="save-button" onClick={handleUpdate}>
                        <Image width={24} height={24} src="/icons/check-green.png" alt="Save" />
                      </button>
                    </>
                  ) : (
                    <div className={`save-status ${updateStatus}`}>
                      <span>{updateStatus === 'success' ? 'Success!' : 'Failed!'}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="footer-right">
              <button
                className="toggle-view-button"
                onClick={() => setActiveTab(activeTab === 'conversation' ? 'transformed' : 'conversation')}
                title={activeTab === 'conversation' ? 'Notes' : 'Conversation'}
              >
                {activeTab === 'conversation' ?
                  <Image width={24} height={24} src="/icons/notes.png" alt="Notes" /> :
                  <Image width={24} height={24} src="/icons/chat.png" alt="Conversation" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 