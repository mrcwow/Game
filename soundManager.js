let soundManager = {
    clips: {},
    context: null,
    gainNode: null,
    loaded: false,
    init() {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination);
    },
    load(path, callback) {
        if (this.clips[path]) {
            callback(this.clips[path]);
            return;
        }
        let clip = {path: path, buffer: null, loaded: false};
        clip.play = (volume, loop) => {
            soundManager.play(this.path, {looping: loop ? loop : false,
                volume: volume ? volume: 1});
        };
        this.clips[path] = clip;
        let request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            soundManager.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };
        request.send();
    },
    loadArray(array) {
        for (let i = 0; i < array.length; i++) {
            soundManager.load(array[i], () => {
                if (array.length === Object.keys(soundManager.clips).length) {
                    for (let sd in soundManager.clips) {
                        if (!soundManager.clips[sd].loaded) return;
                        soundManager.loaded = true;
                    }
                }
            });
        }
    },
    play(path, settings) {
        if(!soundManager.loaded){
            setTimeout(() => {soundManager.play(path, settings);}, 100);
            return;
        }
        let looping = false;
        let volume = 1;
        if (settings) {
            if(settings.looping)
                looping = settings.looping;
            if(settings.volume)
                volume = settings.volume;
        }
        let sd = this.clips[path];
        if(sd === null)
            return false;
        let sound = soundManager.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(soundManager.gainNode);
        sound.loop = looping;
        soundManager.gainNode.gain.value = volume;
        this.context.resume().then(sound.start(0));
        return true;
    },
    playWorldSound(path, x, y) {
        if (gameManager.player === null)
            return;
        let viewSize = Math.max(mapManager.view.w, mapManager.view.h) * 0.8;
        let dx = Math.abs(gameManager.player.pos_x - x);
        let dy = Math.abs(gameManager.player.pos_y - y);
        let distance = Math.sqrt(dx * dx + dy * dy);
        let norm = distance / viewSize;
        if (norm > 1)
            norm = 1;
        let volume = 1.0 - norm;
        if (!volume)
            return;
        soundManager.play(path, {looping: false, volume: volume});
    },
    toggleMute() {
        if (this.gainNode.gain.value > 0)
            this.gainNode.gain.value = 0;
        else
            this.gainNode.gain.value = 1;
    },
    stopAll() {
        this.gainNode.disconnect();
        this.gainNode = this.context.createGainNode(0);
        this.gainNode.connect(this.context.destination);
    }
}