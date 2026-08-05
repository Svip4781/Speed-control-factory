const speedSlider = new Table();
let speedMultiplier = 1.0;

// Инициализация интерфейса
function initSpeedControl() {
  const core = Groups.player.first().getTeam().core();
  if (!core) return;

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

// Применение множителя ко всем заводам
function applySpeedMultiplier(multiplier) {
  Groups.blocks.each(block => {
    if (block instanceof ProductionBlock) {
      // Сохраняем оригинальный множитель скорости, если он ещё не сохранён
      if (!block.originalSpeedMultiplier) {
        block.originalSpeedMultiplier = block.productionTime;
      }
      // Применяем новый множитель
      block.productionTime = block.originalSpeedMultiplier * (1.0 / multiplier);
    }
  });
}

// Добавление интерфейса в меню строительства
Events.on(EventType.ClientLoadEvent, () => {
  Core.scene.add(speedSlider);
  speedSlider.setPosition(10, 10); // Левый верхний угол
  initSpeedControl();
});

// Обновление интерфейса при смене карты
Events.on(EventType.WorldLoadEvent, initSpeedControl);
