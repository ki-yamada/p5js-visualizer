class SphereVisualizer extends VisualizerBase {
    constructor(uiManager) {
      super(uiManager);
      this.generateShapes(100);  // 初期値として100個の形状を生成
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
  
    display() {
      if (!this.mic || !this.fft) return;
  
      background(0);
      noFill();
  
      let bassSize = map(pow(this.bassEnergy / 255.0, 2), 0, 1, 5, 300);
      let midSize = map(pow(this.midEnergy / 255.0, 2), 0, 1, 5, 300);
      let trebleSize = map(pow(this.trebleEnergy / 255.0, 2), 0, 1, 5, 300);
  
      // 低音のエネルギーに応じて表示する球体の数を決定
      let numberOfShapes = int(map(this.bassEnergy, 0, 255, 5, this.uiManager.numShapesSlider.value()));
      let shapesToDisplay = this.shapes.slice(0, numberOfShapes);
  
      shapesToDisplay.forEach(shape => {
        push();
        translate(shape.x, shape.y, shape.z);
        rotateX(this.angle * 0.01);
        rotateY(this.angle * 0.01);
  
        // 球体の色を設定
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
        sphere(size / 2);  // キューブの代わりに球体を描画
        pop();
      });
    }
  }
  