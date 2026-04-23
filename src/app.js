const STORAGE_KEY = "snippet-vault::items";

const sampleSnippets = [
  {
    id: crypto.randomUUID(),
    title: "Debounce para input de busca",
    language: "JavaScript",
    tags: ["performance", "ui"],
    description: "Utilitario simples para reduzir chamadas em eventos frequentes.",
    code: `export function debounce(callback, delay = 250) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}`,
    favorite: true
  },
  {
    id: crypto.randomUUID(),
    title: "Fetch com tratamento padrao",
    language: "JavaScript",
    tags: ["api", "fetch"],
    description: "Wrapper basico para chamadas HTTP com erro consistente.",
    code: `export async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }

  return response.json();
}`,
    favorite: false
  },
  {
    id: crypto.randomUUID(),
    title: "Comando para subir servidor local",
    language: "Bash",
    tags: ["devtools", "server"],
    description: "Atalho util para servir uma pasta estatica com Python.",
    code: "python3 -m http.server 8080",
    favorite: false
  }
];

const state = {
  items: loadSnippets(),
  search: "",
  language: "all",
  favoritesOnly: false
};

const form = document.querySelector("#snippetForm");
const snippetList = document.querySelector("#snippetList");
const searchInput = document.querySelector("#searchInput");
const languageFilter = document.querySelector("#languageFilter");
const favoritesToggle = document.querySelector("#favoritesToggle");
const exportButton = document.querySelector("#exportButton");
const importInput = document.querySelector("#importInput");
const seedButton = document.querySelector("#seedButton");
const activeFilters = document.querySelector("#activeFilters");
const template = document.querySelector("#snippetCardTemplate");

form.addEventListener("submit", handleSubmit);
form.addEventListener("reset", handleReset);
searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  render();
});
languageFilter.addEventListener("change", (event) => {
  state.language = event.target.value;
  render();
});
favoritesToggle.addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  render();
});
exportButton.addEventListener("click", handleExport);
importInput.addEventListener("change", handleImport);
seedButton.addEventListener("click", seedExamples);

render();

function loadSnippets() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const title = formData.get("title")?.toString().trim();
  const language = formData.get("language")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const code = formData.get("code")?.toString().trim();
  const tags = formData
    .get("tags")
    ?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!title || !language || !code) {
    return;
  }

  state.items.unshift({
    id: crypto.randomUUID(),
    title,
    language,
    description: description || "Sem descricao adicionada.",
    code,
    tags: tags || [],
    favorite: false
  });

  persist();
  form.reset();
  render();
}

function handleReset() {
  window.setTimeout(() => {
    form.querySelector("#title")?.focus();
  }, 0);
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state.items, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "snippet-vault-export.json";
  link.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      if (!Array.isArray(parsed)) {
        return;
      }

      state.items = parsed.map((item) => ({
        id: item.id || crypto.randomUUID(),
        title: item.title || "Snippet sem titulo",
        language: item.language || "Texto",
        description: item.description || "Sem descricao adicionada.",
        code: item.code || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        favorite: Boolean(item.favorite)
      }));

      persist();
      render();
    } catch {
      window.alert("Arquivo JSON invalido.");
    } finally {
      importInput.value = "";
    }
  };

  reader.readAsText(file);
}

function seedExamples() {
  if (state.items.length > 0) {
    return;
  }

  state.items = sampleSnippets;
  persist();
  render();
}

function toggleFavorite(id) {
  state.items = state.items.map((item) =>
    item.id === id ? { ...item, favorite: !item.favorite } : item
  );
  persist();
  render();
}

function deleteSnippet(id) {
  state.items = state.items.filter((item) => item.id !== id);
  persist();
  render();
}

async function copySnippet(code) {
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    window.alert("Nao foi possivel copiar o snippet.");
  }
}

function getFilteredSnippets() {
  return state.items.filter((item) => {
    const matchesSearch =
      !state.search ||
      [item.title, item.language, item.description, item.code, item.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(state.search);

    const matchesLanguage =
      state.language === "all" ||
      item.language.toLowerCase() === state.language.toLowerCase();

    const matchesFavorite = !state.favoritesOnly || item.favorite;

    return matchesSearch && matchesLanguage && matchesFavorite;
  });
}

function updateStats() {
  const total = state.items.length;
  const favoriteCount = state.items.filter((item) => item.favorite).length;
  const languages = new Set(
    state.items.map((item) => item.language.trim().toLowerCase()).filter(Boolean)
  );

  document.querySelector("#totalSnippets").textContent = String(total);
  document.querySelector("#favoriteSnippets").textContent = String(favoriteCount);
  document.querySelector("#languageCount").textContent = String(languages.size);
}

function updateLanguageFilter() {
  const current = state.language;
  const languages = [...new Set(state.items.map((item) => item.language.trim()))].sort();
  languageFilter.innerHTML = '<option value="all">Todas as linguagens</option>';

  languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageFilter.append(option);
  });

  languageFilter.value = languages.includes(current) ? current : "all";
}

function renderActiveFilters() {
  activeFilters.innerHTML = "";
  const filters = [];

  if (state.search) {
    filters.push(`Busca: ${state.search}`);
  }

  if (state.language !== "all") {
    filters.push(`Linguagem: ${state.language}`);
  }

  if (state.favoritesOnly) {
    filters.push("Somente favoritos");
  }

  filters.forEach((filter) => {
    const pill = document.createElement("span");
    pill.className = "filter-pill";
    pill.textContent = filter;
    activeFilters.append(pill);
  });
}

function render() {
  const filtered = getFilteredSnippets();

  updateStats();
  updateLanguageFilter();
  renderActiveFilters();

  favoritesToggle.textContent = state.favoritesOnly
    ? "Mostrar todos"
    : "Mostrar favoritos";

  snippetList.innerHTML = "";

  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      state.items.length === 0
        ? "Sua biblioteca esta vazia. Adicione um snippet ou carregue os exemplos."
        : "Nenhum snippet encontrado com os filtros atuais.";
    snippetList.append(emptyState);
    return;
  }

  filtered.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".snippet-card");

    fragment.querySelector(".snippet-language").textContent = item.language;
    fragment.querySelector(".snippet-title").textContent = item.title;
    fragment.querySelector(".snippet-description").textContent = item.description;
    fragment.querySelector(".snippet-code").textContent = item.code;

    const tagsContainer = fragment.querySelector(".snippet-tags");
    item.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "snippet-tag";
      tagElement.textContent = `#${tag}`;
      tagsContainer.append(tagElement);
    });

    const favoriteButton = fragment.querySelector(".favorite-button");
    favoriteButton.textContent = item.favorite ? "★" : "☆";
    favoriteButton.addEventListener("click", () => toggleFavorite(item.id));

    fragment
      .querySelector(".copy-button")
      .addEventListener("click", () => copySnippet(item.code));

    fragment
      .querySelector(".delete-button")
      .addEventListener("click", () => deleteSnippet(item.id));

    snippetList.append(card);
  });
}
