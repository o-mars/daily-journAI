import { JournalEntry } from "@/src/models/journal.entry";
import { useState } from "react";
import '@/src/styles/JournalEntryList.css';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEntrySelect: (entry: JournalEntry) => void;
  pageSize?: number;
}

export function JournalEntryList({ entries, onEntrySelect, pageSize = 10 }: JournalEntryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedEntries = entries
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getEntryDisplayText = (entry: JournalEntry) => {
    if (entry.title) return entry.title;
    if (entry.summary) {
      const words = entry.summary.split(' ').slice(0, 10).join(' ');
      return words + (entry.summary.split(' ').length > 10 ? '...' : '');
    }
    return new Date(entry.createdAt).toLocaleDateString();
  };

  console.log(entries);

  return (
    <div className="journal-entries">
      <h2>Journal Entries</h2>
      <div className="entry-list">
        {paginatedEntries.map(entry => (
          <div 
            key={entry.id} 
            className="entry-bubble"
            onClick={() => onEntrySelect(entry)}
            role="button"
            tabIndex={0}
          >
            <div className="bubble-content">
              <div className="entry-text">{getEntryDisplayText(entry)}</div>
              <div className="entry-date">{new Date(entry.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
      
      {entries.length > pageSize && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button 
            disabled={currentPage * pageSize >= entries.length}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 