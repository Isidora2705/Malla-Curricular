// Colores
const COLOR_LOCKED    = { background: '#CCCCCC', border: '#AAAAAA' };
const COLOR_UNLOCKED  = { background: '#FFC0CB', border: '#FF69B4' };
const COLOR_COMPLETED = { background: '#800080', border: '#4B0082' };

// Espaciados de la grilla
const X_GAP = 230;
const Y_GAP = 70;

fetch('cursos.json')
  .then(r => r.json())
  .then(cursos => {
    // Mapas rápidos
    const deps    = {}; // prerrequisitos
    const depends = {}; // hijos
    cursos.forEach(c => {
      deps[c.nombre] = c.prerrequisitos;
      c.prerrequisitos.forEach(pr => {
        depends[pr] = depends[pr] || [];
        depends[pr].push(c.nombre);
      });
    });

    // Estado de completados
    const completed = new Set();

    // Crear nodos en grid (x,y fijos)
    const semGroups = {};
    cursos.forEach(c => {
      semGroups[c.semestre] = semGroups[c.semestre] || [];
      semGroups[c.semestre].push(c);
    });
    const nodesArr = [];
    Object.keys(semGroups).sort((a,b)=>a-b).forEach(sem => {
      semGroups[sem].forEach((c, idx) => {
        // Estado inicial: blocked si tiene deps, else unlocked
        const locked = deps[c.nombre].length > 0;
        nodesArr.push({
          id: c.nombre,
          label: c.nombre,
          x: (Number(sem)-1) * X_GAP,
          y: idx * Y_GAP,
          fixed: { x:true, y:true },
          color: locked ? COLOR_LOCKED : COLOR_UNLOCKED,
          font: { color: '#fff' }
        });
      });
    });

    // No usamos aristas visibles
    const edgesArr = [];

    // Instancia vis-network
    const container = document.getElementById('network');
    const data = {
      nodes: new vis.DataSet(nodesArr),
      edges: new vis.DataSet(edgesArr)
    };
    const options = {
      nodes: { shape: 'box', margin: 8 },
      edges: { smooth: false, arrows: { to:false, from:false } },
      physics: false,
      layout: { improvedLayout: false },
      interaction: { hover: true, multiselect: false }
    };
    const network = new vis.Network(container, data, options);

    // Función para recalcular colores según estado
    function refreshAll() {
      cursos.forEach(c => {
        const id = c.nombre;
        if (completed.has(id)) {
          data.nodes.update({ id, color: COLOR_COMPLETED });
        } else {
          // desbloqueado si todos deps completados
          const unlocked = deps[id].every(pr => completed.has(pr));
          data.nodes.update({
            id,
            color: unlocked ? COLOR_UNLOCKED : COLOR_LOCKED
          });
        }
      });
    }

    // Click en nodo: toggle completado + refrescar
    network.on('click', params => {
      if (!params.nodes.length) return;
      const id = params.nodes[0];
      if (completed.has(id)) completed.delete(id);
      else completed.add(id);
      refreshAll();
    });

    // primera pasada
    refreshAll();
  })
  .catch(console.error);
