import { JournalEntry } from "@/src/models/journal.entry";
import { useState, useEffect, useRef } from "react";
import '@/src/styles/JournalEntryList.css';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEntrySelect: (entry: JournalEntry) => void;
}

export function JournalEntryList({ entries, onEntrySelect }: JournalEntryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getEntryDisplayText = (entry: JournalEntry) => {
    if (entry.title) return entry.title;
    if (entry.summary) {
      const words = entry.summary.split(' ').slice(0, 10).join(' ');
      return words + (entry.summary.split(' ').length > 10 ? '...' : '');
    }
    return new Date(entry.createdAt).toLocaleDateString();
  };

  useEffect(() => {
    const updatePageSize = () => {
      if (containerRef.current) {
        const fixedHeaderHeight = 90 + 68;
        const entryHeight = 78;
        const containerHeight = containerRef.current.clientHeight;
        const newPageSize = Math.floor((containerHeight - fixedHeaderHeight) / entryHeight);
        setPageSize(newPageSize);
      }
    };

    updatePageSize(); // Initial calculation
    window.addEventListener('resize', updatePageSize); // Update on resize

    return () => {
      window.removeEventListener('resize', updatePageSize); // Cleanup
    };
  }, []);

  const paginatedEntries = entries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div ref={containerRef} className="journal-entries">
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
              <div className="entry-date">{formatDate(entry.endTime)}</div>
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

