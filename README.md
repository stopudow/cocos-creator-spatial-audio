# Spatial Audio for Cocos Creator

Provides spatial audio support, effects channels, and spatial audio areas for Cocos Creator.

- **Spatial Audio Listener**: Integrate this component with your camera to capture and process spatial audio. You need at least one listener in scene.

- **Spatial Audio Source**: Attach this component to any object to emit sound in a 3D space,

- **Audio Channel**: Manage and control audio effects with this component. Create multiple channels to separate different types of audio (e.g., background music, sound effects) and apply various effects such as distortion, lowpass, highpass, and convolver.

- **Spatial Audio Area**: Define specific regions within your game where unique audio properties apply. For instance, you can create areas with distinct convolver settings to simulate different environments, enhancing the overall atmosphere.

- **Spatial Audio Area Portal**: This advanced component allows you to manage transitions between Spatial Audio Areas, enabling smooth shifts between muffled and clear audio channels as players move through your game world.

**Important Note**: This extension supports only web platforms and utilizes the WebAudio API. Please be aware that it does not support native platforms.

## Getting started

To install this extension, simply download the .zip file and drag and drop it into the extensions window of Cocos Creator.


```ts
import { _decorator, Component, Node } from 'cc';
import { DistanceModel, PanningModel, SpatialAudioSource } from 'db://spatial-audio/spatial-audio-source';
import { AudioChannel } from 'db://spatial-audio/channel/audio-channel';
const { ccclass, property } = _decorator;

@ccclass('DemoSpatialAudioSource')
export class DemoSpatialAudioSource extends Component 
{
    @property(AudioClip)
    public audioClip: AudioClip = null;

    @property(SpatialAudioSource)
    public spatialAudioSource: SpatialAudioSource = null;

    @property(AudioChannel)
    public audioChannel: AudioChannel = null;

    public demoSpatialAudioSource(): void
    {
        // Set audio clip that should play next (Not affect on currently playing clip)
        this.spatialAudioSource.clip = this.audioClip;
        
        // Enable looping
        this.spatialAudioSource.loop = true;
        
        // Set the volume in Range [0, 1]
        this.spatialAudioSource.volume = 1;

        // Set the playback rate in Range [0, 4]
        this.spatialAudioSource.playbackRate = 2;

        // Set the panning model 
        this.spatialAudioSource.panningModel = PanningModel.HRTF;

        // Set the distance model which describes how the volume of sound decreases with distance
        this.spatialAudioSource.distanceModel = DistanceModel.INVERSE;

        // Set the volume rolloff factor; a higher value means a steeper decrease in volume with distance
        this.spatialAudioSource.volumeRolloffFactor = 100;

        // Set the minimum distance for sound attenuation; sounds will be at full volume within this distance
        this.spatialAudioSource.minDistance = 10;

        // Set the maximum distance for sound attenuation; sounds will be inaudible beyond this distance
        this.spatialAudioSource.maxDistance = 1000;

        // Assign the audio channel to the spatial audio source
        this.spatialAudioSource.setAudioChannelByTag("Demo Audio Channel");
        this.spatialAudioSource.setAudioChannel(this.audioChannel);

        // Start playing the audio source
        this.spatialAudioSource.play();

        // Pause the audio source
        this.spatialAudioSource.pause();

        // Stop the audio source
        this.spatialAudioSource.stop();

        // Play the audio source once, without looping 
        // (creates separate clone of spatial audio source)
        this.spatialAudioSource.playOnce();
    }
}
```

## References

- [[Share] 3D Audio Solution for Cocos Creator 3.x](https://forum.cocosengine.org/t/share-3d-audio-solution-for-cocos-creator-3-x/61068) - A forum post, discussing the 3D audio solution adapted for Cocos Creator 3.X.
- [Web Audio API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - A detailed guide on the Web Audio API, covering its capabilities and implementation.