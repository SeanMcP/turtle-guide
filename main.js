(function main() {
  const gameEl = document.getElementById("game");
  const scoreEl = document.getElementById("score");
  let score = 0;
  const position = [0, 0];
  let previousPosition;
  const destination = [0, 0];
  const max = {
    x: 16,
    y: 8,
  };

  const cellSize = "50px";
  gameEl.style.setProperty("--cellSize", cellSize);
  gameEl.style.gridTemplateColumns = `repeat(${max.x}, ${cellSize})`;
  gameEl.style.gridTemplateRows = `repeat(${max.y}, ${cellSize})`;

  const map = {};
  // Create cells for game
  for (let x = 0; x < max.x; x++) {
    for (let y = max.y - 1; y >= 0; y--) {
      const coordinates = x + "," + y;
      const cell = document.createElement("div");
      cell.dataset.coordinates = coordinates;
      map[coordinates] = {
        content: null,
        touched: 0,
        element: cell,
      };
      gameEl.appendChild(cell);
    }
  }

  function generatePositions() {
    let original = {
      destination: destination.join(","),
      position: position.join(","),
    };

    while (destination.join(",") === original.destination) {
      destination[0] = Math.floor(Math.random() * max.x);
      destination[1] = Math.floor(Math.random() * (max.y / 2)) + max.y / 2;
    }

    while (position.join(",") === original.position) {
      position[0] = Math.floor(Math.random() * max.x);
      position[1] = 0;
    }
  }

  function winCheck() {
    return position.join(",") === destination.join(",");
  }

  function handleKeydown(event) {
    previousPosition = [...position];
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (position[1] > 0) {
          position[1]--;
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (position[0] > 0) {
          position[0]--;
        }
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        if (position[0] < max.x - 1) {
          position[0]++;
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (position[1] < max.y - 1) {
          position[1]++;
        }
        break;
      }
    }

    if (previousPosition.join(",") !== position.join(",")) {
      paint();
      if (winCheck()) {
        alert("You won!");
        score++;
        scoreEl.textContent = score;
        reset();
      }
    }
  }

  function paint() {
    if (previousPosition) {
      const previous = map[previousPosition.join(",")];
      previous.content = null;
      previous.element.textContent = "";
    } else {
      const home = map[destination.join(",")];
      home.content = "destination";
      home.element.textContent = "🏠";
    }

    const next = map[position.join(",")];
    next.content = "turtle";
    next.touched++;
    next.element.dataset.touched = next.touched;
    next.element.textContent = "🐢";
  }

  generatePositions();
  paint();

  function reset() {
    previousPosition = undefined;

    Object.values(map).forEach((cell) => {
      if (cell.content) {
        cell.content = null;
        cell.element.textContent = "";
      }
      if (cell.touched) {
        cell.touched = 0;
        delete cell.element.dataset.touched;
      }
    });

    generatePositions();
    paint();
  }

  document.addEventListener("keydown", handleKeydown);
})();
