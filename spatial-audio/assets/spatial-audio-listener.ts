import { _decorator, Component } from 'cc';
import { audioManager } from './audio-manager';

const { ccclass, menu } = _decorator;

@ccclass('SpatialAudioListener')
@menu('Audio/SpatialAudioListener')
export class SpatialAudioListener extends Component 
{
    protected onLoad() 
    {
        audioManager.registerListener(this)
    }
}
