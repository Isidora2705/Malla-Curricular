// 1) Carga de datos y configuración básica
fetch('cursos.json')
  .then(res => res.json())
  .then(cursos => {
    // 2) Construir nodos y aristas
    const nodes = cursos.map(c =>
      ({ id: c.nombre, label: c.nombre, title: `Sem ${c.semestre}` })
    );
    const edges = [];
    cursos.forEach(c => {
      c.prerrequisitos.forEach(pr => {
        edges.push({ from: pr, to: c.nombre });
      });
    });

    // 3) Crear la red
    const container = document.getElementById('network');
    const data = { nodes: new vis.DataSet(nodes), edges };
    const options = {
      nodes: {
        shape: 'box',
        color: { background: '#FFC0CB', border: '#FF69B4' },
        font: { color: '#333' }
      },
      edges: { arrows: 'to' },
      layout: { hierarchical: { direction: 'LR', sortMethod: 'directed' } },
      interaction: { hover: true }
    };
    const network = new vis.Network(container, data, options);

    // 4) Evento click → modal
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const list  = document.getElementById('modal-list');
    const closeBtn = document.getElementById('closeBtn');

    network.on('click', params => {
      if (params.nodes.length) {
        const cursoNombre = params.nodes[0];
        const curso = cursos.find(c => c.nombre === cursoNombre);
        title.textContent = curso.nombre;
        list.innerHTML = curso.prerrequisitos
          .map(p => `<li>${p}</li>`)
          .join('') || '<li>— ninguno —</li>';
        modal.style.display = 'block';
      }
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  })
  .catch(err => console.error('Error cargando cursos.json:', err));
