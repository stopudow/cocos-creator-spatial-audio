import { _decorator, Component, PhysicsSystem, Vec3, geometry, CCFloat, Eventify } from 'cc';
import { audioManager, AudioManagerEventType } from './audio-manager';

const { ccclass, menu, property,type  } = _decorator;
const { Ray } = geometry;

@ccclass('SpatialAudioAreaPortal')
@menu('Audio/SpatialAudioAreaPortal')
export class SpatialAudioAreaPortal extends Eventify(Component) 
{
    @type(PhysicsSystem.PhysicsGroup)
    public hitLayerMask: number = 1;

    @property
    public queryTrigger: boolean = false;

    @property(CCFloat)
    public rayDistance : number = 10;

    private declare _startPoint: Vec3;
    private declare _endPoint:   Vec3;

    private declare _rayBuffer: geometry.Ray;

    protected onLoad(): void 
    {
        this._rayBuffer = new Ray();

        this._startPoint = this.node.worldPosition;
        this._endPoint   = Vec3.ZERO;

        if (audioManager.listenerNode !== null)
            this._endPoint = audioManager.listenerNode.worldPosition;
    }

    protected onEnable(): void 
    {
        audioManager.on(AudioManagerEventType.LISTENER_REGISTERED, this._handleListenerRegistered, this);
        audioManager.on(AudioManagerEventType.LISTENER_UNREGISTERED, this._handleListenerUnregistered, this);
    }

    protected onDisable(): void 
    {
        audioManager.off(AudioManagerEventType.LISTENER_REGISTERED, this._handleListenerRegistered, this);
        audioManager.off(AudioManagerEventType.LISTENER_UNREGISTERED, this._handleListenerUnregistered, this);
    }

    public isBlocked() : boolean
    {
        Ray.fromPoints(this._rayBuffer, this._startPoint, this._endPoint);

        return PhysicsSystem.instance.raycast(this._rayBuffer, this.hitLayerMask, this.rayDistance, this.queryTrigger);
    }

    private _handleListenerRegistered()
    {
        this._endPoint = audioManager.listenerNode.worldPosition;
    }

    private _handleListenerUnregistered()
    {
        this._endPoint = Vec3.ZERO;
    }
}
