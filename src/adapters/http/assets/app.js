const PREFERENCES_STORAGE_KEY = "mkserve:preferences";

const state = {
  app: null,
  catalog: null,
  currentPath: null,
  currentDocument: null,
  search: "",
  viewMode: loadPreference("viewMode", "render"),
  previewTheme: loadPreference("previewTheme", "dark"),
  restoreTreeItemOnInitialLoad: true,
};

const rootNameEl = document.getElementById("root-name");
const rootDirEl = document.getElementById("root-dir");
const fileCountEl = document.getElementById("file-count");
const treeEl = document.getElementById("tree");
const treeEmptyEl = document.getElementById("tree-empty");
const searchInputEl = document.getElementById("search-input");
const documentTitleEl = document.getElementById("document-title");
const documentPathEl = document.getElementById("document-path");
const previewEl = document.getElementById("preview");
const rawPreviewEl = document.getElementById("raw-preview");
const rawCodeEl = document.getElementById("raw-code");
const statusEl = document.getElementById("status");
const renderViewButtonEl = document.getElementById("render-view-button");
const rawViewButtonEl = document.getElementById("raw-view-button");
const copyMarkdownButtonEl = document.getElementById("copy-markdown-button");
const previewThemeButtonEl = document.getElementById("preview-theme-button");
const markdownThemeLightEl = document.getElementById("markdown-theme-light");
const markdownThemeDarkEl = document.getElementById("markdown-theme-dark");
const highlightThemeLightEl = document.getElementById("highlight-theme-light");
const highlightThemeDarkEl = document.getElementById("highlight-theme-dark");

const GITHUB_ALERT_META = {
  note: {
    label: "Note",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z",
  },
  tip: {
    label: "Tip",
    viewBox: "0 0 384 512",
    path: "M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5L109 384c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5l-48.6 0c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80l0-16 160 0 0 16c0 44.2-35.8 80-80 80z",
  },
  important: {
    label: "Important",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z",
  },
  warning: {
    label: "Warning",
    viewBox: "0 0 512 512",
    path: "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z",
  },
  caution: {
    label: "Caution",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z",
  },
};

const GITHUB_ALERT_MARKER_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+|$)/i;

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "strict",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

configureMarked();
wireEvents();
void boot();

async function boot() {
  setStatus("Loading");
  const [appData, catalog] = await Promise.all([
    fetchJson("/api/app"),
    fetchJson("/api/tree"),
  ]);

  state.app = appData;
  state.catalog = catalog;

  rootNameEl.textContent = appData.runtime.rootName;
  rootDirEl.textContent = appData.runtime.rootDir;
  fileCountEl.textContent = `${catalog.fileCount} file${catalog.fileCount === 1 ? "" : "s"}`;

  renderTree();

  const hashState = readHashState();
  const initialPath = hashState.path || catalog.defaultDocumentPath;
  if (initialPath) {
    await openDocument(initialPath);
    if (hashState.section) {
      scrollToPreviewAnchor(hashState.section);
    }
  } else {
    treeEmptyEl.classList.remove("hidden");
    setStatus("No markdown files");
  }
}

function wireEvents() {
  searchInputEl.addEventListener("input", () => {
    state.search = searchInputEl.value.trim().toLowerCase();
    renderTree();
  });

  renderViewButtonEl.addEventListener("click", () => {
    setViewMode("render");
  });

  rawViewButtonEl.addEventListener("click", () => {
    setViewMode("raw");
  });

  copyMarkdownButtonEl.addEventListener("click", async () => {
    if (!state.currentDocument) {
      return;
    }

    const copied = await copyText(state.currentDocument.content);
    if (copied) {
      flashButtonIcon(copyMarkdownButtonEl, checkIcon(), copyIcon());
      setStatus("Markdown copied");
    }
  });

  previewThemeButtonEl.addEventListener("click", async () => {
    state.previewTheme = state.previewTheme === "dark" ? "light" : "dark";
    syncPreviewTheme();
    if (state.currentDocument && state.viewMode === "render") {
      await renderMarkdownDocument(state.currentDocument.content);
    }
  });

  window.addEventListener("hashchange", async () => {
    const hashState = readHashState();

    if (hashState.path && hashState.path !== state.currentPath) {
      await openDocument(hashState.path);
    }

    if (hashState.section) {
      scrollToPreviewAnchor(hashState.section);
    }
  });

  previewEl.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a[data-section-anchor]") : null;
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    event.preventDefault();
    const section = anchor.dataset.sectionAnchor;
    if (!section) {
      return;
    }

    navigateToDocumentSection(section);
  });
}

function renderTree() {
  const catalog = state.catalog;
  if (!catalog) {
    return;
  }

  const nodes = filterNodes(catalog.nodes, state.search);
  treeEl.innerHTML = "";
  treeEmptyEl.classList.toggle("hidden", nodes.length > 0 || catalog.fileCount > 0);

  if (nodes.length === 0 && catalog.fileCount > 0) {
    treeEl.innerHTML = `<div class="empty">No markdown files match \"${escapeHtml(state.search)}\".</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const node of nodes) {
    fragment.appendChild(renderTreeNode(node));
  }
  treeEl.appendChild(fragment);

  if (state.restoreTreeItemOnInitialLoad) {
    const restored = scrollActiveTreeItemIntoView();
    if (restored) {
      state.restoreTreeItemOnInitialLoad = false;
    }
  }
}

function renderTreeNode(node) {
  if (node.kind === "file") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tree-file";
    button.dataset.treePath = node.path;
    if (node.path === state.currentPath) {
      button.classList.add("active");
    }
    button.innerHTML = `<span class="tree-file-name">${escapeHtml(stripExtension(node.name))}</span>`;
    button.addEventListener("click", async () => {
      await openDocument(node.path);
      writePathToHash(node.path);
    });
    return button;
  }

  const details = document.createElement("details");
  details.className = "tree-group";
  details.open = true;

  const summary = document.createElement("summary");
  summary.textContent = node.name;

  const children = document.createElement("div");
  children.className = "tree-children";
  node.children.forEach((child) => {
    children.appendChild(renderTreeNode(child));
  });

  details.appendChild(summary);
  details.appendChild(children);
    return details;
  }

async function openDocument(path) {
  setStatus("Loading document");

  const documentData = await fetchJson(`/api/document?path=${encodeURIComponent(path)}`);
  state.currentPath = documentData.path;
  state.currentDocument = documentData;

  documentTitleEl.textContent = stripExtension(documentData.name);
  documentPathEl.textContent = documentData.path;
  renderRawMarkdown(documentData.content, documentData.path);
  await renderMarkdownDocument(documentData.content);
  syncViewMode();
  renderTree();
  setStatus(`Updated ${new Date(documentData.updatedAt).toLocaleString()}`);
}

async function renderMarkdownDocument(markdown) {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const frontmatterHtml = frontmatter ? renderFrontmatterTable(frontmatter) : "";
  const rawHtml = frontmatterHtml + marked.parse(body);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["mjx-container"],
    ADD_ATTR: ["id", "class", "style"],
  });

  previewEl.innerHTML = sanitizedHtml;
  applyHeadingAnchors(previewEl);
  enhanceGitHubAlerts(previewEl);
  rewritePreviewUrls(previewEl, state.currentPath);
  addCodeCopyButtons(previewEl);

  const mermaidNodes = Array.from(previewEl.querySelectorAll(".mermaid"));
  if (mermaidNodes.length > 0) {
    mermaid.initialize({
      startOnLoad: false,
      theme: state.previewTheme === "dark" ? "dark" : "default",
      securityLevel: "strict",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
    });
    await mermaid.run({ nodes: mermaidNodes });
  }

  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    await window.MathJax.typesetPromise([previewEl]);
  }

  const hashState = readHashState();
  if (hashState.section) {
    scrollToPreviewAnchor(hashState.section);
  }
}

function renderRawMarkdown(markdown, path) {
  const normalized = String(markdown ?? "").replace(/\r\n?/g, "\n");
  const language = inferSourceLanguage(path) || "markdown";

  if (typeof window.hljs === "undefined") {
    rawCodeEl.innerHTML = escapeHtml(normalized);
    return;
  }

  try {
    if (language && typeof window.hljs.getLanguage === "function" && window.hljs.getLanguage(language)) {
      rawCodeEl.innerHTML = window.hljs.highlight(normalized, {
        ignoreIllegals: true,
        language,
      }).value;
      rawCodeEl.className = `hljs language-${language}`;
      return;
    }

    if (typeof window.hljs.highlightAuto === "function") {
      const result = window.hljs.highlightAuto(normalized);
      rawCodeEl.innerHTML = result.value;
      rawCodeEl.className = `hljs language-${result.language || "markdown"}`;
      return;
    }
  } catch (_) {}

  rawCodeEl.innerHTML = escapeHtml(normalized);
  rawCodeEl.className = "hljs language-markdown";
}

function addCodeCopyButtons(container) {
  Array.from(container.querySelectorAll("pre > code")).forEach((codeElement) => {
    const pre = codeElement.parentElement;
    if (!pre) {
      return;
    }

    if (pre.querySelector(".code-copy-button")) {
      return;
    }

    pre.classList.add("code-block");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.setAttribute("aria-label", "Copy code");
    button.setAttribute("title", "Copy code");
    button.innerHTML = copyIcon();
    button.addEventListener("click", async () => {
      const copied = await copyText(codeElement.textContent || "");
      if (copied) {
        flashButtonIcon(button, checkIcon(), copyIcon());
        setStatus("Code copied");
      }
    });

    pre.appendChild(button);
  });
}

function rewritePreviewUrls(container, documentPath) {
  if (!documentPath) {
    return;
  }

  const documentDir = dirname(documentPath);

  Array.from(container.querySelectorAll("img[src], source[src], audio[src], video[src]")).forEach((element) => {
    const current = element.getAttribute("src");
    if (!current || isAbsoluteLikeUrl(current)) {
      return;
    }

    const resolved = resolveRelativePath(documentDir, current);
    element.setAttribute("src", toContentUrl(resolved));
  });

  Array.from(container.querySelectorAll("a[href]")).forEach((element) => {
    const current = element.getAttribute("href");
    if (!current || isAbsoluteLikeUrl(current)) {
      if (current && current.startsWith("#")) {
        const section = normalizeAnchor(current.slice(1));
        if (!section) {
          return;
        }

        element.dataset.sectionAnchor = section;
        element.setAttribute("href", buildDocumentHash(documentPath, section));
      }
      return;
    }

    const resolved = resolveRelativePath(documentDir, current);
    if (/\.(md|markdown)$/i.test(resolved)) {
      element.setAttribute("href", `#path=${encodeURIComponent(resolved)}`);
      return;
    }

    element.setAttribute("href", toContentUrl(resolved));
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noreferrer noopener");
  });
}

function applyHeadingAnchors(container) {
  const seenIds = new Map();
  Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).forEach((heading) => {
    const baseId = slugifyHeading(heading.textContent || "section");
    const count = seenIds.get(baseId) || 0;
    seenIds.set(baseId, count + 1);
    heading.id = count === 0 ? baseId : `${baseId}-${count}`;
  });
}

function configureMarked() {
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    if (lang === "mermaid") {
      return `<div class="mermaid">${escapeHtml(text)}</div>`;
    }

    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlightedCode = hljs.highlight(text, { language }).value;
    return `<pre><code class="hljs ${language}">${highlightedCode}</code></pre>`;
  };

  marked.setOptions({
    gfm: true,
    headerIds: true,
    mangle: false,
    renderer,
  });
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!match) {
    return { frontmatter: null, body: markdown };
  }

  try {
    return {
      frontmatter: jsyaml.load(match[1]) || null,
      body: markdown.slice(match[0].length),
    };
  } catch (_) {
    return { frontmatter: null, body: markdown };
  }
}

function renderFrontmatterTable(data) {
  const rows = Object.entries(data).map(([key, value]) => {
    return `<tr><th>${escapeHtml(key)}</th><td>${renderFrontmatterValue(value)}</td></tr>`;
  });
  return `<table class="frontmatter-table"><tbody>${rows.join("")}</tbody></table>`;
}

function renderFrontmatterValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    const allPrimitive = value.every((entry) => entry === null || typeof entry !== "object");
    if (allPrimitive) {
      return value
        .map((entry) => `<span class="fm-tag">${escapeHtml(String(entry ?? ""))}</span>`)
        .join("");
    }

    return `<pre class="fm-complex">${escapeHtml(jsyaml.dump(value).trimEnd())}</pre>`;
  }

  if (typeof value === "object") {
    return `<pre class="fm-complex">${escapeHtml(jsyaml.dump(value).trimEnd())}</pre>`;
  }

  return escapeHtml(String(value));
}

function enhanceGitHubAlerts(container) {
  const blockquotes = container.querySelectorAll("blockquote");
  blockquotes.forEach((blockquote) => {
    const firstParagraph = Array.from(blockquote.children).find((child) => child.tagName === "P");
    if (!firstParagraph) {
      return;
    }

    const firstParagraphHtml = firstParagraph.innerHTML.trim();
    const markerMatch = firstParagraphHtml.match(GITHUB_ALERT_MARKER_REGEX);
    if (!markerMatch) {
      return;
    }

    const alertType = markerMatch[1].toLowerCase();
    const alertMeta = GITHUB_ALERT_META[alertType] || { label: markerMatch[1], path: "" };
    const title = document.createElement("p");
    title.className = "markdown-alert-title";
    const icon = document.createElement("span");
    icon.className = "markdown-alert-icon";
    icon.setAttribute("aria-hidden", "true");

    if (alertMeta.path) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", alertMeta.viewBox || "0 0 512 512");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", alertMeta.path);
      svg.appendChild(path);
      icon.appendChild(svg);
    }

    const label = document.createElement("span");
    label.textContent = alertMeta.label;
    title.appendChild(icon);
    title.appendChild(label);

    blockquote.classList.add("markdown-alert", `markdown-alert-${alertType}`);
    blockquote.insertBefore(title, blockquote.firstChild);

    const remainingHtml = firstParagraphHtml.replace(GITHUB_ALERT_MARKER_REGEX, "").trim();
    if (remainingHtml) {
      firstParagraph.innerHTML = remainingHtml;
    } else {
      firstParagraph.remove();
    }
  });
}

function filterNodes(nodes, search) {
  if (!search) {
    return nodes;
  }

  const results = [];
  for (const node of nodes) {
    if (node.kind === "file") {
      if (node.path.toLowerCase().includes(search)) {
        results.push(node);
      }
      continue;
    }

    const filteredChildren = filterNodes(node.children, search);
    if (filteredChildren.length > 0 || node.path.toLowerCase().includes(search)) {
      results.push({ ...node, children: filteredChildren });
    }
  }
  return results;
}

function dirname(filePath) {
  const segments = filePath.split("/");
  segments.pop();
  return segments.join("/");
}

function resolveRelativePath(baseDir, relativePath) {
  const input = relativePath.split(/[?#]/)[0];
  const queryAndHash = relativePath.slice(input.length);
  const segments = (baseDir ? baseDir.split("/") : []).filter(Boolean);

  input.split("/").forEach((segment) => {
    if (!segment || segment === ".") {
      return;
    }
    if (segment === "..") {
      if (segments.length > 0) {
        segments.pop();
      }
      return;
    }
    segments.push(segment);
  });

  return segments.join("/") + queryAndHash;
}

function toContentUrl(relativePath) {
  const [pathOnly, suffix = ""] = relativePath.split(/(?=[?#])/);
  const encodedPath = pathOnly
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/content/${encodedPath}${suffix}`;
}

function isAbsoluteLikeUrl(value) {
  return /^(?:[a-z]+:|#|\/)/i.test(value);
}

function navigateToDocumentSection(section) {
  const normalized = normalizeAnchor(section);
  if (!normalized) {
    return;
  }

  writePathToHash(state.currentPath, normalized);
  scrollToPreviewAnchor(normalized);
}

function scrollToPreviewAnchor(section) {
  const normalized = normalizeAnchor(section);
  if (!normalized) {
    return;
  }

  const target = previewEl.querySelector(`#${escapeCssSelector(normalized)}`);
  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.scrollIntoView({ block: "start", behavior: "smooth" });
}

function scrollActiveTreeItemIntoView() {
  if (!state.currentPath) {
    return false;
  }

  const activeItem = treeEl.querySelector(`[data-tree-path="${escapeCssSelector(state.currentPath)}"]`);
  if (!(activeItem instanceof HTMLElement)) {
    return false;
  }

  window.requestAnimationFrame(() => {
    const treeRect = treeEl.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const top = itemRect.top - treeRect.top + treeEl.scrollTop - 4;
    treeEl.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  });

  return true;
}

function setViewMode(viewMode) {
  state.viewMode = viewMode;
  savePreference("viewMode", viewMode);
  syncViewMode();
}

function syncViewMode() {
  const isRender = state.viewMode === "render";
  previewEl.classList.toggle("hidden", !isRender);
  rawPreviewEl.classList.toggle("hidden", isRender);
  renderViewButtonEl.classList.toggle("active", isRender);
  rawViewButtonEl.classList.toggle("active", !isRender);
  renderViewButtonEl.setAttribute("aria-pressed", isRender ? "true" : "false");
  rawViewButtonEl.setAttribute("aria-pressed", !isRender ? "true" : "false");
}

function syncPreviewTheme() {
  const isDark = state.previewTheme === "dark";
  document.documentElement.setAttribute("data-preview-theme", state.previewTheme);
  markdownThemeDarkEl.disabled = !isDark;
  markdownThemeLightEl.disabled = isDark;
  highlightThemeDarkEl.disabled = !isDark;
  highlightThemeLightEl.disabled = isDark;
  previewThemeButtonEl.innerHTML = isDark ? sunIcon() : moonIcon();
  previewThemeButtonEl.setAttribute(
    "aria-label",
    isDark ? "Switch preview to light mode" : "Switch preview to dark mode",
  );
  previewThemeButtonEl.setAttribute(
    "title",
    isDark ? "Switch preview to light mode" : "Switch preview to dark mode",
  );
  savePreference("previewTheme", state.previewTheme);
}

function loadPreference(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return fallbackValue;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed[key] === "string" ? parsed[key] : fallbackValue;
  } catch (_) {
    return fallbackValue;
  }
}

function savePreference(key, value) {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[key] = value;
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(parsed));
  } catch (_) {
    // Ignore storage failures and keep the viewer usable.
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      return true;
    } catch (_) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

function flashButtonIcon(button, activeIcon, idleIcon) {
  button.innerHTML = activeIcon;
  window.setTimeout(() => {
    button.innerHTML = idleIcon;
  }, 1200);
}

function inferSourceLanguage(path) {
  const lowerPath = String(path || "").toLowerCase();
  if (lowerPath.endsWith(".md") || lowerPath.endsWith(".markdown")) {
    return "markdown";
  }
  return "";
}

function copyIcon() {
  return iconSvg("M320 448H112c-35.3 0-64-28.7-64-64V112c0-35.3 28.7-64 64-64h176c17 0 33.3 6.7 45.3 18.7l60 60c12 12 18.7 28.3 18.7 45.3V384c0 35.3-28.7 64-64 64zM128 144v240h208V192h-64c-17.7 0-32-14.3-32-32V96H128zm160-41.4V144h41.4L288 102.6zM160 0h144v32H160c-17.7 0-32 14.3-32 32V80H96V64c0-35.3 28.7-64 64-64z");
}

function checkIcon() {
  return iconSvg("M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-224 224c-12.5 12.5-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 306.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z");
}

function moonIcon() {
  return iconSvg("M279.135 512c78.756 0 150.982-35.804 198.844-94.775 28.273-34.86-2.558-85.722-46.249-77.401-82.348 15.686-158.272-47.268-158.272-130.792 0-48.424 26.06-92.291 67.434-115.828 38.745-22.039 28.999-80.788-15.022-90.879A257.936 257.936 0 0 0 268.87 0C127.01 0 12.412 114.593 12.412 256S127.01 512 279.135 512z");
}

function sunIcon() {
  return iconSvg("M256 160c-53 0-96 43-96 96s43 96 96 96 96-43 96-96-43-96-96-96zm0-160c17.7 0 32 14.3 32 32V64c0 17.7-14.3 32-32 32s-32-14.3-32-32V32c0-17.7 14.3-32 32-32zm0 416c17.7 0 32 14.3 32 32V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V448c0-17.7 14.3-32 32-32zM480 224c17.7 0 32 14.3 32 32s-14.3 32-32 32H448c-17.7 0-32-14.3-32-32s14.3-32 32-32h32zM96 256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64c17.7 0 32 14.3 32 32zm339.9-147.9c12.5 12.5 12.5 32.8 0 45.3l-22.6 22.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l22.6-22.6c12.5-12.5 32.8-12.5 45.3 0zM144 368c12.5 12.5 12.5 32.8 0 45.3l-22.6 22.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l22.6-22.6c12.5-12.5 32.8-12.5 45.3 0zm291.9 67.9c-12.5 12.5-32.8 12.5-45.3 0L368 413.3c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l22.6 22.6c12.5 12.5 12.5 32.8 0 45.3zM144 144c-12.5 12.5-32.8 12.5-45.3 0L76.1 121.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L144 98.7c12.5 12.5 12.5 32.8 0 45.3z");
}

function iconSvg(pathData) {
  return `<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path d="${pathData}"></path></svg>`;
}

copyMarkdownButtonEl.innerHTML = copyIcon();
syncViewMode();
syncPreviewTheme();

function fetchJson(url) {
  return fetch(url).then(async (response) => {
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error?.message || `Request failed with ${response.status}`);
    }
    return response.json();
  });
}

function readHashState() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return { path: null, section: null };
  }

  if (!raw.includes("=")) {
    return {
      path: null,
      section: normalizeAnchor(decodeURIComponent(raw)),
    };
  }

  const params = new URLSearchParams(raw);
  return {
    path: params.get("path"),
    section: normalizeAnchor(params.get("section")),
  };
}

function writePathToHash(path, section = null) {
  const params = new URLSearchParams();
  if (path) {
    params.set("path", path);
  }
  if (section) {
    params.set("section", section);
  }
  window.location.hash = params.toString();
}

function stripExtension(fileName) {
  return fileName.replace(/\.(md|markdown)$/i, "");
}

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function slugifyHeading(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^ -]+/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

function normalizeAnchor(value) {
  if (!value) {
    return null;
  }

  return slugifyHeading(String(value).replace(/^#/, ""));
}

function buildDocumentHash(path, section) {
  const params = new URLSearchParams();
  if (path) {
    params.set("path", path);
  }
  if (section) {
    params.set("section", section);
  }
  return `#${params.toString()}`;
}

function escapeCssSelector(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return String(value).replace(/([#.;?+*~\[\]()=>|/:@])/g, "\\$1");
}
