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
          outline: 'none', // Remove default outline
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid #444'; // Change border color on focus
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = 'none'; // Reset border color on blur
        }}
      />
    );
  }

  return (
    <div className="transformed-entry" style={{
      padding: '1.5rem',
    }}>
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