import { JournalEntry } from "@/src/models/journal.entry";
import { useState, useEffect, useRef } from "react";
import '@/src/styles/JournalEntryList.css';
import ConfirmationModal from './ConfirmationModal';
import { deleteJournalEntry } from '@/src/client/firebase.service.client';
import { useUser } from "@/src/contexts/UserContext";
import Image from 'next/image';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEntrySelect: (entry: JournalEntry) => void;
}

export function JournalEntryList({ entries, onEntrySelect }: JournalEntryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const { syncLocalUser } = useUser();

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(date));
  };

  const getEntryDisplayText = (entry: JournalEntry) => {
    if (entry.userTitle && entry.userTitle !== '') return entry.userTitle;
    if (entry.title) return entry.title;
    if (entry.summary) {
      const words = entry.summary.split(' ').slice(0, 10).join(' ');
      return words + (entry.summary.split(' ').length > 10 ? '...' : '');
    }
    return new Date(entry.createdAt).toLocaleDateString();
  };

  const getDuration = (entry: JournalEntry) => {
    if (entry.metadata?.duration) {
      return `(${Math.ceil(entry.metadata.duration / 60)} min)`;
    } else if (entry.startTime && entry.endTime) {
      const durationInMinutes = Math.ceil((entry.endTime.getTime() - entry.startTime.getTime()) / 60000);
      return `(${durationInMinutes} min)`;
    }
    return '';
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

  const handleDelete = async (entryId: string) => {
    await deleteJournalEntry(entryId);
    setModalOpen(false);
    await syncLocalUser();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => entryToDelete && handleDelete(entryToDelete)}
      />
      <div ref={containerRef} className="journal-entries">
        <div className="entry-list">
          {entries.length === 0 && (
            <div className="entry-bubble">
              No entries found
            </div>
          )}

          {paginatedEntries.map(entry => (
            <div
              key={entry.id}
              className="entry-bubble"
              onClick={() => onEntrySelect(entry)}
              role="button"
              tabIndex={0}
            >
              <div className="bubble-content">
                <div className="entry-content">
                  <div className="entry-text">{getEntryDisplayText(entry)}</div>
                  <div className="entry-date">
                    {formatDate(entry.endTime)} <span style={{ marginLeft: '8px' }}>{getDuration(entry)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEntryToDelete(entry.id);
                    setModalOpen(true);
                  }}
                >
                  X
                </button>
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
              <Image src="/icons/feather-chevron-left.svg" alt="Previous" width={24} height={24} />
            </button>
            <span>Page {currentPage}</span>
            <button
              disabled={currentPage * pageSize >= entries.length}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <Image src="/icons/feather-chevron-right.svg" alt="Next" width={24} height={24} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
