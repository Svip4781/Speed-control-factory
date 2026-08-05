const speedSlider = new Table();
let speedMultiplier = 1.0;
const blockProgress = new Map();

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
  }).width(200).get();
  slider.setValue(speedMultiplier);

  // Кнопка сброса
  speedSlider.button("Reset", () => {
    speedMultiplier = 1.0;
    slider.setValue(1.0);
  }).size(80, 30).padLeft(10);

  speedSlider.pack();
  // Гарантируем обновление позиции
  speedSlider.setPosition(10, 10);
}

// Основной цикл — обновляем прогресс производства
Events.run(EventType.UpdateEvent, () => {
  Groups.blocks.each(block => {
    if (block instanceof ProductionBlock && block.isActive()) {
      const currentProgress = block.progress;
      const totalProgress = block.warmup;

      if (totalProgress > 0) {
        const adjustedProgress = currentProgress * speedMultiplier;
        blockProgress.set(block, adjustedProgress);

        if (adjustedProgress >= totalProgress) {
          block.finishProduction();
        }
      }
    }
  });

  // Принудительно обновляем позицию ползунка каждый кадр
  if (speedSlider.getParent() !== null) {
    speedSlider.setPosition(10, 10);
  }
});

// Инициализация интерфейса
Events.on(EventType.ClientLoadEvent, () => {
  Core.scene.add(speedSlider);
  initSpeedControl();
  speedSlider.setPosition(10, 10); // Гарантируем позицию
  speedSlider.setVisible(true); // Явно показываем
});

// Перезагрузка при смене карты
Events.on(EventType.WorldLoadEvent, () => {
  initSpeedControl();
  if (!speedSlider.getParent()) {
    Core.scene.add(speedSlider); // Добавляем, если не добавлен
  }
  speedSlider.setPosition(10, 10);
  speedSlider.setVisible(true);
});

// Очистка при выгрузке карты
Events.on(EventType.WorldUnloadEvent, () => {
  blockProgress.clear();
  if (speedSlider.getParent() !== null) {
    speedSlider.remove(); // Удаляем из сцены
  }
});
