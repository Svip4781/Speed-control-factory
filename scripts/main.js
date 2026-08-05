const speedSlider = new Table();
let speedMultiplier = 1.0;
const originalSpeeds = new Map(); // Храним оригинальные скорости
const modifiedBlocks = new Set(); // Отслеживаем изменённые блоки

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
    speedMultiplier = 1.0;
    slider.setValue(1.0);
    resetAllSpeeds();
  }).size(80, 30).padLeft(10);

  speedSlider.pack();
}

function applySpeedMultiplier(multiplier) {
  modifiedBlocks.clear(); // Очищаем список изменённых блоков

  Groups.blocks.each(block => {
    if (block instanceof ProductionBlock && block.tile) {
      // Сохраняем оригинальную скорость при первом вызове
      if (!originalSpeeds.has(block)) {
        originalSpeeds.set(block, block.productionTime);
      }

      // Применяем множитель только если блок активен и имеет корректное время производства
      if (block.isActive() && originalSpeeds.get(block) > 0) {
        const newSpeed = originalSpeeds.get(block) * (1.0 / multiplier);
        block.productionTime = newSpeed;
        modifiedBlocks.add(block); // Отмечаем как изменённый
      }
    }
  });
}

function resetAllSpeeds() {
  // Восстанавливаем оригинальные скорости для всех изменённых блоков
  modifiedBlocks.forEach(block => {
    if (originalSpeeds.has(block)) {
      block.productionTime = originalSpeeds.get(block);
    }
  });
  modifiedBlocks.clear();
}

// Инициализация при загрузке клиента
Events.on(EventType.ClientLoadEvent, () => {
  Core.scene.add(speedSlider);
  speedSlider.setPosition(10, 10);
  initSpeedControl();
});

// Перезагрузка при смене карты
Events.on(EventType.WorldLoadEvent, initSpeedControl);

// Сброс скоростей и очистка кэша при выгрузке карты
Events.on(EventType.WorldUnloadEvent, () => {
  resetAllSpeeds();
  originalSpeeds.clear();
});
