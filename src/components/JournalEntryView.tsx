import { JournalEntry } from "@/src/models/journal.entry";
import { useState } from "react";
import Conversation from "./Conversation";
import { TransformedEntryView } from "./TransformedEntryView";
import '@/src/styles/JournalEntryView.css';

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

  console.log(entry);

  return (
    <div className="journal-entry-view">
      <header>
        <div className="header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <h2>{entry.title || getEntryDisplayText(entry)}</h2>
        </div>
        {entry.transformedEntry && (
          <button 
            className="toggle-view-button"
            onClick={() => setActiveTab(activeTab === 'conversation' ? 'transformed' : 'conversation')}
          >
            {activeTab === 'conversation' ? 'View Edited Entry' : 'View Conversation'}
          </button>
        )}
      </header>

      <div className="content">
        <div className="content-card">
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
  );
} 