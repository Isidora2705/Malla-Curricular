// Colores
const DEFAULT_COLOR = { background: '#ffc0cb', border: '#ff69b4' };
const COMPLETED_COLOR = { background: '#800080', border: '#4b0082' };

// Espaciados
const X_GAP = 240;  // distancia horizontal entre semestres
const Y_GAP = 80;   // distancia vertical entre cursos

fetch('cursos.json')
  .then(res => res.json())
  .then(cursos => {
    const completed = new Set();

    // Agrupar cursos por semestre
    const grupos = {};
    cursos.forEach(c => {
      grupos[c.semestre] = grupos[c.semestre] || [];
      grupos[c.semestre].push(c);
    });

    // Crear nodos con posición fija (grid)
    const nodesArr = [];
    Object.keys(grupos)
      .sort((a, b) => a - b)
      .forEach(sem => {
        grupos[sem].forEach((c, i) => {
          nodesArr.push({
            id: c.nombre,
            label: c.nombre,
            x: (sem - 1) * X_GAP,
            y: i * Y_GAP,
            fixed: { x: true, y: true },
            hidden: c.prerrequisitos.length > 0,
            color: DEFAULT_COLOR,
            font: { color: '#fff' }
          });
        });
      });

    // Crear aristas sin flechas, ocultas al inicio
    const edgesArr = [];
    cursos.forEach(c => {
      c.prerrequisitos.forEach(pr => {
        edgesArr.push({
          id: `${pr}->${c.nombre}`,
          from: pr,
          to: c.nombre,
          hidden: true,
          color: { color: '#ccc' },
          smooth: false
        });
      });
    });

    // Instanciar vis-network
    const container = document.getElementById('network');
    const data = {
      nodes: new vis.DataSet(nodesArr),
      edges: new vis.DataSet(edgesArr)
    };
    const options = {
      nodes: {
        shape: 'box',
        margin: 10
      },
      edges: {
        arrows: { to: false, from: false },
        smooth: false
      },
      physics: false,
      layout: {
        improvedLayout: false
      },
      interaction: {
        hover: true
      }
    };
    const network = new vis.Network(container, data, options);

    // Click en nodo → marcar completado y desbloquear
    network.on('click', params => {
      if (!params.nodes.length) return;
      const id = params.nodes[0];
      if (completed.has(id)) return;

      // 1) Marcar como completado
      completed.add(id);
      data.nodes.update({ id, color: COMPLETED_COLOR, font: { color: '#fff' } });

      // 2) Desbloquear los hijos cuyas prereqs ya estén todas completadas
      cursos.forEach(c => {
        if (data.nodes.get(c.nombre).hidden) {
          const allDone = c.prerrequisitos.every(pr => completed.has(pr));
          if (allDone) {
            data.nodes.update({ id: c.nombre, hidden: false });
            c.prerrequisitos.forEach(pr => {
              data.edges.update({ id: `${pr}->${c.nombre}`, hidden: false });
            });
          }
        }
      });
    });
  })
  .catch(err => console.error('Error cargando cursos.json:', err));
