import NullAudioParam from './null-audio-param';

export default class NullPannerNode implements PannerNode
{
	public readonly panningModel: PanningModelType = "equalpower";
	public readonly distanceModel: DistanceModelType = "inverse";

	public readonly refDistance: number = 1;
	public readonly maxDistance: number = 10000;
	public readonly rolloffFactor: number = 1;

	public readonly coneInnerAngle: number = 360;
	public readonly coneOuterAngle: number = 360;
	public readonly coneOuterGain: number = 0;

	public readonly positionX: AudioParam = new NullAudioParam();
	public readonly positionY: AudioParam = new NullAudioParam();
	public readonly positionZ: AudioParam = new NullAudioParam();

	public readonly orientationX: AudioParam = new NullAudioParam();
	public readonly orientationY: AudioParam = new NullAudioParam();
	public readonly orientationZ: AudioParam = new NullAudioParam();

	public readonly channelCount: number = 2;
	public readonly channelCountMode: ChannelCountMode = "clamped-max";
	public readonly channelInterpretation: ChannelInterpretation = "speakers";

	public readonly context: BaseAudioContext;
	public readonly numberOfInputs: number = 1;
	public readonly numberOfOutputs: number = 2;

	constructor(context: BaseAudioContext)
	{
		this.context = context;
	}

	public setPosition(_x: number, _y: number, _z: number): void {}
	public setOrientation(_x: number, _y: number, _z: number): void {}

	// AudioNode methods
	public connect(destinationNode: AudioNode | AudioParam, _output?: number, _input?: number): AudioNode 
	{
		return destinationNode as AudioNode;
	}

	public disconnect(): void {}

	public addEventListener(_type: string, _listener: EventListenerOrEventListenerObject | null, _options?: boolean | AddEventListenerOptions): void {}
	public removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject | null, _options?: boolean | EventListenerOptions): void {}

	public dispatchEvent(_event: Event): boolean 
	{
		return true;
	}
}