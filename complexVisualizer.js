class ComplexVisualizer extends VisualizerBase {
    constructor(uiManager) {
      super(uiManager);
      this.generateShapes(1000);  // 初期値として1000個の形状を生成
    }
  
    generateShapes(numShapes) {
      this.shapes = [];
      let fib = [1, 1];
      for (let i = 2; i < numShapes; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
      }
  
      let maxDistance = 600;
      fib.forEach((value, index) => {
        let angle = random(TWO_PI);
        let distance = map(index, 0, fib.length, 0, maxDistance);
        let size = map(index, 0, fib.length, 300, 50) + random(-20, 20);
        this.shapes.push({
          x: cos(angle) * distance,
          y: sin(angle) * distance,
          z: random(-maxDistance, maxDistance),
          size: size,
          type: index % 3 // 0: bass, 1: mid, 2: treble
        });
      });
    }
  
    display() {
      if (!this.mic || !this.fft) return;
  
      background(0);
      noFill();
  
      // スライダーの値を取得
      let waveColor = this.uiManager.colorSlider.value();
  
      stroke(waveColor);
  
      let bassSize = map(pow(this.bassEnergy / 255.0, 2), 0, 1, 50, 300);
      let midSize = map(pow(this.midEnergy / 255.0, 2), 0, 1, 50, 300);
      let trebleSize = map(pow(this.trebleEnergy / 255.0, 2), 0, 1, 50, 300);
  
      // 低音のエネルギーに応じて表示するキューブの数を決定
      let numberOfShapes = int(map(this.bassEnergy, 0, 255, 5, this.uiManager.numShapesSlider.value()));
      let shapesToDisplay = this.shapes.slice(0, numberOfShapes);
  
      shapesToDisplay.forEach(shape => {
        push();
        translate(shape.x, shape.y, shape.z);
        rotateX(this.angle * 0.01);
        rotateY(this.angle * 0.01);
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
  