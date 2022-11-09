(function main() {
  const gameEl = document.getElementById("game");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  let level = 1;
  let moves = 0;
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

    // Add obstacles
    const startingObstacleCount = 10;
    for (let _ = 0; _ < level + startingObstacleCount; _++) {
      let coordinates = "-1,-1";

      while (!map[coordinates] || map[coordinates].content) {
        coordinates =
          Math.floor(Math.random() * max.x) +
          "," +
          Math.floor(Math.random() * max.y);
      }

      map[coordinates].content = "obstacle";
      // A roughly even split of trees and rocks
      map[coordinates].element.textContent =
        _ < Math.floor((startingObstacleCount + level) / 2) ? "🌴" : "⛰";
    }
  }

  function winCheck() {
    return position.join(",") === destination.join(",");
  }

  function move(x = 0, y = 0) {
    const nextPosition = [position[0] + x, position[1] + y];

    if (
      nextPosition[0] >= 0 &&
      nextPosition[0] < max.x &&
      nextPosition[1] >= 0 &&
      nextPosition[1] < max.y &&
      map[nextPosition.join(",")].content !== "obstacle"
    ) {
      position[0] = nextPosition[0];
      position[1] = nextPosition[1];
      return true;
    } else {
      return false;
    }
  }

  function munch() {
    const n = [position[0], position[1] + 1],
      e = [position[0] + 1, position[1]],
      s = [position[0], position[1] - 1],
      w = [position[0] - 1, position[1]];

    for (let direction of [n, e, s, w]) {
      const coordinates = direction.join(",");
      if (map[coordinates] && map[coordinates].content === "obstacle") {
        map[coordinates].content = null;
        map[coordinates].element.textContent = "";
        moves++;
        break;
      }
    }
  }

  function handleKeydown(event) {
    previousPosition = [...position];
    let didMove = false;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        didMove = move(undefined, -1);
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        didMove = move(-1);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        didMove = move(1);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        didMove = move(undefined, 1);
        break;
      }
      case " ": {
        event.preventDefault();
        munch();
        break;
      }
      case "R": {
        event.preventDefault();
        reset();
        break;
      }
    }

    if (didMove) {
      moves++;
      paint();
      setTimeout(() => {
        /**
         * Without the timeout, the alert was appearing before
         * paint() finished running. Very weird, but I didn't
         * think it was worth debugging or coming up with a
         * more sophisticated solution.
         */
        if (winCheck()) {
          alert(`You won in ${moves} moves!`);
          level++;
          reset();
        }
      }, 10);
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
    if (!winCheck()) next.element.textContent = "🐢";

    levelEl.textContent = level;
    movesEl.textContent = `${moves} move${moves === 1 ? "" : "s"}`;
  }

  generatePositions();
  paint();

  function reset() {
    moves = 0;
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
