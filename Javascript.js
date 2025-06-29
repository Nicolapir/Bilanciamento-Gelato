const INGREDIENTI_BASE = [
  { nome: "LATTE INTERO FRESCO", zuccheri: 3.5, grassi: 3.5, solidiMagriLatte: 9, altriSolidi: 0, solidiTotali: 12.5 },
  { nome: "PANNA AL 35%", zuccheri: 3, grassi: 35, solidiMagriLatte: 6, altriSolidi: 0, solidiTotali: 41 },
  { nome: "ZUCCHERO SEMOLATO", zuccheri: 100, grassi: 0, solidiMagriLatte: 0, altriSolidi: 0, solidiTotali: 100 },
  { nome: "DESTROSIO", zuccheri: 100, grassi: 0, solidiMagriLatte: 0, altriSolidi: 0, solidiTotali: 100 },
  { nome: "INULINA", zuccheri: 0, grassi: 0, solidiMagriLatte: 0, altriSolidi: 100, solidiTotali: 100 },
  { nome: "TUORLO", zuccheri: 1, grassi: 30, solidiMagriLatte: 0, altriSolidi: 19, solidiTotali: 50 },
  { nome: "NEUTRO", zuccheri: 0, grassi: 0, solidiMagriLatte: 0, altriSolidi: 100, solidiTotali: 100 }
];

const RANGE = {
  zuccheri: [18, 22],
  grassi: [8, 10],
  solidiMagriLatte: [8, 10],
  solidiTotali: [38, 40]
};

function salvaIngredienti(ingredienti) {
  localStorage.setItem('ingredienti', JSON.stringify(ingredienti));
}

function caricaIngredienti() {
  const data = localStorage.getItem('ingredienti');
  if (data) {
    return JSON.parse(data);
  }
  return INGREDIENTI_BASE.map(obj => ({ ...obj }));
}

let ingredienti = caricaIngredienti();
let ricetta = ingredienti.map(ing => ({ nome: ing.nome, peso: 0 }));

function trovaIngrediente(nome) {
  return ingredienti.find(ing => ing.nome === nome);
}

function renderIngredienti() {
  const lista = document.getElementById('ingredienti-lista');
  lista.innerHTML = '';
  ricetta.forEach((item, idx) => {
    const ing = trovaIngrediente(item.nome);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ing.nome}</td>
      <td>
        <input type="number" min="0" value="${item.peso}" data-index="${idx}" class="peso-input">
      </td>
      <td>
        <button class="modifica-btn" data-index="${idx}">✏️</button>
      </td>
      <td>
        <button class="elimina-btn" data-index="${idx}">🗑️</button>
      </td>
    `;
    lista.appendChild(tr);
  });
}

function renderRisultati() {
  const totale = ricetta.reduce((acc, curr) => {
    const v = Number(curr.peso);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);

  if (totale <= 0) {
    document.getElementById('report-bilanciatura').innerHTML = "<em>Inserisci almeno un peso per vedere la bilanciatura.</em>";
    return;
  }

  let somma = { zuccheri: 0, grassi: 0, solidiMagriLatte: 0, altriSolidi: 0, solidiTotali: 0 };
  ricetta.forEach(item => {
    const ing = trovaIngrediente(item.nome);
    const peso = Number(item.peso);
    if (isNaN(peso) || peso <= 0) return;
    somma.zuccheri += peso * (ing.zuccheri / 100);
    somma.grassi += peso * (ing.grassi / 100);
    somma.solidiMagriLatte += peso * (ing.solidiMagriLatte / 100);
    somma.altriSolidi += peso * (ing.altriSolidi / 100);
    somma.solidiTotali += peso * (ing.solidiTotali / 100);
  });

  const perc = {
    zuccheri: (somma.zuccheri / totale * 100).toFixed(1),
    grassi: (somma.grassi / totale * 100).toFixed(1),
    solidiMagriLatte: (somma.solidiMagriLatte / totale * 100).toFixed(1),
    solidiTotali: (somma.solidiTotali / totale * 100).toFixed(1)
  };

  function rangeClass(val, [min, max]) {
    if (val >= min && val <= max) return "range-ok";
    return "range-warn";
  }

  const html = `
    <div>
      <strong>Zuccheri totali:</strong> <span class="${rangeClass(perc.zuccheri, RANGE.zuccheri)}">${perc.zuccheri}%</span> (Range: ${RANGE.zuccheri[0]}–${RANGE.zuccheri[1]}%)<br>
      <strong>Grassi:</strong> <span class="${rangeClass(perc.grassi, RANGE.grassi)}">${perc.grassi}%</span> (Range: ${RANGE.grassi[0]}–${RANGE.grassi[1]}%)<br>
      <strong>Solidi magri del latte:</strong> <span class="${rangeClass(perc.solidiMagriLatte, RANGE.solidiMagriLatte)}">${perc.solidiMagriLatte}%</span> (Range: ${RANGE.solidiMagriLatte[0]}–${RANGE.solidiMagriLatte[1]}%)<br>
      <strong>Solidi totali:</strong> <span class="${rangeClass(perc.solidiTotali, RANGE.solidiTotali)}">${perc.solidiTotali}%</span> (Range: ${RANGE.solidiTotali[0]}–${RANGE.solidiTotali[1]}%)
    </div>
  `;
  document.getElementById('report-bilanciatura').innerHTML = html;
}

// Calcolo automatico appena cambia un peso
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('peso-input')) {
    const idx = e.target.getAttribute('data-index');
    ricetta[idx].peso = Number(e.target.value);
    renderRisultati();
  }
});

document.getElementById('aggiungi-ingrediente').onclick = function () {
  apriModalIngrediente();
};

document.getElementById('reset-ingredienti').onclick = function () {
  if (confirm('Sei sicuro di voler ripristinare gli ingredienti di base?')) {
    ingredienti = INGREDIENTI_BASE.map(obj => ({ ...obj }));
    salvaIngredienti(ingredienti);
    ricetta = ingredienti.map(ing => ({ nome: ing.nome, peso: 0 }));
    renderIngredienti();
    renderRisultati();
  }
};

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modifica-btn')) {
    const idx = e.target.getAttribute('data-index');
    apriModalIngrediente(ricetta[idx].nome);
  }
  if (e.target.classList.contains('elimina-btn')) {
    const idx = e.target.getAttribute('data-index');
    ricetta.splice(idx, 1);
    renderIngredienti();
    renderRisultati();
  }
});

function apriModalIngrediente(nome = '') {
  const modal = document.getElementById('modal-ingrediente');
  modal.classList.remove('hidden');
  document.getElementById('modal-titolo').textContent = nome ? "Modifica Ingrediente" : "Aggiungi Ingrediente";

  let dati = { nome: '', zuccheri: '', grassi: '', solidiMagriLatte: '', altriSolidi: '', solidiTotali: '' };
  if (nome) {
    const ing = trovaIngrediente(nome);
    dati = { ...ing };
  }
  document.getElementById('ingrediente-nome').value = dati.nome;
  document.getElementById('ingrediente-zuccheri').value = dati.zuccheri;
  document.getElementById('ingrediente-grassi').value = dati.grassi;
  document.getElementById('ingrediente-solidi-magri').value = dati.solidiMagriLatte;
  document.getElementById('ingrediente-altri-solidi').value = dati.altriSolidi;
  document.getElementById('ingrediente-solidi-totali').value = dati.solidiTotali;

  document.getElementById('form-ingrediente').onsubmit = function (e) {
    e.preventDefault();
    const nuovoIng = {
      nome: document.getElementById('ingrediente-nome').value.trim(),
      zuccheri: Number(document.getElementById('ingrediente-zuccheri').value),
      grassi: Number(document.getElementById('ingrediente-grassi').value),
      solidiMagriLatte: Number(document.getElementById('ingrediente-solidi-magri').value),
      altriSolidi: Number(document.getElementById('ingrediente-altri-solidi').value),
      solidiTotali: Number(document.getElementById('ingrediente-solidi-totali').value)
    };
    const i = ingredienti.findIndex(x => x.nome === nuovoIng.nome);
    if (i >= 0 && nome) {
      ingredienti[i] = nuovoIng;
      const ricI = ricetta.findIndex(x => x.nome === nuovoIng.nome);
      if (ricI >= 0) ricetta[ricI].nome = nuovoIng.nome;
    } else {
      ingredienti.push(nuovoIng);
      ricetta.push({ nome: nuovoIng.nome, peso: 0 });
    }
    salvaIngredienti(ingredienti);
    renderIngredienti();
    renderRisultati();
    modal.classList.add('hidden');
  };

  document.getElementById('annulla-ingrediente').onclick = function () {
    modal.classList.add('hidden');
  };
}

renderIngredienti();
renderRisultati();
