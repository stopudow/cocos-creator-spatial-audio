import { _decorator, AudioClip, CCFloat, Component, __private, Enum, math } from 'cc';
import { audioManager } from './audio-manager';
import { AudioChannel } from './channel/audio-channel';
import NullAudioBufferSourceNode from './nodes/null-audio-buffer-source-node';
import NullGainNode from './nodes/null-gain-node';
import NullPannerNode from './nodes/null-panner-node';

const { ccclass, menu, property } = _decorator;

export enum PanningModel
{
    EQUALPOWER,
    HRTF
}

export enum DistanceModel
{
    LINEAR,
    INVERSE,
    EXPONENTIAL
}

@ccclass('SpatialAudioSource')
@menu('Audio/SpatialAudioSource')
export class SpatialAudioSource extends Component 
{
    @property({
        type: AudioClip,
        displayName: "Audio Clip",
    })
    public clip: AudioClip = null;

    @property({
        type: AudioChannel,
        displayName: "Audio Channel",
    })
    public channel: AudioChannel = null;

    @property({
        displayName: "Static",
    })
    public isStatic: boolean = false;

    @property({
        displayName: "Loop",
    })
    public set loop(value: boolean)
    {
        this._source.loop = value;
    };

    public get loop(): boolean
    {
        return this._source.loop;
    }

    @property({
        displayName: "Play On Awake",
    })
    public playOnAwake: boolean = false;

    @property({
        displayName: "Bypass Effects",
    })
    public isBypassEffects: boolean = false;

    @property({
        type: CCFloat,
        displayName: "Volume",
        min: 0,
        max: 1,
        step: 0.1,
        slide: true,
    })
	public set volume(value: number)
    {
        this._gainNode.gain.value = math.clamp(value, 0, 1);
    };

    public get volume(): number
    {
        return this._gainNode.gain.value;
    }

    @property({
        type: CCFloat,
        displayName: "Playback Rate",
        min:  0.0001,
        max:  4.0,
        step: 0.1,
        slide: true,
    })
    public set playbackRate(value: number)
    {
        this._source.playbackRate.value = math.clamp(value, 0, 4);
    };

    public get playbackRate(): number
    {
        return this._source.playbackRate.value;
    }

    @property({
        type: Enum(PanningModel),
        displayName: "Panning Model",
    })
    public set panningModel(value: PanningModel)
    {
    	this._pannerNode.panningModel = this._getPanningModelType(value);
    };

    public get panningModel(): PanningModel
    {
        return this._getPanningModelEnumValue(this._pannerNode.panningModel);
    }

    @property({
        type: Enum(DistanceModel),
        displayName: "Distance Model",
    })
    public set distanceModel(value: DistanceModel)
    {
    	this._pannerNode.distanceModel = this._getDistanceModelType(value);
    };

    public get distanceModel(): DistanceModel
    {
        return this._getDistanceModelEnumValue(this._pannerNode.distanceModel);
    }

    @property({
        type: CCFloat,
        displayName: "Volume Rolloff Factor",
        min: 0.01,
        max: 1000000
    })
    public set volumeRolloffFactor(value: number)
    {
    	this._pannerNode.rolloffFactor = value;
    };

    public get volumeRolloffFactor(): number
    {
        return this._pannerNode.rolloffFactor;
    }

    @property({
        type: CCFloat,
        displayName: "Min Distance",
        min: 0.01,
        max: 1000000
    })
    public set minDistance(value: number)
    {
        if (value > this._maxDistance)
            this._pannerNode.refDistance = this._pannerNode.maxDistance - 0.01;
        else
            this._pannerNode.refDistance = value;
    };

    public get minDistance(): number
    {
        return this._pannerNode.refDistance;
    }

    @property({
        type: CCFloat,
        serializable: true
    })
    private _maxDistance: number = 500;

    @property({
        type: CCFloat,
        displayName: "Max Distance",
        min: 0,
        max: 1000000
    })
    public set maxDistance(value: number)
    {
        if (value < this._pannerNode.refDistance)
            this._pannerNode.maxDistance = this._pannerNode.refDistance + 0.01;
        else
            this._pannerNode.maxDistance = value;
    };

    public get maxDistance(): number
    {
        return this._pannerNode.maxDistance;
    }

    private _isPlaying:    boolean = false;
    private _isSuspended : boolean = false;

    private _startedAt : number = 0;
    private _pausedAt  : number = 0;

    private declare _audioContext: AudioContext;
    private declare _audioBuffer: AudioBuffer;

    private declare _audioListener: AudioListener;

    private _source: AudioBufferSourceNode = new NullAudioBufferSourceNode(null);
    private _gainNode: GainNode            = new NullGainNode(null);
    private _pannerNode: PannerNode        = new NullPannerNode(null);

    public get isPlaying(): boolean
    {
        return this._isPlaying;
    }

    public get isSuspended(): boolean
    {
        return this._isSuspended;
    }

    public setVolume(volume: number)
    {
        volume = math.clamp(volume, 0, 1);
        this._gainNode.gain.value = volume;
    }

    protected onLoad() 
    {
        this._init();
    }

    public refreshPanner(): void 
    {
        this._updatePannerPosition();
    }

    private handleSourceEnded()
    {
        this._isPlaying = false;
        this._pausedAt = 0;
    }

    protected onEnable(): void 
    {
        if (this.playOnAwake)
            this.play();

        if (this.isStatic === true)
            return;
        
        audioManager.registerSource(this);
    }

    protected onDisable(): void 
    {
        if (this.playOnAwake)
            this.pause();

        audioManager.unregisterSource(this);
    }

    protected onDestroy() 
    {
        if (this.playOnAwake)
            this.stop();

        audioManager.unregisterSource(this);
        
        this.clip = null;

        this._releaseAudioNodes();
    }

    private _createAudioBufferSourceNode(): AudioBufferSourceNode
    {
        const source = audioManager.context.createBufferSource();
        
        source.buffer = audioManager.getAudioBuffer(this.clip);

        source.playbackRate.value = this.playbackRate;
        source.loop = this.loop;

        return source;
    }

    private _createPannerNode(): PannerNode
    {
        const pannerNode = audioManager.context.createPanner();

        pannerNode.panningModel   = this._getPanningModelType(this.panningModel);
        pannerNode.distanceModel  = this._getDistanceModelType(this.distanceModel);

        pannerNode.maxDistance    = this.maxDistance;
        pannerNode.refDistance    = this.minDistance;
        pannerNode.rolloffFactor  = this.volumeRolloffFactor;

        pannerNode.coneInnerAngle = 360;
        
        pannerNode.orientationX.value = 1;
        pannerNode.orientationY.value = 0;
        pannerNode.orientationZ.value = 0;

        pannerNode.positionX.value = this.node.worldPosition.x;
        pannerNode.positionY.value = this.node.worldPosition.y;
        pannerNode.positionZ.value = this.node.worldPosition.z;

        return pannerNode;
    }

    private _createGainNode(): GainNode
    {
        const gainNode = audioManager.context.createGain();

        gainNode.gain.value = this.volume;

        if (this.channel !== null)
        {
            gainNode.connect(this.channel.inputNode);
        }
        else
        {
            gainNode.connect(audioManager.masterNode);
        }

        return gainNode;
    }

    private _init()
    {
        const gainNode   = this._createGainNode();
        const pannerNode = this._createPannerNode();
        const source     = this._createAudioBufferSourceNode();

        source.connect(pannerNode)
              .connect(gainNode)

        source.onended = this.handleSourceEnded.bind(this);

        this._source = source;

        this._gainNode   = gainNode;
        this._pannerNode = pannerNode;

        this._audioListener = audioManager.listener;

        this._audioBuffer = source.buffer;
    }

    public setAudioChannelByTag(tag: string)
    {
        const audioChannel = audioManager.getAudioChannelByTag(tag);

        this.setAudioChannel(audioChannel);
    }

    public setAudioChannel(channel: AudioChannel)
    {
        if (this.isBypassEffects === true)
            return;
        
        if (channel !== null)
        {
            this._gainNode.disconnect();
            this._gainNode.connect(channel.inputNode);

            this.channel = channel;
        }
        else
        {
            this._gainNode.disconnect();
            this._gainNode.connect(audioManager.masterNode);

            this.channel = null;
        }
    }

    public suspend() : void
    {
        if (this._isPlaying)
        {
            this.pause();
            this._isSuspended = true;
        }
    }

    public resume() : void
    {
        if (this._pausedAt && this._isSuspended)
        {
            this.play();
            this._isSuspended = false;
        }
    }

    public play() : void
    {
        if (this._isPlaying)
        {
            this.stop();
            return;
        }

        this._isPlaying = true;

        const sourceNode = this._createAudioBufferSourceNode();

        sourceNode.connect(this._pannerNode)
                  .connect(this._gainNode)

        sourceNode.onended = this.handleSourceEnded.bind(this);
        
        if (this._pausedAt)
        {
            this._startedAt = Date.now() - this._pausedAt;
            sourceNode.start(0, this._pausedAt / 1000);
        }
        else
        {
            this._startedAt = Date.now();
            sourceNode.start(0);
        }

        this._source = sourceNode;
    }

    public playOnce() : void
    {
        // Yeah... Here we just create a clone of spatial audio source...
        // Maybe it cause GC or memory leaks, because uncontrollable.
        const sourceNode = this._createAudioBufferSourceNode();
        const gainNode   = this._createGainNode();
        const pannerNode = this._createPannerNode();

        sourceNode.loop = false;
        
        sourceNode.connect(pannerNode)
                  .connect(gainNode)

        sourceNode.start(0);
    }

    public pause()
    {
        this._source.stop(0);

        this._pausedAt = Date.now() - this._startedAt;

        this._isPlaying = false;
    }

    public stop() : void
    {
        this._source.stop(0);

        this._pausedAt = 0;
        this._startedAt = 0;

        this._isPlaying = false;
    }

    private _updatePannerPosition(): void
    {
        this._pannerNode.positionX.value = this.node.worldPosition.x;
        this._pannerNode.positionY.value = this.node.worldPosition.y;
        this._pannerNode.positionZ.value = this.node.worldPosition.z;
    }

    private _getPanningModelType(panningModel: PanningModel): PanningModelType
    {
        switch (panningModel)
        {
            case PanningModel.EQUALPOWER:
                return "equalpower";
            case PanningModel.HRTF:
                return "HRTF";
        }
    }

	private _getPanningModelEnumValue(panningModel: PanningModelType): PanningModel
	{
		switch (panningModel)
		{
			case "equalpower":
				return PanningModel.EQUALPOWER;
			case "HRTF":
				return PanningModel.HRTF;
		}
	}

    private _getDistanceModelType(distanceModel: DistanceModel): DistanceModelType
    {
        switch (distanceModel)
        {
            case DistanceModel.EXPONENTIAL:
                return "exponential";
            case DistanceModel.INVERSE:
                return "inverse";
            case DistanceModel.LINEAR:
                return "linear";
        }
    }

	private _getDistanceModelEnumValue(distanceModel: DistanceModelType): DistanceModel
	{
		switch (distanceModel)
		{
			case "exponential":
				return DistanceModel.EXPONENTIAL;
			case "inverse":
				return DistanceModel.INVERSE;
			case "linear":
				return DistanceModel.LINEAR;
		}
	}
    
    private _releaseAudioNodes()
    {
        const gainNode   = this._gainNode;
        const sourceNode = this._source;
        const pannerNode = this._pannerNode;

        if (this.channel !== null)
        {
            gainNode.connect(this.channel.inputNode);
        }
        else
        {
            gainNode.connect(audioManager.masterNode);
        }

        gainNode.disconnect(this._pannerNode);
        sourceNode.disconnect(this._pannerNode);
        pannerNode.disconnect(this._gainNode);

        this._gainNode   = null;
        this._source     = null;
        this._pannerNode = null;
    }
}
