interface TransformedEntryViewProps {
  text: string;
}

export function TransformedEntryView({ text }: TransformedEntryViewProps) {
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