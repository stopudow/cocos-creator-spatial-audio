import { _decorator, CCFloat, Component } from 'cc';
import { audioManager } from '../audio-manager';
import { AudioChannelEffect } from './audio-channel-effect';

const { ccclass, menu, property } = _decorator;


@ccclass('AudioChannel')
@menu('Audio/AudioChannel')
export class AudioChannel extends Component
{
	@property
	public tag: string = "New Audio Channel";

	@property({
		type: CCFloat,
		displayName: "Volume",
		min: 0,
		max: 1,
		step: 0.1,
		slide: true,
	})
	public volume: number = 1;

	@property([AudioChannelEffect])
	public effects: Array<AudioChannelEffect> = [];

	private declare _masterNode: GainNode;

	public get masterNode(): GainNode
	{
		return this._masterNode;
	}

	protected onLoad(): void 
	{
		const effects = this.effects;

		let previousNode: AudioNode = null;

		for (let i = 0; i < effects.length; i++) 
		{
			const effect    = effects[i];
			const audioNode = effect.init();

			if (previousNode !== null)
				previousNode.connect(audioNode);

			previousNode = audioNode;
		}

		const masterNode = audioManager.context.createGain();

		masterNode.gain.value = this.volume;
		masterNode.connect(audioManager.masterNode);

		previousNode.connect(masterNode);
	}

	protected onEnable(): void 
	{
		audioManager.registerChannel(this);
	}

	protected onDisable(): void 
	{
		audioManager.unregisterChannel(this);
	}

	public get inputNode(): AudioNode | null
	{
		if (this.effects.length === 0)
			return null;
		
		return this.effects[0].audioNode;
	}
}


