let angle = 0;
let cam;
let mic, fft;
let audioContext;
let selectedDeviceId;
let deviceSelect;
let getDevicesButton;
let camSlider, waveSlider, colorSlider, speedSlider;
let camLabel, waveLabel, colorLabel, speedLabel;

function setup() {
  // キャンバスのスタイルを調整して余白を最小限に
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.position(0, 0);
  canvas.style('display', 'block');
  canvas.style('margin', '0');
  canvas.style('padding', '0');
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  // カメラの設定
  cam = createCamera();
  cam.setPosition(0, 0, 200);  // カメラをさらに近づける

  // デバイス選択のドロップダウンメニューを作成
  deviceSelect = createSelect();
  deviceSelect.position(10, 10);

  // デバイス取得ボタンを作成
  getDevicesButton = createButton('Get Audio Devices');
  getDevicesButton.position(10, 60);
  getDevicesButton.mousePressed(selectAudioInputDevice);

  // カメラのダイナミックさを調整するスライダーとラベルを作成
  camLabel = createDiv('Camera Dynamic:');
  camLabel.position(10, 110);
  camLabel.style('color', 'white');
  camSlider = createSlider(1, 10, 3);
  camSlider.position(10, 130);
  camSlider.style('width', '200px');

  // 波の音の強弱を調整するスライダーとラベルを作成
  waveLabel = createDiv('Wave Strength:');
  waveLabel.position(10, 160);
  waveLabel.style('color', 'white');
  waveSlider = createSlider(0.5, 5, 2, 0.1);
  waveSlider.position(10, 180);
  waveSlider.style('width', '200px');

  // 波の色を調整するスライダーとラベルを作成
  colorLabel = createDiv('Wave Color:');
  colorLabel.position(10, 210);
  colorLabel.style('color', 'white');
  colorSlider = createSlider(0, 255, 255);
  colorSlider.position(10, 230);
  colorSlider.style('width', '200px');

  // 波の描画速度を調整するスライダーとラベルを作成
  speedLabel = createDiv('Wave Speed:');
  speedLabel.position(10, 260);
  speedLabel.style('color', 'white');
  speedSlider = createSlider(0.1, 1, 0.5, 0.1);
  speedSlider.position(10, 280);
  speedSlider.style('width', '200px');

  // 初期設定ではオーディオコンテキストを開始しない
  userStartAudio().then(() => {
    console.log('Audio context started');
    audioContext = getAudioContext();
  });
}

function selectAudioInputDevice() {
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      let audioDevices = devices.filter(device => device.kind === 'audioinput');
      console.log('Available audio input devices:');
      
      deviceSelect.option('Select a device', ''); // 初期選択肢
      audioDevices.forEach((device, index) => {
        deviceSelect.option(device.label, device.deviceId);
        console.log(`${index}: ${device.label}`);
      });

      // デバイス選択時の動作を定義
      deviceSelect.changed(() => {
        selectedDeviceId = deviceSelect.value();
        if (selectedDeviceId) {
          console.log(`Selected device ID: ${selectedDeviceId}`);
          startAudioStream(selectedDeviceId);
        } else {
          console.error('No audio input device selected.');
        }
      });
    })
    .catch(err => {
      console.error('Error enumerating devices:', err);
    });
}

function startAudioStream(deviceId) {
  navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined
    }
  }).then(stream => {
    let source = audioContext.createMediaStreamSource(stream);
    // スピーカーに接続しない
    mic = new p5.AudioIn();
    mic.start();
    
    // FFT（高速フーリエ変換）を使用して周波数データを取得
    fft = new p5.FFT();
    fft.setInput(source); // FFTの入力をオーディオソースに設定
  }).catch(err => {
    console.error('Error accessing the audio input device:', err);
  });
}

function draw() {
  if (!mic || !fft) return;  // マイクとFFTが準備されていない場合は描画をスキップ

  background(0);
  noFill();

  // スライダーの値を取得
  let camDynamicFactor = camSlider.value();
  let waveStrength = waveSlider.value();
  let waveColor = colorSlider.value();
  let waveSpeed = speedSlider.value();

  // マイクのレベルを取得して表示（デバッグ用）
  let micLevel = mic.getLevel();
  console.log(`micLevel: ${micLevel}`);

  // FFTで周波数スペクトルを取得
  let spectrum = fft.analyze(); // FFT解析結果を取得
  console.log(`spectrum: ${spectrum}`); // デバッグ用にスペクトルデータを表示

  let bassEnergy = fft.getEnergy("bass"); // 低音のエネルギーを取得
  let midEnergy = fft.getEnergy("mid");   // 中音のエネルギーを取得
  let trebleEnergy = fft.getEnergy("treble"); // 高音のエネルギーを取得

  console.log(`bassEnergy: ${bassEnergy}, midEnergy: ${midEnergy}, trebleEnergy: ${trebleEnergy}`);

  // カメラの動きを設定
  let bassFactor = map(bassEnergy, 0, 255, 1, camDynamicFactor); // 低音エネルギーをスケーリング
  let camX = sin(angle * 0.02) * 300 * bassFactor;
  let camY = cos(angle * 0.02) * 300 * bassFactor;
  let camZ = 200 + sin(angle * 0.04) * 300 * bassFactor;
  
  console.log(`camX: ${camX}, camY: ${camY}, camZ: ${camZ}`);
  
  // カメラの位置を直接設定
  cam.setPosition(camX, camY, camZ);
  cam.lookAt(0, 0, 0);
  
  // 波の色を設定
  stroke(waveColor); 

  // 波の描画
  let waveform = fft.waveform(); // waveformを使用して波形を取得
  for (let z = -500; z <= 500; z += 100) {
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length - 1, -500, 500);
      let y;
      if (z % 300 == 0) {
        y = waveform[i] * 250 * map(bassEnergy, 0, 255, 0.5, waveStrength); // 低音に反応
      } else if (z % 300 == 100) {
        y = waveform[i] * 250 * map(midEnergy, 0, 255, 0.5, waveStrength);  // 中音に反応
      } else {
        y = waveform[i] * 250 * map(trebleEnergy, 0, 255, 0.5, waveStrength); // 高音に反応
      }
      vertex(x, y, z);
    }
    endShape();
  }
  
  // 低音に基づいて回転速度を調整
  angle += map(bassEnergy, 0, 255, 0, waveSpeed); // 回転速度を低音に基づいて調整
}

// スペースキーでフルスクリーンのトグル
function keyPressed() {
  if (key === ' ') {
    let fs = fullscreen();
    fullscreen(!fs);

    // フルスクリーンの状態に応じてUIを表示/非表示
    if (fs) {
      deviceSelect.show();
      getDevicesButton.show();
      camSlider.show();
      waveSlider.show();
      colorSlider.show();
      speedSlider.show();
      camLabel.show();
      waveLabel.show();
      colorLabel.show();
      speedLabel.show();
    } else {
      deviceSelect.hide();
      getDevicesButton.hide();
      camSlider.hide();
      waveSlider.hide();
      colorSlider.hide();
      speedSlider.hide();
      camLabel.hide();
      waveLabel.hide();
      colorLabel.hide();
      speedLabel.hide();
    }
  }
}

// ウィンドウサイズが変更されたときにキャンバスのサイズをリサイズ
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
