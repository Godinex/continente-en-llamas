(async function () {
  const { cartas } = await fetch("data.json").then(r => r.json());
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BANDOS = { ind: ["Independentistas", "#8e1b22"], rea: ["Realistas", "#1e3358"], neu: ["Comunes", "#5a4a2c"] };
  const TIPOS = { heroe: "Héroes", tropa: "Tropas", acont: "Acontecimientos", soporte: "Soportes", recurso: "Recursos", escenario: "Escenarios" };
  const TIPO1 = { heroe: "Héroe", tropa: "Tropa", acont: "Acontecimiento", soporte: "Soporte", recurso: "Recurso", escenario: "Escenario" };

  // Menú móvil
  const burger = document.querySelector(".burger"), nav = document.querySelector(".top nav");
  burger.addEventListener("click", () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  const state = { bando: "", tipo: "", q: "" };
  function drawChips() {
    $("f-bando").innerHTML = `<button class="chip" data-g="bando" data-v="" aria-pressed="${!state.bando}">Ambos bandos</button>` +
      Object.entries(BANDOS).map(([k, [n, c]]) => `<button class="chip" data-g="bando" data-v="${k}" aria-pressed="${state.bando === k}" style="--c:${c}"><i></i>${n}</button>`).join("");
    $("f-tipo").innerHTML = `<button class="chip" data-g="tipo" data-v="" aria-pressed="${!state.tipo}">Todas</button>` +
      Object.entries(TIPOS).map(([k, n]) => `<button class="chip" data-g="tipo" data-v="${k}" aria-pressed="${state.tipo === k}">${n}</button>`).join("");
  }
  document.querySelector(".filters").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    state[b.dataset.g] = b.dataset.v; drawChips(); drawGrid();
  });
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  $("f-q").addEventListener("input", e => { state.q = norm(e.target.value.trim()); drawGrid(); });

  let current = [];
  function drawGrid() {
    current = cartas.filter(c => (!state.bando || c.bando === state.bando) && (!state.tipo || c.tipo === state.tipo) && (!state.q || norm(c.nombre).includes(state.q)));
    $("grid").innerHTML = current.map((c, i) => `
      <button class="card${c.h ? " h" : ""}" data-i="${i}">
        <img src="${c.img}" alt="${esc(c.nombre)}" loading="lazy">
        <div class="meta"><b>${esc(c.nombre)}</b>${TIPO1[c.tipo]} · ${BANDOS[c.bando][0]}</div>
      </button>`).join("") || `<p class="center"><i>No hay cartas con esos filtros.</i></p>`;
    $("count").textContent = `${current.length} carta${current.length === 1 ? "" : "s"}`;
  }
  drawChips(); drawGrid();

  // Ficha
  const dlg = $("ficha"); let idx = 0;
  function show() {
    const c = current[idx];
    dlg.querySelector(".fx").style.setProperty("--c", BANDOS[c.bando][1]);
    $("fx-img").src = c.img; $("fx-img").alt = c.nombre;
    $("fx-num").textContent = `${TIPO1[c.tipo]} · ${c.bando === "neu" ? "Ambos bandos" : BANDOS[c.bando][0]}`;
    $("fx-name").textContent = c.nombre;
    $("fx-sub").textContent = c.sub;
    $("fx-texto").textContent = c.texto;
  }
  $("grid").addEventListener("click", e => {
    const b = e.target.closest(".card"); if (!b) return;
    idx = +b.dataset.i; show(); dlg.showModal();
  });
  dlg.querySelector(".close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $("fx-prev").addEventListener("click", () => { idx = (idx - 1 + current.length) % current.length; show(); });
  $("fx-next").addEventListener("click", () => { idx = (idx + 1) % current.length; show(); });
  document.addEventListener("keydown", e => {
    if (!dlg.open) return;
    if (e.key === "ArrowRight") $("fx-next").click();
    if (e.key === "ArrowLeft") $("fx-prev").click();
  });
})();
