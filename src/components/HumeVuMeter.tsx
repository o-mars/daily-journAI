interface HumeVuMeterProps {
  fftData: number[];
  height?: number;
  barCount?: number;
  barColor?: string;
}

export default function HumeVuMeter({ 
  fftData,
  height = 32,
  barCount = 5,
  barColor = "rgb(229, 229, 234)"
}: HumeVuMeterProps) {
  const sampledData = Array.from({ length: barCount }, (_, i) => {
    const index = Math.floor((i / barCount) * fftData.length);
    return Math.min(1, fftData[index] || 0);
  });

  return (
    <div className="flex items-center gap-[2px]" style={{ height: `${height}px`, width: '32px' }}>
      {sampledData.map((value, index) => (
        <div
          key={index}
          className="w-1 relative"
          style={{ height: '100%' }}
        >
          <div
            className="w-full absolute bottom-1/2 rounded-t transition-all duration-75"
            style={{
              height: `${Math.max(2, (value * height) / 2)}px`,
              backgroundColor: barColor
            }}
          />
          <div
            className="w-full absolute top-1/2 rounded-b transition-all duration-75"
            style={{
              height: `${Math.max(2, (value * height) / 2)}px`,
              backgroundColor: barColor
            }}
          />
        </div>
      ))}
    </div>
  );
} 