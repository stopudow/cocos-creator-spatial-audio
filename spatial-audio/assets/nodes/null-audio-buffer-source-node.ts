import NullAudioParam from './null-audio-param';

export default class NullAudioBufferSourceNode implements AudioBufferSourceNode 
{
    public buffer: AudioBuffer | null = null;

    public loop: boolean = false;

    public loopEnd: number = 0;
    public loopStart: number = 0;

    public detune: AudioParam = new NullAudioParam();
    public playbackRate: AudioParam = new NullAudioParam();

    readonly channelCount: number = 1;
    readonly channelCountMode: ChannelCountMode = "max";
    readonly channelInterpretation: ChannelInterpretation = "speakers";

    readonly context: BaseAudioContext;
    readonly numberOfInputs: number = 0;
    readonly numberOfOutputs: number = 1;
    
    public onended: ((this: AudioScheduledSourceNode, ev: Event) => any) | null = null;

    constructor(context: BaseAudioContext) 
    {
        this.context = context;
		this.playbackRate.value = 1;
    }

    public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, _options?: boolean | AddEventListenerOptions): void { }
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, _options?: boolean | EventListenerOptions): void { }
    public dispatchEvent(_event: Event): boolean 
    {
        return true;
    }

    public start(_when?: number, _offset?: number, _duration?: number): void { }
    public stop(_when?: number): void { }

    public connect(destinationNode: AudioNode | AudioParam, _output?: number, _input?: number): AudioNode 
    {
        return destinationNode as AudioNode;
    }

    public disconnect(): void { }
}