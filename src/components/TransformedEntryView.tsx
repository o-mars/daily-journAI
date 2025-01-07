interface TransformedEntryViewProps {
  text: string;
  onChange?: (text: string) => void;
}
export function TransformedEntryView({ text, onChange }: TransformedEntryViewProps) {
  if (onChange) {
    return (
      <textarea
        className="transformed-entry"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add notes here..."
        style={{
          width: '100%',
          minHeight: '98%',
          padding: '1.5rem',
          border: 'none',
          resize: 'none',
          background: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          outline: 'none',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid #444';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = 'none';
        }}
      />
    );
  }

  return (
    <div
      className="transformed-entry"
      style={{
        padding: '1.5rem',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        maxHeight: '100%',
        height: '100%',
      }}
    >
      {text.split('\n').map((paragraph, index) => (
        <p key={index} style={{
          marginBottom: index < text.split('\n').length - 1 ? '1rem' : 0,
        }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
} 