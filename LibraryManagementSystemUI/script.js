const STORAGE = {
  users: "lms_users_v1",
  books: "lms_books_v1",
  session: "lms_session_v1",
};

const ADMIN_DEFAULT = {
  username: "admin",
  password: "admin123",
};

const els = {
  sidebar: document.getElementById("sidebar"),
  sidebarBackdrop: document.getElementById("sidebarBackdrop"),
  menuBtn: document.getElementById("menuBtn"),
  navItems: Array.from(document.querySelectorAll(".nav__item[data-nav]")),
  navAdmin: document.getElementById("navAdmin"),

  authBtn: document.getElementById("authBtn"),
  authBtnLabel: document.getElementById("authBtnLabel"),
  userPill: document.getElementById("userPill"),
  userName: document.getElementById("userName"),
  userRole: document.getElementById("userRole"),

  viewDashboard: document.getElementById("view-dashboard"),
  viewBooks: document.getElementById("view-books"),
  viewIssue: document.getElementById("view-issue"),
  viewReturn: document.getElementById("view-return"),
  viewAdmin: document.getElementById("view-admin"),

  statsGrid: document.getElementById("statsGrid"),

  grid: document.getElementById("booksGrid"),
  searchInput: document.getElementById("searchInput"),
  booksFilter: document.getElementById("booksFilter"),
  resultsMeta: document.getElementById("resultsMeta"),
  issueMeta: document.getElementById("issueMeta"),
  returnMeta: document.getElementById("returnMeta"),
  issuedList: document.getElementById("issuedList"),
  returnList: document.getElementById("returnList"),
  addBookForm: document.getElementById("addBookForm"),
  bookTitle: document.getElementById("bookTitle"),
  bookAuthor: document.getElementById("bookAuthor"),
  addBookError: document.getElementById("addBookError"),
  adminBooksList: document.getElementById("adminBooksList"),
  studentsList: document.getElementById("studentsList"),
  adminIssuedList: document.getElementById("adminIssuedList"),

  authOverlay: document.getElementById("authOverlay"),
  authCloseBtn: document.getElementById("authCloseBtn"),
  tabStudent: document.getElementById("tab-student"),
  tabAdmin: document.getElementById("tab-admin"),
  paneStudent: document.getElementById("pane-student"),
  paneAdmin: document.getElementById("pane-admin"),
  subtabLogin: document.getElementById("subtab-login"),
  subtabRegister: document.getElementById("subtab-register"),
  studentLoginForm: document.getElementById("studentLoginForm"),
  studentRegisterForm: document.getElementById("studentRegisterForm"),
  studentLoginEmail: document.getElementById("studentLoginEmail"),
  studentLoginPassword: document.getElementById("studentLoginPassword"),
  studentLoginError: document.getElementById("studentLoginError"),
  studentName: document.getElementById("studentName"),
  studentRegNo: document.getElementById("studentRegNo"),
  studentEmail: document.getElementById("studentEmail"),
  studentPassword: document.getElementById("studentPassword"),
  studentPassword2: document.getElementById("studentPassword2"),
  studentRegisterError: document.getElementById("studentRegisterError"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  adminUsername: document.getElementById("adminUsername"),
  adminPassword: document.getElementById("adminPassword"),
  adminLoginError: document.getElementById("adminLoginError"),

  modalOverlay: document.getElementById("modalOverlay"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  modalCancelBtn: document.getElementById("modalCancelBtn"),
  modalConfirmBtn: document.getElementById("modalConfirmBtn"),
  modalTitle: document.getElementById("modalTitle"),
  modalSubtitle: document.getElementById("modalSubtitle"),
  modalBody: document.getElementById("modalBody"),

  scrollButtons: document.getElementById("scrollButtons"),
  scrollToTopBtn: document.getElementById("scrollToTopBtn"),
  scrollToBottomBtn: document.getElementById("scrollToBottomBtn"),
};

let state = {
  view: "dashboard",
  modal: { onConfirm: null },
};

function isSidebarOpen() {
  return els.sidebar.classList.contains("is-open");
}

function updateScrollLock() {
  const lock = !els.authOverlay.hidden || !els.modalOverlay.hidden || isSidebarOpen();
  document.body.classList.toggle("overlay-open", lock);
}

function setSidebarOpen(next) {
  const shouldOpen = Boolean(next);
  els.sidebar.classList.toggle("is-open", shouldOpen);
  els.sidebarBackdrop.hidden = !shouldOpen;
  updateScrollLock();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getUsers() {
  return safeJsonParse(localStorage.getItem(STORAGE.users), []);
}

function setUsers(users) {
  localStorage.setItem(STORAGE.users, JSON.stringify(users));
}

function getBooks() {
  return safeJsonParse(localStorage.getItem(STORAGE.books), []);
}

function setBooks(books) {
  localStorage.setItem(STORAGE.books, JSON.stringify(books));
}

function getSession() {
  return safeJsonParse(localStorage.getItem(STORAGE.session), null);
}

function setSession(session) {
  localStorage.setItem(STORAGE.session, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE.session);
}

function todayLocalMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

/** Returns available date like "March 15" */
function formatAvailableDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function daysLate(dueDate) {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const now = todayLocalMidnight();
  const diff = now.getTime() - due.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function currentFineForBook(book) {
  if (book.status !== "issued" || !book.dueDateISO) return 0;
  return daysLate(book.dueDateISO) * 5;
}

function seedIfNeeded() {
  const existingBooks = getBooks();
  if (!Array.isArray(existingBooks) || existingBooks.length === 0) {
    const seedBooks = [
      { id: "b1", title: "Clean Code", author: "Robert C. Martin", hue: 210, status: "available" },
      { id: "b2", title: "The Pragmatic Programmer", author: "Andrew Hunt", hue: 140, status: "available" },
      { id: "b3", title: "Design Patterns", author: "Erich Gamma", hue: 260, status: "available" },
      { id: "b4", title: "Eloquent JavaScript", author: "Marijn Haverbeke", hue: 35, status: "available" },
      { id: "b5", title: "You Don’t Know JS", author: "Kyle Simpson", hue: 300, status: "available" },
      { id: "b6", title: "Introduction to Algorithms", author: "Cormen et al.", hue: 20, status: "available" },
      { id: "b7", title: "The Mythical Man-Month", author: "Frederick P. Brooks Jr.", hue: 185, status: "available" },
      { id: "b8", title: "Refactoring", author: "Martin Fowler", hue: 95, status: "available" },
      { id: "b9", title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", hue: 12, status: "available" },
      { id: "b10", title: "Upcoming Systems Book", author: "Jane Doe", hue: 200, status: "preorder", availableOn: "2026-04-01" },
    ];
    setBooks(seedBooks);
  }

  const existingUsers = getUsers();
  if (!Array.isArray(existingUsers)) setUsers([]);
}

function getCurrentUser() {
  const session = getSession();
  if (!session || !session.type) return null;

  if (session.type === "admin") {
    return { id: "admin", role: "admin", name: "Admin", username: ADMIN_DEFAULT.username };
  }

  if (session.type === "student") {
    const users = getUsers();
    const u = users.find((x) => x.id === session.userId);
    if (!u) return null;
    return { ...u, role: "student" };
  }

  return null;
}

function coverDataUri(title, author, hue) {
  const t = escapeHtml(title);
  const a = escapeHtml(author);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${hue} 90% 60%)" stop-opacity="0.95"/>
          <stop offset="1" stop-color="hsl(${(hue + 70) % 360} 85% 55%)" stop-opacity="0.9"/>
        </linearGradient>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="rgba(15,23,42,0.30)"/>
        </filter>
      </defs>
      <rect width="900" height="500" rx="30" fill="url(#g)"/>
      <g filter="url(#s)" opacity="0.22">
        <circle cx="720" cy="120" r="110" fill="#fff"/>
        <circle cx="760" cy="350" r="85" fill="#fff"/>
        <circle cx="170" cy="360" r="120" fill="#fff"/>
      </g>
      <g>
        <rect x="70" y="70" width="760" height="360" rx="22" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.24)"/>
        <text x="105" y="190" fill="rgba(255,255,255,0.96)" font-size="52" font-family="system-ui, Segoe UI, Arial, sans-serif" font-weight="800">
          ${t}
        </text>
        <text x="105" y="250" fill="rgba(255,255,255,0.92)" font-size="28" font-family="system-ui, Segoe UI, Arial, sans-serif" font-weight="600">
          ${a}
        </text>
        <text x="105" y="330" fill="rgba(255,255,255,0.85)" font-size="18" font-family="system-ui, Segoe UI, Arial, sans-serif" font-weight="600" letter-spacing="3">
          LIBRARY COLLECTION
        </text>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function filteredBooks(query, filterMode) {
  const q = query.trim().toLowerCase();
  let list = getBooks();
  if (filterMode === "issued_only") {
    list = list.filter((b) => b.status === "issued");
  }
  if (!q) return list;
  return list.filter((b) => (b.title + " " + b.author).toLowerCase().includes(q));
}

function setMeta(count, query) {
  const q = query.trim();
  els.resultsMeta.textContent = q ? `Showing ${count} result${count === 1 ? "" : "s"} for “${q}”.` : `Showing ${count} book${count === 1 ? "" : "s"}.`;
}

function renderGrid(list, user) {
  if (!list.length) {
    els.grid.innerHTML = `<div class="empty">No books match your search. Try a different keyword.</div>`;
    return;
  }

  const html = list
    .map((b) => {
      const img = coverDataUri(b.title, b.author, b.hue);
      let badgeClass = "badge badge--available";
      let badgeLabel = "Available";
      if (b.status === "issued") {
        badgeClass = "badge badge--unavailable";
        badgeLabel = "Issued";
      } else if (b.status === "preorder" || b.status === "pre-ordered" || b.status === "pre-ordered") {
        badgeClass = "badge badge--preorder";
        badgeLabel = "Pre-order";
      }
      const issued = b.status === "issued";
      const canIssue = user && user.role === "student";
      // Available Date: for issued = when it will be back (due date), for pre-order = availableOn; not for available books
      let availableDateHtml = "";
      const dateToShow = issued && b.dueDateISO
        ? b.dueDateISO
        : b.availableOn
          ? b.availableOn
          : null;
      if (dateToShow) {
        const dateStr = formatAvailableDate(dateToShow);
        availableDateHtml = `
          <div class="card__statusRow book-date-row">
            <span class="card__fieldLabel">Available Date</span>
            <span class="book-date-value">
              <span class="book-date-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none"><rect x="3" y="6" width="14" height="11" rx="2" fill="#e0e7ff"/><rect x="1" y="3" width="18" height="15" rx="3" stroke="#6366f1" stroke-width="1.5"/><path d="M6 1v4M14 1v4" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/><rect x="7" y="10" width="6" height="2" rx="1" fill="#6366f1"/></svg>
              </span>
              <span class="book-date-label">${escapeHtml(dateStr)}</span>
            </span>
          </div>
        `;
      } else if (b.status !== "available") {
        availableDateHtml = `
          <div class="card__statusRow">
            <span class="card__fieldLabel">Available Date</span>
            <span class="card__muted">—</span>
          </div>
        `;
      }
      const isPreorder = b.status === "preorder" || b.status === "pre-ordered";
      const issueBtnHtml = `<button class="issue-btn" type="button" data-action="issue" ${issued || !canIssue ? "disabled" : ""}>
                ${!canIssue ? "Login to Issue" : issued ? "Issued" : "Issue"}
              </button>`;
      const preorderBtnHtml = `<button class="btn btn--preorder-card" type="button" data-action="preorder">Pre-Order</button>`;
      return `
        <article class="card" data-id="${escapeHtml(b.id)}">
          <div class="card__media">
            <img class="card__img" src="${img}" alt="${escapeHtml(b.title)} cover" loading="lazy" />
          </div>
          <div class="card__body">
            <div class="card__info">
              <div class="card__field">
                <span class="card__fieldLabel">Title</span>
                <h3 class="card__title">${escapeHtml(b.title)}</h3>
              </div>
              <div class="card__field">
                <span class="card__fieldLabel">Author</span>
                <span class="label-author">${escapeHtml(b.author)}</span>
              </div>
            </div>
            <div class="card__statusBlock">
              <div class="card__statusRow">
                <span class="card__fieldLabel">Current status</span>
                <span class="label-status ${badgeClass}">${badgeLabel}</span>
              </div>
              ${availableDateHtml.replace('book-date-label','label-date book-date-label')}
            </div>
            <div class="card__footer">
              ${issueBtnHtml}
              ${preorderBtnHtml}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  els.grid.innerHTML = html;
}

function applySearch() {
  const query = els.searchInput.value || "";
  const filterMode = els.booksFilter ? els.booksFilter.value : "all";
  const user = getCurrentUser();
  const list = filteredBooks(query, filterMode);
  setMeta(list.length, query);
  renderGrid(list, user);
}

function setActiveNav(target) {
  els.navItems.forEach((el) => el.classList.toggle("is-active", el.dataset.nav === target));
}

function showView(name) {
  state.view = name;
  setActiveNav(name);
  const views = [
    ["dashboard", els.viewDashboard],
    ["books", els.viewBooks],
    ["issue", els.viewIssue],
    ["return", els.viewReturn],
    ["admin", els.viewAdmin],
    ["home", els.viewBooks],
  ];
  views.forEach(([k, el]) => el.classList.toggle("is-hidden", k !== name));

  if (name === "dashboard") renderDashboard();
  // Treat "home" as the Books view as well, so books render correctly
  if (name === "books" || name === "home") applySearch();
  if (name === "issue") renderIssued();
  if (name === "return") renderReturnable();
  if (name === "admin") renderAdmin();

  updateScrollButtons();
}

function updateScrollButtons() {
  const isBooksView = state.view === "books" || state.view === "home";
  if (!els.scrollButtons || !els.scrollToTopBtn || !els.scrollToBottomBtn) return;
  if (!isBooksView) {
    els.scrollButtons.hidden = true;
    return;
  }
  const y = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const showButtons = y > 120;
  els.scrollButtons.hidden = !showButtons;
  els.scrollToBottomBtn.style.opacity = docHeight > 80 && y < docHeight - 80 ? "1" : "0.5";
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
}

function initScrollButtons() {
  if (!els.scrollButtons || !els.scrollToTopBtn || !els.scrollToBottomBtn) return;
  window.addEventListener("scroll", updateScrollButtons, { passive: true });
  els.scrollToTopBtn.addEventListener("click", scrollToTop);
  els.scrollToBottomBtn.addEventListener("click", scrollToBottom);
  updateScrollButtons();
}

function initNav() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = item.dataset.nav;
      if (target === "logout") {
        doLogout();
      } else if (target === "books") {
        // When Books is clicked, show Home (Books section)
        showView("home");
      } else {
        showView(target);
      }

      setSidebarOpen(false);
    });
  });
}

function openOverlay(el) {
  el.hidden = false;
  updateScrollLock();
}

function closeOverlay(el) {
  el.hidden = true;
  updateScrollLock();
}

function setFormError(el, message) {
  if (!message) {
    el.hidden = true;
    el.textContent = "";
    return;
  }
  el.hidden = false;
  el.textContent = message;
}

function openAuth() {
  closeModal();
  setFormError(els.studentLoginError, "");
  setFormError(els.studentRegisterError, "");
  setFormError(els.adminLoginError, "");
  openOverlay(els.authOverlay);
}

function closeAuth() {
  closeOverlay(els.authOverlay);
}

function openModal({ title, subtitle, bodyHtml, confirmText = "Confirm", onConfirm }) {
  closeAuth();
  closeModal();
  els.modalTitle.textContent = title || "Confirm";
  els.modalSubtitle.textContent = subtitle || "";
  els.modalBody.innerHTML = bodyHtml || "";
  els.modalConfirmBtn.textContent = confirmText;
  state.modal.onConfirm = onConfirm || null;
  openOverlay(els.modalOverlay);
}

function closeModal() {
  state.modal.onConfirm = null;
  closeOverlay(els.modalOverlay);
}

function confirmAction() {
  const fn = state.modal.onConfirm;
  try {
    if (typeof fn === "function") {
      const result = fn();
      if (result === false) return;
    }
  } catch (err) {
    // Keep modal open on unexpected errors
    console.error(err);
    return;
  }
  closeModal();
}

function kv(label, value) {
  // If value looks like HTML (contains a tag), do not escape it
  const isHtml = /<[^>]+>/.test(value);
  return `<div class="kv"><span>${escapeHtml(label)}</span><b>${isHtml ? value : escapeHtml(value)}</b></div>`;
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    openAuth();
    return null;
  }
  return user;
}

function issueBookFlow(bookId) {
  const user = requireLogin();
  if (!user || user.role !== "student") return;

  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  if (book.status === "issued") {
    openModal({
      title: "Not Available",
      subtitle: "This book is currently issued.",
      bodyHtml: `${kv("Book", book.title)}${kv("Status", "Not Available")}`,
      confirmText: "OK",
    });
    return;
  }

  const issueDate = todayLocalMidnight();
  const dueDate = addDays(issueDate, 7);
  openModal({
    title: "Confirm Issue",
    subtitle: "Please confirm the issue details.",
    bodyHtml: [
      kv("Book Title", book.title),
      kv("Issue Date", formatDate(issueDate)),
      kv("Due Date", formatDate(dueDate)),
    ].join(""),
    confirmText: "Issue Book",
    onConfirm: () => {
      const latest = getBooks();
      const b2 = latest.find((b) => b.id === bookId);
      if (!b2) return;
      if (b2.status === "issued") {
        applySearch();
        return;
      }
      b2.status = "issued";
      b2.issuedToUserId = user.id;
      b2.issuedToName = user.name;
      b2.issueDateISO = issueDate.toISOString();
      b2.dueDateISO = dueDate.toISOString();
      setBooks(latest);
      renderDashboard();
      applySearch();
    },
  });
}

function showBookDetails(bookId) {
  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  const isIssued = book.status === "issued";
  const statusLabel =
    book.status === "issued"
      ? "Issued"
      : book.status === "preorder" || book.status === "pre-ordered"
        ? "Pre-order"
        : "Available";

  const rows = [];

  rows.push(kv("Title", `<span class='book-title-colored'>${escapeHtml(book.title)}</span>`));
  rows.push(kv("Author", `<span class='book-author-colored'>${escapeHtml(book.author)}</span>`));
  rows.push(kv("Status", `<span class='book-status-colored status-${book.status}'>${escapeHtml(statusLabel)}</span>`));

  const availableDateForDisplay = isIssued && book.dueDateISO
    ? book.dueDateISO
    : book.availableOn
      ? book.availableOn
      : null;
  if (availableDateForDisplay) {
    const availableStr = formatAvailableDate(availableDateForDisplay);
    rows.push(kv("Available Date", `<span class='book-available-colored'>${escapeHtml(availableStr)}</span>`));
  }

  if (isIssued && book.issueDateISO) {
    rows.push(kv("Issue Date", `<span class='book-issue-date-colored'>${formatDate(book.issueDateISO)}</span>`));
  }
  if (isIssued && book.dueDateISO) {
    rows.push(kv("Due Date", `<span class='book-due-date-colored'>${formatDate(book.dueDateISO)}</span>`));
  }

  if (isIssued) {
    let issuedToRegNo = "—";
    if (book.issuedToUserId) {
      const users = getUsers();
      const issuedUser = users.find((u) => u.id === book.issuedToUserId);
      issuedToRegNo = issuedUser && issuedUser.regNo ? issuedUser.regNo : "—";
    }
    rows.push(kv("Issued To", `<span class='book-issuedto-colored'>${issuedToRegNo}</span>`));
    rows.push(kv("Name", `<span class='book-name-colored'>${book.issuedToName || "—"}</span>`));
  }

  if (isIssued) {
    const fine = currentFineForBook(book);
    rows.push(kv("Current Fine", `<span class='book-fine-colored'>₹${fine}</span>`));
  }

  const cover = coverDataUri(book.title, book.author, book.hue);
  const bodyHtml = `
    <img
      src="${cover}"
      alt="${escapeHtml(book.title)} cover"
      style="width:100%;max-width:260px;border-radius:12px;display:block;margin:0 auto 16px;"
    />
    ${rows.join("")}
  `;

  openModal({
    title: book.title,
    subtitle: `by ${book.author}`,
    bodyHtml,
    confirmText: "OK",
  });
}

function initBookCardActions() {
  els.grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    const id = card?.dataset?.id;
    if (!id) return;

    const issueBtn = e.target.closest("[data-action='issue']");
    if (issueBtn) {
      issueBookFlow(id);
      return;
    }

    const preorderBtn = e.target.closest("[data-action='preorder']");
    if (preorderBtn) {
      e.preventDefault();
      e.stopPropagation();
      openModal({
        title: "Pre-Order",
        subtitle: "Confirm your pre-order.",
        bodyHtml: `<p class="modal__preorder-msg">You can view book details to see the Available Date. Pre-order is recorded.</p>`,
        confirmText: "OK",
      });
      return;
    }

    showBookDetails(id);
  });
}

function initSearch() {
  els.searchInput.addEventListener("input", () => applySearch());
  els.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      els.searchInput.value = "";
      applySearch();
      els.searchInput.blur();
    }
  });
  if (els.booksFilter) {
    els.booksFilter.addEventListener("change", () => applySearch());
  }
}

function initMobileMenu() {
  els.menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setSidebarOpen(!isSidebarOpen());
  });

  els.sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));

  document.addEventListener("click", (e) => {
    if (!isSidebarOpen()) return;
    const clickedInside = e.target.closest("#sidebar") || e.target.closest("#menuBtn");
    if (!clickedInside) setSidebarOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebarOpen(false);
  });
}

function setAuthTab(which) {
  const isStudent = which === "student";
  els.tabStudent.classList.toggle("is-active", isStudent);
  els.tabAdmin.classList.toggle("is-active", !isStudent);
  els.tabStudent.setAttribute("aria-selected", String(isStudent));
  els.tabAdmin.setAttribute("aria-selected", String(!isStudent));
  els.paneStudent.classList.toggle("is-hidden", !isStudent);
  els.paneAdmin.classList.toggle("is-hidden", isStudent);
}

function setStudentSubtab(which) {
  const isLogin = which === "login";
  els.subtabLogin.classList.toggle("is-active", isLogin);
  els.subtabRegister.classList.toggle("is-active", !isLogin);
  els.subtabLogin.setAttribute("aria-selected", String(isLogin));
  els.subtabRegister.setAttribute("aria-selected", String(!isLogin));
  els.studentLoginForm.classList.toggle("is-hidden", !isLogin);
  els.studentRegisterForm.classList.toggle("is-hidden", isLogin);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function doStudentRegister({ name, regNo, email, password, password2 }) {
  const n = name.trim();
  const rn = regNo.trim();
  const em = email.trim().toLowerCase();
  if (n.length < 2) return "Please enter your full name.";
  if (rn.length < 3) return "Please enter your registration number.";
  if (!validateEmail(em)) return "Please enter a valid email address.";
  if (password.length < 4) return "Password must be at least 4 characters.";
  if (password !== password2) return "Passwords do not match.";

  const users = getUsers();
  if (users.some((u) => u.email === em)) return "An account with this email already exists.";
  if (users.some((u) => u.regNo && u.regNo.toLowerCase() === rn.toLowerCase())) {
    return "An account with this registration number already exists.";
  }

  const user = { id: uid("stu"), role: "student", name: n, regNo: rn, email: em, password };
  users.push(user);
  setUsers(users);
  return null;
}

function doStudentLogin({ email, password }) {
  const em = email.trim().toLowerCase();
  if (!validateEmail(em)) return { error: "Please enter a valid email address." };
  const users = getUsers();
  const user = users.find((u) => u.email === em && u.role === "student");
  if (!user) return { error: "Account not found. Please register first." };
  if (user.password !== password) return { error: "Incorrect password." };
  setSession({ type: "student", userId: user.id });
  return { user };
}

function doAdminLogin({ username, password }) {
  const un = username.trim();
  if (!un) return { error: "Please enter username." };
  if (un !== ADMIN_DEFAULT.username || password !== ADMIN_DEFAULT.password) return { error: "Invalid admin credentials." };
  setSession({ type: "admin" });
  return { user: { id: "admin", role: "admin", name: "Admin" } };
}

function doLogout() {
  clearSession();
  renderHeaderAuth();
  showView("dashboard");
  setSidebarOpen(false);
  openAuth();
}

function renderHeaderAuth() {
  const user = getCurrentUser();
  if (!user) {
    els.userPill.hidden = true;
    els.authBtnLabel.textContent = "Login / Registration";
    if (els.navAdmin) els.navAdmin.hidden = true;
    return;
  }
  els.userPill.hidden = false;
  els.userName.textContent = user.name || "User";
  els.userRole.textContent = user.role === "admin" ? "Admin" : "Student";
  els.authBtnLabel.textContent = "Logout";
  if (els.navAdmin) els.navAdmin.hidden = user.role !== "admin";
}

function renderAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    if (els.studentsList) els.studentsList.innerHTML = `<div class="empty">Admin access required.</div>`;
    if (els.adminIssuedList) els.adminIssuedList.innerHTML = `<div class="empty">Admin access required.</div>`;
    if (els.adminBooksList) els.adminBooksList.innerHTML = `<div class="empty">Admin access required.</div>`;
    if (els.addBookError) setFormError(els.addBookError, "");
    return;
  }

  const allBooks = getBooks();
  if (!allBooks.length) {
    els.adminBooksList.innerHTML = `<div class="empty">No books found.</div>`;
    return;
  }

  // Render all books for admin with remove button for available books
  els.adminBooksList.innerHTML = allBooks.map((b) => {
    const badgeClass = b.status === "issued" ? "badge badge--unavailable" : b.status === "preorder" || b.status === "pre-ordered" ? "badge badge--preorder" : "badge badge--available";
    const badgeLabel = b.status === "issued" ? "Issued" : b.status === "preorder" || b.status === "pre-ordered" ? "Pre-order" : "Available";
    let details = '';
    if (b.status === "preorder" || b.status === "pre-ordered") {
      details = `<div class='admin-preorder-details'><span class='label-date'>Pre-order Available:</span> <span class='label-date'>${escapeHtml(formatAvailableDate(b.availableOn))}</span></div>`;
    } else if (b.status === "issued" && b.dueDateISO) {
      details = `<div class='admin-preorder-details'><span class='label-date'>Due Date:</span> <span class='label-date'>${escapeHtml(formatAvailableDate(b.dueDateISO))}</span></div>`;
    } else if (b.status === "available" && b.availableOn) {
      details = `<div class='admin-preorder-details'><span class='label-date'>Available On:</span> <span class='label-date'>${escapeHtml(formatAvailableDate(b.availableOn))}</span></div>`;
    }
    return `
      <div class="row" data-id="${escapeHtml(b.id)}">
        <div class="row__left">
          <div class="row__meta">
            <p class="row__title">${escapeHtml(b.title)}</p>
            <p class="row__sub">by ${escapeHtml(b.author)}</p>
            ${details}
          </div>
        </div>
        <div class="row__actions">
          <span class="${badgeClass} book-status-colored status-${b.status}">${badgeLabel}</span>
          ${b.status === "available" ? `<button class="btn btn--danger" data-action="remove-book" type="button">Remove</button>` : ""}
        </div>
      </div>
    `;
  }).join("");

  const users = getUsers().filter((u) => u.role === "student");
  if (!users.length) {
    els.studentsList.innerHTML = `<div class="empty">No students registered yet.</div>`;
  } else {
    els.studentsList.innerHTML = users
      .map(
        (u) => `
        <div class="row">
          <div class="row__left">
            <div class="row__meta">
              <p class="row__title">${escapeHtml(u.name)}</p>
              <p class="row__sub">${escapeHtml(u.email)}${u.regNo ? " · Reg No: " + escapeHtml(u.regNo) : ""}</p>
            </div>
          </div>
          <div class="row__actions">
            <span class="chip">Student</span>
          </div>
        </div>
      `
      )
      .join("");
  }

  const books = getBooks().filter((b) => b.status === "issued");
  if (!books.length) {
    els.adminIssuedList.innerHTML = `<div class="empty">No books are currently issued.</div>`;
  } else {
    els.adminIssuedList.innerHTML = books
      .map((b) => {
        const late = daysLate(b.dueDateISO);
        const fine = currentFineForBook(b);
        const dueChip = late > 0 ? `<span class="chip chip--danger">Overdue: ${late} day(s)</span>` : `<span class="chip">Due: ${escapeHtml(formatDate(b.dueDateISO))}</span>`;
        const fineChip = `<span class="chip chip--warn">Fine: ₹${fine}</span>`;
        const who = `<span class="chip">Issued to: ${escapeHtml(b.issuedToName || "-")}</span>`;
        return `
          <div class="row">
            <div class="row__left">
              <div class="row__meta">
                <p class="row__title">${escapeHtml(b.title)}</p>
                <p class="row__sub">by ${escapeHtml(b.author)} · Issued: ${escapeHtml(formatDate(b.issueDateISO))}</p>
              </div>
            </div>
            <div class="row__actions">
              ${who}
              ${dueChip}
              ${fineChip}
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function initAdmin() {
  if (!els.addBookForm) return;
  els.addBookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      setFormError(els.addBookError, "Admin access required.");
      return;
    }

    const title = els.bookTitle.value.trim();
    const author = els.bookAuthor.value.trim();
    if (title.length < 2 || author.length < 2) {
      setFormError(els.addBookError, "Please enter valid title and author.");
      return;
    }

    setFormError(els.addBookError, "");
    const books = getBooks();
    books.unshift({
      id: uid("b"),
      title,
      author,
      hue: Math.floor(Math.random() * 360),
      status: "available",
    });
    setBooks(books);
    els.bookTitle.value = "";
    els.bookAuthor.value = "";
    renderDashboard();
    applySearch();
    renderAdmin();
  });

  if (els.adminBooksList) {
    els.adminBooksList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='remove-book']");
      if (!btn) return;
      const row = e.target.closest(".row");
      const id = row?.dataset?.id;
      if (!id) return;

      const user = getCurrentUser();
      if (!user || user.role !== "admin") return;

      const books = getBooks();
      const book = books.find((b) => b.id === id);
      if (!book) return;
      if (book.status === "issued") {
        openModal({
          title: "Cannot Remove",
          subtitle: "This book is currently issued.",
          bodyHtml: `${kv("Book Title", book.title)}${kv("Status", "Not Available")}`,
          confirmText: "OK",
        });
        return;
      }

      openModal({
        title: "Remove Book",
        subtitle: "This will permanently delete the book from this device.",
        bodyHtml: `${kv("Book Title", book.title)}${kv("Author", book.author)}${kv("Status", "Available")}`,
        confirmText: "Remove",
        onConfirm: () => {
          const latest = getBooks();
          const b2 = latest.find((x) => x.id === id);
          if (!b2) return;
          if (b2.status === "issued") return false;
          const next = latest.filter((x) => x.id !== id);
          setBooks(next);
          renderDashboard();
          applySearch();
          renderAdmin();
        },
      });
    });
  }
}

function initAuth() {
  els.authBtn.addEventListener("click", () => {
    const user = getCurrentUser();
    if (user) {
      doLogout();
      return;
    }
    openAuth();
  });

  els.authCloseBtn.addEventListener("click", () => closeAuth());
  els.authOverlay.addEventListener("click", (e) => {
    if (e.target === els.authOverlay) closeAuth();
  });

  els.tabStudent.addEventListener("click", () => setAuthTab("student"));
  els.tabAdmin.addEventListener("click", () => setAuthTab("admin"));
  els.subtabLogin.addEventListener("click", () => setStudentSubtab("login"));
  els.subtabRegister.addEventListener("click", () => setStudentSubtab("register"));

  els.studentRegisterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setFormError(els.studentRegisterError, "");
    const err = doStudentRegister({
      name: els.studentName.value,
      regNo: els.studentRegNo.value,
      email: els.studentEmail.value,
      password: els.studentPassword.value,
      password2: els.studentPassword2.value,
    });
    if (err) {
      setFormError(els.studentRegisterError, err);
      return;
    }
    setStudentSubtab("login");
    els.studentLoginEmail.value = els.studentEmail.value.trim();
    els.studentLoginPassword.value = "";
    setFormError(els.studentLoginError, "Account created. Please login.");
  });

  els.studentLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setFormError(els.studentLoginError, "");
    const { error } = doStudentLogin({
      email: els.studentLoginEmail.value,
      password: els.studentLoginPassword.value,
    });
    if (error) {
      setFormError(els.studentLoginError, error);
      return;
    }
    closeAuth();
    renderHeaderAuth();
    showView("home");
  });

  els.adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setFormError(els.adminLoginError, "");
    const { error } = doAdminLogin({
      username: els.adminUsername.value,
      password: els.adminPassword.value,
    });
    if (error) {
      setFormError(els.adminLoginError, error);
      return;
    }
    closeAuth();
    renderHeaderAuth();
    showView("dashboard");
  });

  setAuthTab("student");
  setStudentSubtab("login");
}

function initModal() {
  els.modalCloseBtn.addEventListener("click", () => closeModal());
  els.modalCancelBtn.addEventListener("click", () => closeModal());
  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });
  els.modalConfirmBtn.addEventListener("click", () => confirmAction());
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modalOverlay.hidden) closeModal();
    if (e.key === "Escape" && !els.authOverlay.hidden) closeAuth();
  });
}

function renderDashboard() {
  const user = getCurrentUser();
  const books = getBooks();

  const total = books.length;
  const available = books.filter((b) => b.status !== "issued").length;
  const issued = books.filter((b) => b.status === "issued").length;
  const overdue = books.filter((b) => b.status === "issued" && daysLate(b.dueDateISO) > 0).length;

  const isAdmin = user && user.role === "admin";
  const totalFines = isAdmin ? books.reduce((sum, b) => sum + currentFineForBook(b), 0) : null;

  const items = [
    { id: "total", label: "Total Books", value: total, hint: "All books in library" },
    { id: "available", label: "Available Books", value: available, hint: "Ready to be issued" },
    { id: "issued", label: "Issued Books", value: issued, hint: "Currently not available" },
    { id: "overdue", label: "Overdue Books", value: overdue, hint: "Past due date" },
  ];
  if (isAdmin) items.push({ label: "Total Fines", value: `₹${totalFines}`, hint: "Outstanding (as of today)" });

  els.statsGrid.innerHTML = items
    .map(
      (s) => `
      <div class="stat"${s.id ? ` data-stat="${escapeHtml(s.id)}"` : ""}>
        <div class="stat__label">${escapeHtml(s.label)}</div>
        <div class="stat__value">${escapeHtml(String(s.value))}</div>
        <div class="stat__hint">${escapeHtml(s.hint)}</div>
      </div>
    `
    )
    .join("");
}

function renderIssued() {
  const user = getCurrentUser();
  const books = getBooks().filter((b) => b.status === "issued");

  let list = books;
  if (user && user.role === "student") {
    list = books.filter((b) => b.issuedToUserId === user.id);
    els.issueMeta.textContent = "Your issued books.";
  } else {
    els.issueMeta.textContent = "All issued books.";
  }

  if (!user) {
    els.issuedList.innerHTML = `<div class="empty">Please login to see issued books.</div>`;
    return;
  }

  if (!list.length) {
    els.issuedList.innerHTML = `<div class="empty">No issued books found.</div>`;
    return;
  }

  els.issuedList.innerHTML = list
    .map((b) => {
      const late = daysLate(b.dueDateISO);
      const fine = currentFineForBook(b);
      const chip = late > 0 ? `<span class="chip chip--danger">Overdue: ${late} day(s)</span>` : `<span class="chip">Due: ${escapeHtml(formatDate(b.dueDateISO))}</span>`;
      const fineChip = fine > 0 ? `<span class="chip chip--warn">Fine: ₹${fine}</span>` : `<span class="chip">Fine: ₹0</span>`;
      const who = user.role === "admin" ? `<span class="chip">Issued to: ${escapeHtml(b.issuedToName || "-")}</span>` : "";
      return `
        <div class="row">
          <div class="row__left">
            <div class="row__meta">
              <p class="row__title">${escapeHtml(b.title)}</p>
              <p class="row__sub">by ${escapeHtml(b.author)} · Issued: ${escapeHtml(formatDate(b.issueDateISO))}</p>
            </div>
          </div>
          <div class="row__actions">
            ${who}
            ${chip}
            ${fineChip}
          </div>
        </div>
      `;
    })
    .join("");
}

function returnBookFlow(bookId) {
  const user = requireLogin();
  if (!user || user.role !== "student") return;

  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  if (book.status !== "issued") return;
  if (book.issuedToUserId !== user.id) return;

  const lateDays = daysLate(book.dueDateISO);
  const fine = currentFineForBook(book);
  openModal({
    title: "Confirm Return",
    subtitle: "Review due date and fine before returning.",
    bodyHtml: [
      kv("Book Title", book.title),
      kv("Due Date", formatDate(book.dueDateISO)),
      kv("Late Days", String(lateDays)),
      kv("Total Fine", `₹${fine}`),
    ].join(""),
    confirmText: "Return Book",
    onConfirm: () => {
      const latest = getBooks();
      const b2 = latest.find((b) => b.id === bookId);
      if (!b2) return;
      if (b2.status !== "issued" || b2.issuedToUserId !== user.id) {
        renderReturnable();
        renderDashboard();
        return;
      }
      b2.status = "available";
      delete b2.issuedToUserId;
      delete b2.issuedToName;
      delete b2.issueDateISO;
      delete b2.dueDateISO;
      setBooks(latest);
      renderReturnable();
      renderDashboard();
      applySearch();
    },
  });
}

function renderReturnable() {
  const user = getCurrentUser();
  if (!user) {
    els.returnList.innerHTML = `<div class="empty">Please login to return books.</div>`;
    return;
  }
  if (user.role !== "student") {
    els.returnList.innerHTML = `<div class="empty">Return is available for student accounts only.</div>`;
    return;
  }

  const list = getBooks().filter((b) => b.status === "issued" && b.issuedToUserId === user.id);
  if (!list.length) {
    els.returnList.innerHTML = `<div class="empty">You have no issued books to return.</div>`;
    return;
  }

  els.returnList.innerHTML = list
    .map((b) => {
      const late = daysLate(b.dueDateISO);
      const fine = currentFineForBook(b);
      const dueChip = late > 0 ? `<span class="chip chip--danger">Overdue: ${late} day(s)</span>` : `<span class="chip">Due: ${escapeHtml(formatDate(b.dueDateISO))}</span>`;
      const fineChip = `<span class="chip chip--warn">Fine: ₹${fine}</span>`;
      return `
        <div class="row" data-id="${escapeHtml(b.id)}">
          <div class="row__left">
            <div class="row__meta">
              <p class="row__title">${escapeHtml(b.title)}</p>
              <p class="row__sub">by ${escapeHtml(b.author)} · Issued: ${escapeHtml(formatDate(b.issueDateISO))}</p>
            </div>
          </div>
          <div class="row__actions">
            ${dueChip}
            ${fineChip}
            <button class="issue-btn" type="button" data-action="return">Return</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function initReturnActions() {
  els.returnList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='return']");
    if (!btn) return;
    const row = e.target.closest(".row");
    const id = row?.dataset?.id;
    if (!id) return;
    returnBookFlow(id);
  });
}

function init() {
  seedIfNeeded();
  initNav();
  initBookCardActions();
  initSearch();
  initReturnActions();
  initScrollButtons();
  initMobileMenu();
  initModal();
  initAuth();
  initAdmin();
  renderHeaderAuth();

  const user = getCurrentUser();
  if (!user) {
    showView("dashboard");
    openAuth();
  } else {
    showView(user.role === "admin" ? "admin" : "home");
  }
}

init();
