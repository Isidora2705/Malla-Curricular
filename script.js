fetch('cursos.json')
  .then(res => res.json())
  .then(cursos => {
    // Construir nodos con group = semestre
    const nodesData = cursos.map(c => ({
      id: c.nombre,
      label: c.nombre,
      group: c.semestre,
      title: `Semestre ${c.semestre}`
    }));
    const nodes = new vis.DataSet(nodesData);

    // Construir aristas según prerrequisitos
    const edges = cursos.flatMap(c =>
      c.prerrequisitos.map(pr => ({ from: pr, to: c.nombre }))
    );

    // Contenedor y opciones de vis-network
    const container = document.getElementById('network');
    const data = { nodes, edges };
    const options = {
      groups: {
        1: { color: '#FFE4E1' },
        2: { color: '#FFD1DC' },
        3: { color: '#FFB7C5' },
        4: { color: '#FF8DAA' },
        5: { color: '#FF6F91' },
        6: { color: '#FF4C93' },
        7: { color: '#FF2D95' },
        8: { color: '#E6007E' },
        9: { color: '#C70071' },
        10:{ color: '#A50065' }
      },
      nodes: {
        shape: 'box',
        margin: 10,
        font: { color: '#333', face: 'Montserrat' },
      },
      edges: {
        smooth: { type: 'curvedCW', roundness: 0.2 },
        arrows: 'to'
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

    // Modal para prerrequisitos
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const list  = document.getElementById('modal-list');
    const closeBtn = document.getElementById('closeBtn');

    network.on('click', params => {
      if (params.nodes.length) {
        const nombre = params.nodes[0];
        const curso = cursos.find(c => c.nombre === nombre);
        title.textContent = curso.nombre;
        list.innerHTML = curso.prerrequisitos.length
          ? curso.prerrequisitos.map(p => `<li>${p}</li>`).join('')
          : '<li>— ninguno —</li>';
        modal.style.display = 'block';
      }
    });
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

    // Legendario: filtrar semestres
    document.querySelectorAll('#legend input').forEach(chk => {
      chk.addEventListener('change', () => {
        const g = +chk.dataset.group;
        const show = chk.checked;
        nodes.forEach(n => {
          if (n.group === g) {
            nodes.update({ id: n.id, hidden: !show });
          }
        });
      });
    });
  })
  .catch(err => console.error('Error cargando cursos.json:', err));
