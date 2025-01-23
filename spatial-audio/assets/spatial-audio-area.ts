import { _decorator, Collider, Component, EPhysicsDrawFlags, ITriggerEvent, PhysicsSystem } from 'cc';
import { SpatialAudioSource } from './spatial-audio-source';
import { AudioChannel } from './channel/audio-channel';
import { SpatialAudioAreaPortal } from './spatial-audio-area-portal';

const { ccclass, menu, property,type  } = _decorator;

@ccclass('SpatialAudioArea')
@menu('Audio/SpatialAudioArea')
export class SpatialAudioArea extends Component 
{
	@type(PhysicsSystem.PhysicsGroup)
	public layerMask: number = 1;
	
	@property([SpatialAudioAreaPortal])
	public portals: Array<SpatialAudioAreaPortal> = [];

	@property(Collider)
	public collider: Collider = null;

	@property(AudioChannel)
	public insideAudioMixer: AudioChannel = null;

	@property(AudioChannel)
	public insideMuffedAudioMixer: AudioChannel = null;

	@property(AudioChannel)
	public outsideAudioMixer: AudioChannel = null;

	private _audioSources: Array<SpatialAudioSource> = [];

	private _wasAllPortalsBlocked: boolean = false;

	protected onLoad(): void 
	{
		PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.CONSTRAINT;

		this.collider.setMask(this.layerMask);
		this.collider.setGroup(this.layerMask);
	}
	
	protected onEnable(): void 
	{
		this.collider.on('onTriggerEnter', this._handleTriggerEnter, this);
		this.collider.on('onTriggerExit',  this._handleTriggerExit, this);
	}

	protected onDisable(): void 
	{
		this.collider.off('onTriggerEnter', this._handleTriggerEnter, this);
		this.collider.off('onTriggerExit',  this._handleTriggerExit, this);
	}

	protected update(dt: number): void 
	{
		const isAllPortalsBlocked = this.portals.every(portal => portal.isBlocked());

		if (this._wasAllPortalsBlocked === isAllPortalsBlocked) 
			return;

		this._wasAllPortalsBlocked = isAllPortalsBlocked;

		const audioChannel = isAllPortalsBlocked ?
							 this.insideMuffedAudioMixer :
							 this.insideAudioMixer;
			
		for (const audioSource of this._audioSources) 
			audioSource.setAudioChannel(audioChannel);
	}

    protected _handleTriggerEnter(event: ITriggerEvent) 
    {
		const enteredCollider = event.otherCollider;
		const audioSource = enteredCollider.node.getComponent(SpatialAudioSource); 

		if (!audioSource)
			return;

		const isAllPortalsBlocked = this.portals.every(portal => portal.isBlocked());

		const audioChannel = isAllPortalsBlocked ?
		                     this.insideMuffedAudioMixer :
		                     this.insideAudioMixer;

		audioSource.setAudioChannel(audioChannel);

		this._audioSources.push(audioSource);
    }

    protected _handleTriggerExit(event: ITriggerEvent) 
    {
		const enteredCollider = event.otherCollider;

		const audioSource = enteredCollider.node.getComponent(SpatialAudioSource); 

		if (!audioSource)
			return;

		audioSource.setAudioChannel(this.outsideAudioMixer);

		const indexToRemove = this._audioSources.indexOf(audioSource);

		if (indexToRemove > -1)
			this._audioSources.splice(indexToRemove, 1);
    }
}


