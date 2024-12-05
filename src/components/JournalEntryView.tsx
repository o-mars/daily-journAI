import { JournalEntry } from "@/src/models/journal.entry";
import { useState, useEffect } from "react";
import Conversation from "./Conversation";
import { TransformedEntryView } from "./TransformedEntryView";
import '@/src/styles/JournalEntryView.css';
import Image from "next/image";
import { updateJournalEntry } from "@/src/client/firebase.service.client";
import { useUser } from "@/src/contexts/UserContext";

interface JournalEntryViewProps {
  entry: JournalEntry;
  onBack: () => void;
}

const getEntryDisplayText = (entry: JournalEntry) => {
  if (entry.title) return entry.title;
  if (entry.summary) {
    const words = entry.summary.split(' ').slice(0, 10).join(' ');
    return words + (entry.summary.split(' ').length > 10 ? '...' : '');
  }
  return '';
};

export function JournalEntryView({ entry, onBack }: JournalEntryViewProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'transformed'>('conversation');
  const [editedTitle, setEditedTitle] = useState(getEntryDisplayText(entry));
  const [editedTransformedEntry, setEditedTransformedEntry] = useState(entry.transformedEntry);
  const [isEdited, setIsEdited] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'none' | 'success' | 'error'>('none');
  const { syncLocalUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedTitle(getEntryDisplayText(entry));
    setEditedTransformedEntry(entry.transformedEntry);
    setIsEdited(false);
  }, [entry]);

  const handleCancel = () => {
    setEditedTitle(getEntryDisplayText(entry));
    setEditedTransformedEntry(entry.transformedEntry);
    setIsEdited(false);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<JournalEntry> = {};
      if (editedTitle !== entry.title) updates.title = editedTitle;
      if (editedTransformedEntry !== entry.transformedEntry) updates.transformedEntry = editedTransformedEntry;

      await updateJournalEntry(entry.id!, updates);
      setIsSaving(false);
      setUpdateStatus('success');
      await syncLocalUser();
    } catch (error) {
      console.error(error);
      setIsSaving(false);
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

  return (
    <div className="journal-entry-view">
      <div className="content">
        <div className="content-card">
          <div className="content-card-header">
            <button className="back-button" onClick={onBack}>
              <Image width={32} height={32} src="/icons/feather-chevron-left.svg" alt="Back" />
            </button>
            <div className="content-card-header-title">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="title-input"
              />
            </div>
            <div className="content-card-header-action">
              {isEdited && (
                <>
                  {isSaving ? (
                    <div className="save-status spinner">
                      {/* Basic spinner div */}
                    </div>
                  ) : updateStatus === 'none' ? (
                    <>
                      <button
                        className="cancel-button"
                        onClick={handleCancel}
                      >
                        <Image width={24} height={23} src="/icons/cross-mark-red.png" alt="Cancel" />
                      </button>
                      <button
                        className="save-button"
                        onClick={handleUpdate}
                      >
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
              {entry.transformedEntry && (
                <button 
                  className="toggle-view-button"
                  onClick={() => setActiveTab(activeTab === 'conversation' ? 'transformed' : 'conversation')}
                >
                  {activeTab === 'conversation' ? 'View Edited Entry' : 'View Conversation'}
                </button>
              )}
            </div>
          </div>
          <div className="content-card-body">
            {activeTab === 'conversation' ? (
              <Conversation messages={entry.conversation} />
            ) : editedTransformedEntry ? (
              <TransformedEntryView
                text={editedTransformedEntry}
                onChange={handleTransformedEntryChange}
              />
            ) : (
              <p>No transformed entry available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 