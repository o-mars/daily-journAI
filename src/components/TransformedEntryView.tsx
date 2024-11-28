interface TransformedEntryViewProps {
  text: string;
}

export function TransformedEntryView({ text }: TransformedEntryViewProps) {
  return (
    <div className="transformed-entry">
      {text.split('\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
} 