class VisualizerBase {
    constructor(uiManager) {
      this.uiManager = uiManager;
      this.angle = 0;
      this.cam = createCamera();
      this.cam.setPosition(0, 0, 200);
  
      this.mic = new p5.AudioIn();
      this.fft = new p5.FFT();
  
      this.shapes = [];
  
      userStartAudio().then(() => {
        console.log('Audio context started');
        this.enumerateAudioDevices();
      });
  
      // 使用する色のリスト
      this.colors = ['#f7c428', '#ed5419', '#ea3117', '#1200ea', '#080064', '#be2538', '#47d23f'];
    }
  
    enumerateAudioDevices() {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          let audioDevices = devices.filter(device => device.kind === 'audioinput');
          console.log('Available audio input devices:');
          audioDevices.forEach((device, index) => {
            console.log(`${index}: ${device.label}`);
            this.uiManager.deviceSelect.option(device.label, device.deviceId);
          });
  
          // デフォルトでインデックス2のデバイスを選択
          if (audioDevices.length > 2) {
            this.uiManager.deviceSelect.value(audioDevices[2].deviceId);
            this.startAudioStream(audioDevices[2].deviceId);
          } else if (audioDevices.length > 0) {
            this.uiManager.deviceSelect.value(audioDevices[0].deviceId);
            this.startAudioStream(audioDevices[0].deviceId);
          } else {
            console.error('No audio input devices found.');
          }
  
          this.uiManager.deviceSelect.changed(() => {
            const selectedDeviceId = this.uiManager.deviceSelect.value();
            console.log(`User selected device ID: ${selectedDeviceId}`);
            if (selectedDeviceId) {
              this.startAudioStream(selectedDeviceId);
            }
          });
        })
        .catch(err => {
          console.error('Error enumerating devices:', err);
        });
    }
  
    startAudioStream(deviceId) {
      navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId }
        }
      }).then(stream => {
        let audioContext = getAudioContext();
        let source = audioContext.createMediaStreamSource(stream);
        this.fft.setInput(source);
        console.log('Audio stream started with device:', deviceId);
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
  
      let bassFactor = map(pow(this.bassEnergy / 255.0, 2), 0, 1, 1, this.uiManager.camSlider.value());
      this.camX = sin(this.angle * 0.02) * 300 * bassFactor;
      this.camY = cos(this.angle * 0.02) * 300 * bassFactor;
      this.camZ = 200 + sin(this.angle * 0.04) * 300 * bassFactor;
  
      this.cam.setPosition(this.camX, this.camY, this.camZ);
      this.cam.lookAt(0, 0, 0);
  
      this.angle += map(this.bassEnergy, 0, 255, 0, this.uiManager.speedSlider.value());
    }
  
    display() {
      // サブクラスで実装する必要あり
      throw new Error("display method not implemented.");
    }
  }
  