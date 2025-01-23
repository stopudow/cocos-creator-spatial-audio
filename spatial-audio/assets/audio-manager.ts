import { _decorator, AudioClip, director, EventTarget, Game, game, log, Node, System } from 'cc';
import { SpatialAudioListener } from "./spatial-audio-listener";
import { EDITOR, EDITOR_NOT_IN_PREVIEW } from 'cc/env';
import { SpatialAudioSource } from './spatial-audio-source';
import { AudioChannel } from './channel/audio-channel';

export enum AudioManagerEventType
{
    SUSPEND = "suspend",
    RESUME  = "resume",
    LISTENER_REGISTERED   = "listener_registered",
    LISTENER_UNREGISTERED = "listener_unregistered",
}

interface AudioManagerEventMap
{
    [AudioManagerEventType.RESUME]: () => void,
    [AudioManagerEventType.SUSPEND]: () => void,
    [AudioManagerEventType.LISTENER_REGISTERED]: () => void,
    [AudioManagerEventType.LISTENER_UNREGISTERED]: () => void,
}

export class AudioManager extends System
{
    public static readonly EventType = {
        ...AudioManagerEventType
    }

    private declare _eventTarget: EventTarget;

    private declare _audioContext: AudioContext;
    private declare _audioListener: AudioListener;

    private declare _audioListenerNode: Node | null;

    private declare _updateListenerCallback: () => void;
    
    private declare _masterNode: GainNode;

    private readonly _audioSources: Array<SpatialAudioSource> = [];
    private readonly _audioChannels: Array<AudioChannel> = [];
    
    public get context(): AudioContext
    {
        return this._audioContext;
    }

    public get listener(): AudioListener
    {
        return this._audioListener;
    }

    public get listenerNode(): Node
    {
        return this._audioListenerNode;
    }

    public get masterNode(): AudioNode
    {
        return this._masterNode;
    }

    private step: number = 2;
    private frameCounter: number = 0;

    public constructor() 
    {
        super();

        const audioContext = new AudioContext();
        const masterNode   = audioContext.createGain();

        masterNode.gain.value = 1;
        masterNode.connect(audioContext.destination);

        this._audioContext  = audioContext;
        this._masterNode    = masterNode;
        this._audioListener = audioContext.listener;

        this._audioListenerNode = null;

        if (!this._audioListener.positionX || !this._audioListener.forwardX || !this._audioListener.upX)
        {
            this._updateListenerCallback = this._updateListenerDeprecatedWay;
        }
        else
        {
            this._updateListenerCallback = this._updateListenerModernWay;
        }

        this._eventTarget = new EventTarget();

        game.on(Game.EVENT_PAUSE,  this._handlePause, this);
        game.on(Game.EVENT_RESUME, this._handleResume, this);

        game.on(Game.EVENT_HIDE, this._handlePause, this);
        game.on(Game.EVENT_SHOW, this._handleResume, this);

        director.registerSystem("AudioManager", this, System.Priority.LOW);
    }

    public postUpdate(): void
    {
        if (EDITOR)
            return;

        this.frameCounter++;

        if (this.frameCounter < this.step) 
            return;

        if (this._audioListener !== null)
            this._updateListenerCallback();
        
        for (const source of this._audioSources)
            source.refreshPanner();

        this.frameCounter = 0;
    }

    public registerSource(source: SpatialAudioSource)
    {
        this._audioSources.push(source);
    }

    public unregisterSource(source: SpatialAudioSource): void 
    {
        const index = this._audioSources.indexOf(source);

        if (index === -1)
            return;

        this._audioSources.splice(index, 1);
    }

    public registerChannel(channel: AudioChannel)
    {
        this._audioChannels.push(channel);
    }

    public unregisterChannel(channel: AudioChannel): void 
    {
        const index = this._audioChannels.indexOf(channel);

        if (index === -1)
            return;

        this._audioChannels.splice(index, 1);
    }

    public getAudioChannelByTag(tag: string): AudioChannel | null 
    {
        for (const channel of this._audioChannels) 
        {
            if (channel.tag !== tag) 
                continue;

            return channel;
        }

        return null;
    }

    public registerListener(listener: SpatialAudioListener): void
    {
        if (this._audioListenerNode !== null)
            this.unregisterListener();

        this._audioListenerNode= listener.node;
        this._eventTarget.emit(AudioManagerEventType.LISTENER_REGISTERED);

        log(`New audio listener registered: ${listener.node.name}`);
    }

    public unregisterListener(): void
    {
        this._audioListenerNode = null;

        this._eventTarget.emit(AudioManagerEventType.LISTENER_UNREGISTERED);

        log(`Audio listener unregistered: ${this._audioListenerNode.name}`);
    }

    private _updateListenerModernWay()
    {
        const audioListener = this._audioListener;

        const worldPosition      = this._audioListenerNode.worldPosition;
        const orientationForward = this._audioListenerNode.forward;
        const orientationUp      = this._audioListenerNode.up;

        audioListener.positionX.value = worldPosition.x;
        audioListener.positionY.value = worldPosition.y;
        audioListener.positionZ.value = worldPosition.z;

        audioListener.forwardX.value = orientationForward.x;
        audioListener.forwardY.value = orientationForward.y;
        audioListener.forwardZ.value = orientationForward.z;

        audioListener.upX.value = orientationUp.x;
        audioListener.upY.value = orientationUp.y;
        audioListener.upZ.value = orientationUp.z;
    }

    private _updateListenerDeprecatedWay()
    {
        const audioListener = this._audioListener;

        const worldPosition      = this._audioListenerNode.worldPosition;
        const orientationForward = this._audioListenerNode.forward;
        const orientationUp      = this._audioListenerNode.up;

        audioListener.setPosition(
            worldPosition.x, 
            worldPosition.y, 
            worldPosition.z
        );

        audioListener.setOrientation(
            orientationForward.x, 
            orientationForward.y, 
            orientationForward.z, 
            orientationUp.x, 
            orientationUp.y, 
            orientationUp.z, 
        );
    }

    private _handlePause()
    {
        this._audioContext.suspend();

        this._masterNode.gain.value = 0;
        this._eventTarget.emit(AudioManager.EventType.SUSPEND);
    }

    private _handleResume()
    {
        this._audioContext.resume();

        this._masterNode.gain.value = 1;
        this._eventTarget.emit(AudioManager.EventType.RESUME);
    }

    public on<K extends keyof AudioManagerEventMap> (eventType: K, callback: AudioManagerEventMap[K], target?: any): AudioManagerEventMap[K] 
    {
        this._eventTarget.on(eventType, callback, target);
        return callback;
    }

    public once<K extends keyof AudioManagerEventMap> (eventType: K, callback: AudioManagerEventMap[K], target?: any): AudioManagerEventMap[K] 
    {
        this._eventTarget.once(eventType, callback, target);
        return callback;
    }

    public off<K extends keyof AudioManagerEventMap> (eventType: K, callback?: AudioManagerEventMap[K], target?: any): void 
    {
        if (EDITOR_NOT_IN_PREVIEW)
            return;

        this._eventTarget.off(eventType, callback, target);
    }

    public getAudioBuffer(audioClip: AudioClip): AudioBuffer | null 
    {
        // AudioClip -> AudioPlayer -> AudioPlayerWeb -> AudioBuffer
        return (audioClip as any)._player._player._audioBuffer;
    }
}

export const audioManager = new AudioManager();
