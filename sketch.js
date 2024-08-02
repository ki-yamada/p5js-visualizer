let visualizer;
let uiManager;
let visualizerClasses;
let currentVisualizerIndex = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.position(0, 0);
  canvas.style('display', 'block');
  canvas.style('margin', '0');
  canvas.style('padding', '0');
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  // UIManager クラスのインスタンスを作成
  uiManager = new UIManager();

  // Visualizer クラスのリストを作成
  visualizerClasses = [ComplexVisualizer];

  // 最初の Visualizer クラスのインスタンスを作成
  visualizer = new visualizerClasses[currentVisualizerIndex](uiManager);
  window.visualizer = visualizer;  // グローバルに設定

  uiManager.show();
}

function draw() {
  visualizer.update();
  visualizer.display();
}

// スペースキーでフルスクリーンのトグル、'v'キーでビジュアライザーの切り替え
function keyPressed() {
  if (key === ' ') {
    let fs = fullscreen();
    fullscreen(!fs);

    // フルスクリーンの状態に応じてUIを表示/非表示
    if (fs) {
      uiManager.show();
    } else {
      uiManager.hide();
    }
  } else if (key === 'v') {
    // ビジュアライザーの切り替え
    currentVisualizerIndex = (currentVisualizerIndex + 1) % visualizerClasses.length;
    visualizer = new visualizerClasses[currentVisualizerIndex](uiManager);
    window.visualizer = visualizer;  // グローバルに設定
  }
}

// ウィンドウサイズが変更されたときにキャンバスのサイズをリサイズ
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
