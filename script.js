// Colores por defecto y completado
const DEFAULT_COLOR = {
  background: getComputedStyle(document.documentElement).getPropertyValue('--pink-bg').trim(),
  border: getComputedStyle(document.documentElement).getPropertyValue('--pink-border').trim()
};
const COMPLETED_COLOR = {
  background: getComputedStyle(document.documentElement).getPropertyValue('--purple-bg').trim(),
  border: getComputedStyle(document.documentElement).getPropertyValue('--purple-border').trim()
};

fetch('cursos.json')
  .then(res => res.json())
  .then(cursos => {
    const completed = new Set();

    // Construir nodos y edges
    const nodesArr = [];
    const edgesArr = [];
    cursos.forEach(c => {
      // Nodo: oculto si tiene prerrequisitos
      nodesArr.push({
        id: c.nombre,
        label: c.nombre,
        hidden: c.prerrequisitos.length > 0,
        color: DEFAULT_COLOR
      });
      // Edge: siempre oculto al inicio
      c.prerrequisitos.forEach(pr => {
        edgesArr.push({
          id: `${pr}->${c.nombre}`,
          from: pr,
          to: c.nombre,
          hidden: true,
          arrows: 'to',
          color: { color: DEFAULT_COLOR.border }
        });
      });
    });

    const nodes = new vis.DataSet(nodesArr);
    const edges = new vis.DataSet(edgesArr);

    const container = document.getElementById('network');
    const data = { nodes, edges };
    const options = {
      nodes: {
        shape: 'box',
        font: { color: '#fff', face: 'Montserrat', size: 14 },
        margin: 10
      },
      edges: {
        smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 }
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR',
          levelSeparation: 150,
          nodeSpacing: 200
        }
      },
      physics: false,
      interaction: { hover: true }
    };

    const network = new vis.Network(container, data, options);

    // Al hacer clic, marcar completado y desbloquear dependientes
    network.on('click', params => {
      if (!params.nodes.length) return;
      const id = params.nodes[0];
      if (completed.has(id)) return;  // ya marcado

      // 1) Marcar completado
      completed.add(id);
      nodes.update({ id, color: COMPLETED_COLOR });

      // 2) Desbloquear nodos cuyos prerreqs ahora estén todos completados
      cursos.forEach(c => {
        if (nodes.get(c.nombre).hidden) {
          const todos = c.prerrequisitos.every(pr => completed.has(pr));
          if (todos) {
            nodes.update({ id: c.nombre, hidden: false });
            // mostrar sus conexiones
            c.prerrequisitos.forEach(pr => {
              edges.update({ id: `${pr}->${c.nombre}`, hidden: false });
            });
          }
        }
      });
    });
  })
  .catch(err => console.error('Error cargando cursos.json:', err));
