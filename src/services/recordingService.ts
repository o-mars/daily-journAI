export interface RecordingMetadata {
  duration: number;
  startTime: Date;
  endTime: Date;
  mimeType: string;
}

export interface SessionRecording {
  blob: Blob;
  metadata: RecordingMetadata;
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private startTime: Date | null = null;
  private mimeType: string | null = null;

  constructor() {}

  private getMimeType(): string {
    if (!this.mimeType) {
      // Only check MediaRecorder support when actually needed
      this.mimeType = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
    }
    return this.mimeType;
  }

  startRecording(tracks: MediaStreamTrack[]): void {
    if (!tracks.length) return;

    this.audioContext = new AudioContext();
    
    const sources = tracks.filter(track => !!track).map(track => this.audioContext!.createMediaStreamSource(new MediaStream([track])));
    const destination = this.audioContext!.createMediaStreamDestination();

    sources.forEach(source => source.connect(destination));

    this.mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: this.getMimeType(),
      audioBitsPerSecond: 128000
    });
    
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    this.startTime = new Date();
  }

  stopRecording(): Promise<SessionRecording | null> {
    if (!this.mediaRecorder || !this.startTime) return Promise.resolve(null);

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const startTime = this.startTime!;
        const endTime = new Date();
        const duration = endTime.getTime() - this.startTime!.getTime();

        const audioBlob = new Blob(this.audioChunks, { type: this.getMimeType() });
        
        // Clean up
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.startTime = null;

        resolve({
          blob: audioBlob,
          metadata: {
            duration,
            startTime,
            endTime,
            mimeType: this.getMimeType()
          }
        });
      };

      this.mediaRecorder!.stop();
    });
  }

  isRecording(): boolean {
    return !!this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
} 