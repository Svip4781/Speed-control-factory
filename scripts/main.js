const speedSlider = new Table();
let speedMultiplier = 1.0;
const originalSpeeds = new Map(); // Храним оригинальные скорости

function initSpeedControl() {
  speedSlider.clear();

  // Заголовок
  speedSlider.add("[accent]Factory Speed:[]").padRight(10);

  // Отображение текущего множителя
  const speedLabel = speedSlider.add(speedMultiplier.toFixed(2) + "x").padLeft(10).get();

  // Ползунок
  const slider = speedSlider.slider(0.1, 3.0, 0.1, speedMultiplier, value => {
    speedMultiplier = value;
    speedLabel.setText(value.toFixed(2) + "x");
    applySpeedMultiplier(value);
  }).width(200).get();
  slider.setValue(speedMultiplier);

  // Кнопка сброса
  speedSlider.button("Reset", () => {
    slider.setValue(1.0);
  }).size(80, 30).padLeft(10);

  speedSlider.pack();
}

function applySpeedMultiplier(multiplier) {
  Groups.blocks.each(block => {
    if (block instanceof ProductionBlock) {
      // Сохраняем оригинальную скорость при первом вызове
      if (!originalSpeeds.has(block)) {
        originalSpeeds.set(block, block.productionTime);
      }

      // Применяем множитель только если блок активен
      if (block.isActive()) {
        block.productionTime = originalSpeeds.get(block) * (1.0 / multiplier);
      }
    }
  });
}

// Инициализация при загрузке клиента
Events.on(EventType.ClientLoadEvent, () => {
  Core.scene.add(speedSlider);
  speedSlider.setPosition(10, 10);
  initSpeedControl();
});

// Перезагрузка при смене карты
Events.on(EventType.WorldLoadEvent, initSpeedControl);

// Сброс скоростей при выходе из игры или смене карты
Events.on(EventType.WorldUnloadEvent, () => {
  originalSpeeds.clear(); // Очищаем кэш оригинальных скоростей
});
