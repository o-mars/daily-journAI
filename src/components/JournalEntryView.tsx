import { JournalEntry } from "@/src/models/journal.entry";
import { useState } from "react";
import Conversation from "./Conversation";
import { TransformedEntryView } from "./TransformedEntryView";
import '@/src/styles/JournalEntryView.css';
import Image from "next/image";

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
  const [activeTab, setActiveTab] = useState<'conversation' | 'transformed'>(
    entry.transformedEntry ? 'transformed' : 'conversation'
  );

  return (
    <div className="journal-entry-view">
      <div className="content">
        <div className="content-card">
          <div className="content-card-header">
            <button className="back-button" onClick={onBack}>
              <Image width={32} height={32} src="/icons/feather-chevron-left.svg" alt="Back" />
            </button>
            <div className="content-card-header-title">
              {entry.title || getEntryDisplayText(entry)}
            </div>
            <div className="content-card-header-action">
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
            ) : entry.transformedEntry ? (
              <TransformedEntryView text={entry.transformedEntry!} />
            ) : (
              <p>No transformed entry available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 