import NullAudioParam from './null-audio-param';

export default class NullGainNode implements GainNode 
{
	public readonly gain: AudioParam = new NullAudioParam();

	public readonly channelCount: number = 2;
	public readonly channelCountMode: ChannelCountMode = "max";
	public readonly channelInterpretation: ChannelInterpretation = "speakers";

	public readonly context: BaseAudioContext;
	public readonly numberOfInputs: number = 1;
	public readonly numberOfOutputs: number = 1;

	constructor(context: BaseAudioContext) 
	{
		this.context = context;
		this.gain.value = 1;
	}

	public connect(destinationNode: AudioNode | AudioParam, _output?: number, _input?: number): AudioNode 
	{
		return destinationNode as AudioNode;
	}

	public disconnect(): void { }

	public addEventListener(_type: string, _listener: EventListenerOrEventListenerObject | null, _options?: boolean | AddEventListenerOptions): void { }
	public removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject | null, _options?: boolean | EventListenerOptions): void { }
	public dispatchEvent(_event: Event): boolean 
	{
		return true;
	}
}
