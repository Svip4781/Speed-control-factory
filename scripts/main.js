const speedSlider = new Table();
let speedMultiplier = 1.0;
const blockProgress = new Map(); // Храним прогресс производства для каждого блока

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
}

// Основной цикл — обновляем прогресс производства
Events.run(EventType.UpdateEvent, () => {
  Groups.blocks.each(block => {
    if (block instanceof ProductionBlock && block.isActive()) {
      // Получаем текущий прогресс производства
      const currentProgress = block.progress;
      const totalProgress = block.warmup; // Используем warmup как индикатор прогресса

      if (totalProgress > 0) {
        // Рассчитываем скорректированный прогресс
        const adjustedProgress = currentProgress * speedMultiplier;

        // Сохраняем прогресс в нашей карте
        blockProgress.set(block, adjustedProgress);

        // Имитируем ускорение/замедление через изменение внутреннего состояния
        // Вместо прямого изменения productionTime — работаем с прогрессом
        if (adjustedProgress >= totalProgress) {
          // Если прогресс завершён — имитируем завершение производства
          block.finishProduction();
        }
      }
    }
  });
});

// Инициализация интерфейса
Events.on(EventType.ClientLoadEvent, () => {
  Core.scene.add(speedSlider);
  speedSlider.setPosition(10, 10);
  initSpeedControl();
});

// Перезагрузка при смене карты
Events.on(EventType.WorldLoadEvent, initSpeedControl);

// Очистка при выгрузке карты
Events.on(EventType.WorldUnloadEvent, () => {
  blockProgress.clear();
});
