window.onload = function() {
  const size = 50;
  let start = null;
  let end = null;
  let grid = [];
  let isErasing = false;

  for(let i = 0; i < size*size; i++) {
    let cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = i;
    document.getElementById('grid').appendChild(cell);
    grid[i] = 1;
  }

  let isMouseDown = false;

  document.getElementById('grid').addEventListener('mousedown', (event) => {
    isMouseDown = true;
    handleCellSelection(event);
  });

  document.getElementById('grid').addEventListener('mouseover', (event) => {
    if (isMouseDown) {
      handleCellSelection(event);
    }
  });

  document.getElementById('grid').addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  function handleCellSelection(event) {
    if (event.target.className === 'cell') {
      if (start === null) {
        start = parseInt(event.target.id);
        event.target.className = 'start';
        document.getElementById('directions').textContent = "Click on any square to place the END node";
      } else if (end === null) {
        end = parseInt(event.target.id);
        event.target.className = 'end';
        document.getElementById('directions').textContent = "Click and drag to draw walls -----> Press E to toggle erase and hit ENTER to start";
      } else if (!isErasing) {
        grid[event.target.id] = Infinity;
        event.target.className = 'wall';
      }
    } else if (event.target.className === 'wall' && isErasing) {
      grid[event.target.id] = 1;
      event.target.className = 'cell';
    }
  }

  document.getElementById('reset').addEventListener('click', () => {
    const cells = document.getElementById('grid').children;
    for(let i = 0; i < cells.length; i++) {
      cells[i].className = 'cell';
      grid[i] = 1;
    }
    start = null;
    end = null;
    document.getElementById('directions').textContent = "Click on any square to place the START node"});

  document.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
      const algorithm = document.getElementById('algorithm').value;
      if(algorithm === 'dijkstra') {
        dijkstra(start, end, grid);
      } else if(algorithm === 'aStar') {
        aStar(start, end, grid);
      } else if(algorithm === 'bfs') {
        bfs(start, end, grid);
      } else if(algorithm === 'dfs') {
        dfs(start, end, grid);
      }
    } else if (event.key === 'e' || event.key === 'E') {
      isErasing = !isErasing;
    }
  });

  // Dijkstra's Algorithm
  async function dijkstra(start, end, grid) {
    const dist = [];
    const prev = [];
    var queue = [];

    for(let i = 0; i < grid.length; i++) {
      dist[i] = Infinity;
      prev[i] = undefined;
      queue.push(i);
    }

    dist[start] = 0;

    while(queue.length > 0) {
      let u = queue.reduce((a, b) => dist[a] < dist[b] ? a : b);
      queue = queue.filter(v => v !== u);
      if(u === end) break;

    let neighbors = [u-1, u+1, u-size, u+size].filter(v => v >= 0 && v < size*size && ((v%size > 0 && v%size < size-1) || Math.floor(v/size) === Math.floor(u/size)));


      for(let v of neighbors) {
        let alt = dist[u] + grid[v];
        if(alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
          document.getElementById('grid').children[v].classList.add('searching');
          await new Promise(resolve => setTimeout(resolve, 10)); // delay of 10ms
        }
      }
    }

    let u = end;
    if(prev[u] || u === start) {
      while(u) {
        document.getElementById('grid').children[u].classList.add('path');
        u = prev[u];
      }
    }
  }

// A* Algorithm
function manhattanDistance(a, b) {
  return Math.abs(a%size - b%size) + Math.abs(Math.floor(a/size) - Math.floor(b/size));
}

async function aStar(start, end, grid) {
  const dist = [];
  const prev = [];
  var queue = [];

  for(let i = 0; i < grid.length; i++) {
    dist[i] = Infinity;
    prev[i] = undefined;
    queue.push(i);
  }

  dist[start] = 0;

  while(queue.length > 0) {
    let u = queue.reduce((a, b) => dist[a] + manhattanDistance(a, end) < dist[b] + manhattanDistance(b, end) ? a : b);
    queue = queue.filter(v => v !== u);
    if(u === end) break;

    let neighbors = [u-1, u+1, u-size, u+size].filter(v => v >= 0 && v < size*size && ((v%size > 0 && v%size < size-1) || Math.floor(v/size) === Math.floor(u/size)));



    for(let v of neighbors) {
      let alt = dist[u] + grid[v];
      if(alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        document.getElementById('grid').children[v].classList.add('searching');
        await new Promise(resolve => setTimeout(resolve, 10)); // delay of 10ms
      }
    }
  }

  let u = end;
  if(prev[u] || u === start) {
    while(u) {
      document.getElementById('grid').children[u].classList.add('path');
      u = prev[u];
    }
  }
}

// Breadth-First Search
async function bfs(start, end, grid) {
    const visited = [];
    const queue = [start];
    const prev = [];

    for(let i = 0; i < grid.length; i++) {
      visited[i] = false;
      prev[i] = undefined;
    }

    visited[start] = true;

    while(queue.length > 0) {
      let u = queue.shift();
      if(u === end) break;

      let neighbors = [u-1, u+1, u-size, u+size].filter(v => v >= 0 && v < size*size && ((v%size > 0 && v%size < size-1) || Math.floor(v/size) === Math.floor(u/size)));


      for(let v of neighbors) {
        if(!visited[v] && grid[v] !== Infinity) {
          visited[v] = true;
          queue.push(v);
          prev[v] = u;
          document.getElementById('grid').children[v].classList.add('searching');
          await new Promise(resolve => setTimeout(resolve, 10)); // delay of 10ms
        }
      }
    }

    let u = end;
    if(prev[u] || u === start) {
      while(u) {
        document.getElementById('grid').children[u].classList.add('path');
        u = prev[u];
      }
    }
  }

  // Depth-First Search
  async function dfs(start, end, grid) {
    const visited = [];
    const stack = [start];
    const prev = [];

    for(let i = 0; i < grid.length; i++) {
      visited[i] = false;
      prev[i] = undefined;
    }

    visited[start] = true;

    while(stack.length > 0) {
      let u = stack.pop();
      if(u === end) break;

      let neighbors = [u-1, u+1, u-size, u+size].filter(v => v >= 0 && v < size*size && ((v%size > 0 && v%size < size-1) || Math.floor(v/size) === Math.floor(u/size)));

      for(let v of neighbors) {
        if(!visited[v] && grid[v] !== Infinity) {
          visited[v] = true;
          stack.push(v);
          prev[v] = u;
          document.getElementById('grid').children[v].classList.add('searching');
          await new Promise(resolve => setTimeout(resolve, 10)); // delay of 10ms
        }
      }
    }

    let u = end;
    if(prev[u] || u === start) {
      while(u) {
        document.getElementById('grid').children[u].classList.add('path');
        u = prev[u];
      }
    }
  }
}
