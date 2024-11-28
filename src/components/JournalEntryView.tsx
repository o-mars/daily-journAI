import { JournalEntry } from "@/src/models/journal.entry";
import { useState } from "react";
import Conversation from "./Conversation";
import { TransformedEntryView } from "./TransformedEntryView";

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
      <header>
        <button className="back-button" onClick={onBack}>← Back</button>
        <h2>{entry.title || getEntryDisplayText(entry)}</h2>
      </header>

      {entry.transformedEntry && (
        <div className="tabs">
          <button 
            className={activeTab === 'conversation' ? 'active' : ''}
            onClick={() => setActiveTab('conversation')}
          >
            Conversation
          </button>
          <button 
            className={activeTab === 'transformed' ? 'active' : ''}
            onClick={() => setActiveTab('transformed')}
          >
            Transformed Entry
          </button>
        </div>
      )}

      <div className="content">
        {activeTab === 'conversation' ? (
          <Conversation messages={entry.conversation} />
        ) : entry.transformedEntry ? (
          <TransformedEntryView text={entry.transformedEntry!} />
        ) : (
          <p>No transformed entry available</p>
        )}
      </div>
    </div>
  );
} 