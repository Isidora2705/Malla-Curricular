// Parámetros de espaciado
const X_GAP = 250;  // distancia horizontal entre semestres
const Y_GAP = 80;   // distancia vertical entre cursos

fetch('cursos.json')
  .then(r => r.json())
  .then(cursos => {
    // Agrupar por semestre manteniendo el orden
    const grupos = {};
    cursos.forEach(c => {
      if (!grupos[c.semestre]) grupos[c.semestre] = [];
      grupos[c.semestre].push(c);
    });

    // Construir nodos con posición fija
    const nodes = [];
    Object.entries(grupos).forEach(([sem, lista]) => {
      const s = Number(sem);
      lista.forEach((c, i) => {
        nodes.push({
          id: c.nombre,
          label: c.nombre,
          x: s * X_GAP,
          y: i * Y_GAP,
          fixed: { x: true, y: true }
        });
      });
    });

    // Construir aristas
    const edges = [];
    cursos.forEach(c => {
      c.prerrequisitos.forEach(pr => {
        edges.push({ from: pr, to: c.nombre, arrows: 'to' });
      });
    });

    // Crear la red
    const container = document.getElementById('network');
    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
      nodes: {
        shape: 'box',
        color: { background: '#FFC0CB', border: '#FF69B4' },
        font: { color: '#fff', face: 'Montserrat', size: 14 },
        margin: 10
      },
      edges: {
        smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 },
        color: '#FF69B4'
      },
      physics: false,
      interaction: { hover: true },
      layout: { improvedLayout: false }
    };
    const network = new vis.Network(container, data, options);

    // Modal
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeBtn');
    const title   = document.getElementById('modal-title');
    const list    = document.getElementById('modal-list');

    network.on('click', params => {
      if (params.nodes.length) {
        const nombre = params.nodes[0];
        const curso  = cursos.find(c => c.nombre === nombre);
        title.textContent = curso.nombre;
        list.innerHTML = curso.prerrequisitos.length
          ? curso.prerrequisitos.map(p => `<li>${p}</li>`).join('')
          : '<li>— ninguno —</li>';
        modal.style.display = 'block';
      }
    });
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  })
  .catch(e => console.error(e));
