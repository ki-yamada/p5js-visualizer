class UIManager {
  constructor() {
    this.deviceSelect = createSelect();
    this.deviceSelect.position(10, 10);

    this.getDevicesButton = createButton('Get Audio Devices');
    this.getDevicesButton.position(10, 60);
    this.getDevicesButton.mousePressed(() => {
      console.log('Get Devices Button Clicked');
      this.requestAudioPermissions();
    });

    this.camLabel = createDiv('Camera Dynamic:');
    this.camLabel.position(10, 110);
    this.camLabel.style('color', 'white');
    this.camSlider = createSlider(1, 30, 3);
    this.camSlider.position(10, 130);
    this.camSlider.style('width', '200px');

    this.waveLabel = createDiv('Wave Strength:');
    this.waveLabel.position(10, 160);
    this.waveLabel.style('color', 'white');
    this.waveSlider = createSlider(0.5, 5, 2, 0.1);
    this.waveSlider.position(10, 180);
    this.waveSlider.style('width', '200px');

    this.colorLabel = createDiv('Wave Color:');
    this.colorLabel.position(10, 210);
    this.colorLabel.style('color', 'white');
    this.colorSlider = createSlider(0, 255, 255);
    this.colorSlider.position(10, 230);
    this.colorSlider.style('width', '200px');

    this.speedLabel = createDiv('Wave Speed:');
    this.speedLabel.position(10, 260);
    this.speedLabel.style('color', 'white');
    this.speedSlider = createSlider(0.1, 1, 0.5, 0.1);
    this.speedSlider.position(10, 280);
    this.speedSlider.style('width', '200px');

    this.numShapesLabel = createDiv('Number of Shapes:');
    this.numShapesLabel.position(10, 310);
    this.numShapesLabel.style('color', 'white');
    this.numShapesSlider = createSlider(10, 2000, 100, 10);
    this.numShapesSlider.position(10, 330);
    this.numShapesSlider.style('width', '200px');
  }

  requestAudioPermissions() {
    console.log('Requesting audio permissions...');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log('Audio context started');
        this.getAudioDevices();
      })
      .catch(err => {
        console.error('Error starting audio context:', err);
        alert('Error accessing the microphone: ' + err.message);
      });
  }

  getAudioDevices() {
    console.log('Getting user media...');
    navigator.mediaDevices.enumerateDevices().then(devices => {
      console.log('Devices:', devices); // すべてのデバイス情報をログに出力

      let audioDevices = devices.filter(device => device.kind === 'audioinput');
      console.log('Available audio input devices:', audioDevices);

      this.deviceSelect.option('Select a device', ''); // 初期選択肢
      audioDevices.forEach((device, index) => {
        this.deviceSelect.option(device.label || `Device ${index}`, device.deviceId);
        console.log(`${index}: ${device.label || `Device ${index}`}`);
      });

      this.deviceSelect.changed(() => {
        let selectedDeviceId = this.deviceSelect.value();
        if (selectedDeviceId) {
          console.log(`Selected device ID: ${selectedDeviceId}`);
          visualizer.startAudioStream(selectedDeviceId);
        } else {
          console.error('No audio input device selected.');
        }
      });
    }).catch(err => {
      console.error('Error enumerating devices:', err);
      alert('Error enumerating devices: ' + err.message);
    });
  }

  show() {
    this.deviceSelect.show();
    this.getDevicesButton.show();
    this.camSlider.show();
    this.waveSlider.show();
    this.colorSlider.show();
    this.speedSlider.show();
    this.numShapesSlider.show();
    this.camLabel.show();
    this.waveLabel.show();
    this.colorLabel.show();
    this.speedLabel.show();
    this.numShapesLabel.show();
  }

  hide() {
    this.deviceSelect.hide();
    this.getDevicesButton.hide();
    this.camSlider.hide();
    this.waveSlider.hide();
    this.colorSlider.hide();
    this.speedSlider.hide();
    this.numShapesSlider.hide();
    this.camLabel.hide();
    this.waveLabel.hide();
    this.colorLabel.hide();
    this.speedLabel.hide();
    this.numShapesLabel.hide();
  }
}
