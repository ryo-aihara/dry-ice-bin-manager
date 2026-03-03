const state = {
  items: [],
  activeBin: 1,
  base: 30,
};

const els = {
  bin1: document.getElementById("bin1"),
  bin2: document.getElementById("bin2"),
  base25: document.getElementById("base25"),
  base30: document.getElementById("base30"),
  btnLoad: document.getElementById("btnLoad"),
  csvInput: document.getElementById("csvInput"),
  unassigned: document.getElementById("unassigned"),

  sumShime: document.getElementById("sumShime"),
  sumCut: document.getElementById("sumCut"),
  sumPieces: document.getElementById("sumPieces"),
  sumCases: document.getElementById("sumCases"),

  coolantTotal: document.getElementById("coolantTotal"),
  coolantCases: document.getElementById("coolantCases"),
  coolantLoose: document.getElementById("coolantLoose"),
};

function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  let base = 30;

  if(lines[0].startsWith("shime_size")){
    base = Number(lines[0].split(",")[1]);
    lines.shift();
  }

  lines.shift(); // remove header

  const rows = lines.map(line=>{
    const [course, bin, shime, cut] = line.split(",");
    return {
      id: crypto.randomUUID(),
      course: course.trim(),
      bin: Number(bin),
      shime: Number(shime),
      cut: Number(cut)
    };
  });

  return {base, rows};
}

function coolantPerCourse(course){
  const c = Number(course);

  if(c >= 501 && c <= 510) return 60;
  if(c >= 601 && c <= 619) return 50;
  if(c >= 621 && c <= 648) return 40;

  return 0;
}

function calculate(){
  const visible = state.items.filter(i=>i.bin === state.activeBin);

  let sumShime = 0;
  let sumCut = 0;
  let coolant = 0;

  visible.forEach(i=>{
    sumShime += i.shime;
    sumCut += i.cut;
    coolant += coolantPerCourse(i.course);
  });

  const pieces = sumShime * state.base + sumCut;
  const cases = pieces / state.base;

  const coolantCases = Math.floor(coolant / 20);
  const coolantLoose = coolant % 20;

  return {
    sumShime,
    sumCut,
    pieces,
    cases,
    coolant,
    coolantCases,
    coolantLoose
  };
}
function render(){
  const t = calculate();

  els.sumShime.textContent = String(t.sumShime);
  els.sumCut.textContent = String(t.sumCut);
  els.sumPieces.textContent = String(t.pieces);
  els.sumCases.textContent = t.cases.toFixed(2);

  els.coolantTotal.textContent = String(t.coolant);
  els.coolantCases.textContent = String(t.coolantCases);
  els.coolantLoose.textContent = String(t.coolantLoose);

  // 未振り分け一覧（今は表示だけ）
  const visible = state.items
    .filter(i => i.bin === state.activeBin)
    .sort((a,b)=>Number(a.course)-Number(b.course));

  els.unassigned.innerHTML = visible.map(i=>{
    return `<div style="padding:8px;border-bottom:1px solid #eee">
      <b>${i.course}</b> / ${i.bin}便 / 〆${i.shime} / cut${i.cut}
    </div>`;
  }).join("");
}

function setBin(bin){
  state.activeBin = bin;
  els.bin1.classList.toggle("active", bin === 1);
  els.bin2.classList.toggle("active", bin === 2);
  render();
}

function setBase(base){
  state.base = base;
  els.base30.classList.toggle("active", base === 30);
  els.base25.classList.toggle("active", base === 25);
  render();
}

els.bin1.addEventListener("click", ()=>setBin(1));
els.bin2.addEventListener("click", ()=>setBin(2));

els.base30.addEventListener("click", ()=>setBase(30));
els.base25.addEventListener("click", ()=>setBase(25));

els.btnLoad.addEventListener("click", ()=>{
  const parsed = parseCSV(els.csvInput.value);
  state.items = parsed.rows;

  // CSVに基準があるならそれを採用
  if(parsed.base === 25 || parsed.base === 30){
    setBase(parsed.base);
  }else{
    render();
  }
});

// 初期描画
render();
