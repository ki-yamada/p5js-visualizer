class Visualizer {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.angle = 0;
    this.cam = createCamera();
    this.cam.setPosition(0, 0, 200);

    this.mic = new p5.AudioIn();
    this.fft = new p5.FFT();

    this.shapes = [];
    this.generateShapes(100);  // 初期値として100個の形状を生成

    userStartAudio().then(() => {
      console.log('Audio context started');
    });

    // 使用する色のリスト
    this.colors = ['#f7c428', '#ed5419', '#ea3117', '#1200ea', '#080064', '#be2538', '#47d23f'];
  }

  generateShapes(numShapes) {
    this.shapes = [];
    let fib = [1, 1];
    for (let i = 2; i < numShapes; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
    }

    let maxDistance = 600;
    fib.forEach((value, index) => {
      let angle1 = random(TWO_PI);
      let angle2 = random(PI);
      let distance = map(index, 0, fib.length, 0, maxDistance);
      let size = map(index, 0, fib.length, 5, 100) + random(-10, 10); // 最小値を5に調整
      this.shapes.push({
        x: distance * sin(angle2) * cos(angle1),
        y: distance * sin(angle2) * sin(angle1),
        z: distance * cos(angle2),
        size: size,
        type: index % 3, // 0: bass, 1: mid, 2: treble
        color: random(this.colors) // 色をランダムに設定
      });
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

    // キューブの数を調整
    this.generateShapes(this.uiManager.numShapesSlider.value());
  }

  display() {
    if (!this.mic || !this.fft) return;

    background(0);
    noFill();

    let bassSize = map(pow(this.bassEnergy / 255.0, 2), 0, 1, 5, 300);
    let midSize = map(pow(this.midEnergy / 255.0, 2), 0, 1, 5, 300);
    let trebleSize = map(pow(this.trebleEnergy / 255.0, 2), 0, 1, 5, 300);

    // 低音のエネルギーに応じて表示するキューブの数を決定
    let numberOfShapes = int(map(this.bassEnergy, 0, 255, 5, this.uiManager.numShapesSlider.value()));
    let shapesToDisplay = this.shapes.slice(0, numberOfShapes);

    shapesToDisplay.forEach(shape => {
      push();
      translate(shape.x, shape.y, shape.z);
      rotateX(this.angle * 0.01);
      rotateY(this.angle * 0.01);

      // キューブの色を設定
      fill(shape.color);
      stroke(shape.color);

      let size = shape.size;
      if (shape.type === 0) {
        size *= map(this.bassEnergy, 0, 255, 0.5, 1.5);
      } else if (shape.type === 1) {
        size *= map(this.midEnergy, 0, 255, 0.5, 1.5);
      } else if (shape.type === 2) {
        size *= map(this.trebleEnergy, 0, 255, 0.5, 1.5);
      }
      box(size);
      pop();
    });
  }
}
