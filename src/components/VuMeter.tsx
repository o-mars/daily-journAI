interface VuMeterProps {
  fftData: number[];
  height: number;
  barCount: number;
  barColor: string;
  barWidth?: number;
}

export default function VuMeter({
  fftData,
  height = 32,
  barCount = 5,
  barColor = "rgb(229, 229, 234)",
  barWidth
}: VuMeterProps) {
  const sampledData = Array.from({ length: barCount }, (_, i) => {
    const index = Math.floor((i / barCount) * fftData.length);
    return Math.min(1, fftData[index] || 0);
  });

  return (
    <div
      className="flex items-center gap-[2px]"
      style={{ height: `${height}px`, width: `${(barWidth || 4) * barCount + (barCount - 1) * 2}px` }}
    >
      {sampledData.map((value, index) => (
        <div
          key={index}
          className="relative"
          style={{
            height: '100%',
            width: `${barWidth || 4}px`,
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        >
          <div
            className="absolute bottom-1/2 rounded-t transition-all duration-75"
            style={{
              width: '100%',
              height: `${value * height / 2}px`,
              backgroundColor: barColor,
              opacity: value > 0 ? 1 : 0
            }}
          />
          <div
            className="absolute top-1/2 rounded-b transition-all duration-75"
            style={{
              width: '100%',
              height: `${value * height / 2}px`,
              backgroundColor: barColor,
              opacity: value > 0 ? 1 : 0
            }}
          />
        </div>
      ))}
    </div>
  );
} 