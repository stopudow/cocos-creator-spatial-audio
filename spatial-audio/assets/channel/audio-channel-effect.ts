import { _decorator, AudioClip, CCFloat, Enum } from 'cc';
import { audioManager } from '../audio-manager';

const { ccclass, property, type } = _decorator;

export enum AudioChannelEffectType
{
	CONVOLVER,
	LOWPASS,
	HIGHPASS,
	DISTORTION
}

@ccclass("AudioChannelEffect")
export class AudioChannelEffect
{
	@type(Enum(AudioChannelEffectType))
	public type: AudioChannelEffectType = AudioChannelEffectType.LOWPASS;

	@property({
		type: CCFloat,
		displayName: "Cutoff Frequency",
		min: 0,
		max: 22000,
		slide: true,
		visible: isBiquad
	})
	public cutoffFrequency: number = 5000;

	@property({
		type: CCFloat,
		displayName: "Resonanse Q",
		visible: isBiquad
	})
	public resonanseQ: number = 1;

	@property({		
		type: AudioClip,
		displayName: "Impulse Reference",
		visible: isConvolver
	})
	public clip: AudioClip = null;
	
	@property({
		type: CCFloat,
		displayName: "Distortion Amount",
		visible: isDistortion
	})
	public distortionAmount: number = 400;

	private declare _audioNode: AudioNode;

	public get audioNode(): AudioNode
	{
		return this._audioNode;
	}

	public init(): AudioNode
	{
		switch (this.type)
		{
			case AudioChannelEffectType.CONVOLVER:
				this._audioNode = this.createConvolverAudioNode();
				break;
			case AudioChannelEffectType.HIGHPASS:
			case AudioChannelEffectType.LOWPASS:
				this._audioNode = this.createBiquadNode();
				break;
			case AudioChannelEffectType.DISTORTION:
				this._audioNode = this.createDistortionNode();
		}

		return this._audioNode;
	}

	private createConvolverAudioNode(): AudioNode
	{
		const convolverNode  = audioManager.context.createConvolver();
		convolverNode.buffer = audioManager.getAudioBuffer(this.clip);

		return convolverNode;
	}

	private createBiquadNode(): AudioNode
	{
		const biquadFilter = audioManager.context.createBiquadFilter();

		if (this.type === AudioChannelEffectType.LOWPASS)
			biquadFilter.type = "lowpass";

		if (this.type === AudioChannelEffectType.HIGHPASS)
			biquadFilter.type = "highpass";

		biquadFilter.frequency.value = this.cutoffFrequency;
		biquadFilter.Q.value = this.resonanseQ;

		return biquadFilter;
	}

	private createDistortionNode(): AudioNode
	{
		const waveShaperNode = audioManager.context.createWaveShaper();

		waveShaperNode.curve = this._makeDistortionCurve(this.distortionAmount);

		return waveShaperNode;
	}

	// Distortion curve for the waveshaper, thanks to Kevin Ennis
	// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
	private _makeDistortionCurve(amount: number = 50): Float32Array<ArrayBuffer>
	{
		let k = amount;
		let n_samples = 44100;
	    let curve = new Float32Array(n_samples);
	    let deg = Math.PI / 180;
	    let i = 0;
	    let x;

	  	for (; i < n_samples; ++i) 
		{
			x = (i * 2) / n_samples - 1;
			curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
	  	}

	  	return curve;
	}
}

function isConvolver(this: AudioChannelEffect)
{
	return this.type === AudioChannelEffectType.CONVOLVER;
}

function isBiquad(this: AudioChannelEffect)
{
	return this.type === AudioChannelEffectType.LOWPASS || 
		   this.type === AudioChannelEffectType.HIGHPASS;
}

function isDistortion(this: AudioChannelEffect)
{
	return this.type === AudioChannelEffectType.DISTORTION;
}