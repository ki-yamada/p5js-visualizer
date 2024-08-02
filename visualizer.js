class Visualizer {
  constructor() {
    this.angle = 0;
    this.cam = createCamera();
    this.cam.setPosition(0, 0, 200);

    this.mic = new p5.AudioIn();
    this.fft = new p5.FFT();

    // ユーザージェスチャーの後にオーディオコンテキストを開始
    userStartAudio().then(() => {
      console.log('Audio context started');
    });
  }

  startAudioStream(deviceId) {
    navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined
      }
    }).then(stream => {
      let audioContext = getAudioContext();
      let source = audioContext.createMediaStreamSource(stream);
      this.fft.setInput(source);
    }).catch(err => {
      console.error('Error accessing the audio input device:', err);
    });
  }

  update() {
    if (!this.mic || !this.fft) return;

    this.micLevel = this.mic.getLevel();
    this.spectrum = this.fft.analyze();
    this.bassEnergy = this.fft.getEnergy("bass");
    this.midEnergy = this.fft.getEnergy("mid");
    this.trebleEnergy = this.fft.getEnergy("treble");

    let bassFactor = map(this.bassEnergy, 0, 255, 1, uiManager.camSlider.value());
    this.camX = sin(this.angle * 0.02) * 300 * bassFactor;
    this.camY = cos(this.angle * 0.02) * 300 * bassFactor;
    this.camZ = 200 + sin(this.angle * 0.04) * 300 * bassFactor;

    this.cam.setPosition(this.camX, this.camY, this.camZ);
    this.cam.lookAt(0, 0, 0);

    this.angle += map(this.bassEnergy, 0, 255, 0, uiManager.speedSlider.value());
  }

  display() {
    if (!this.mic || !this.fft) return;

    background(0);
    noFill();
    stroke(uiManager.colorSlider.value());

    let waveform = this.fft.waveform();
    for (let z = -500; z <= 500; z += 100) {
      beginShape();
      for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length - 1, -500, 500);
        let y;
        if (z % 300 == 0) {
          y = waveform[i] * 250 * map(this.bassEnergy, 0, 255, 0.5, uiManager.waveSlider.value());
        } else if (z % 300 == 100) {
          y = waveform[i] * 250 * map(this.midEnergy, 0, 255, 0.5, uiManager.waveSlider.value());
        } else {
          y = waveform[i] * 250 * map(this.trebleEnergy, 0, 255, 0.5, uiManager.waveSlider.value());
        }
        vertex(x, y, z);
      }
      endShape();
    }
  }
}
