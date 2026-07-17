const STORAGE_KEY = 'citypulse-submissions';
const defaultSubmissions = [
  {
    id: 1,
    title: 'Pothole near Main Street',
    category: 'Pothole',
    location: 'Main St & 3rd Ave',
    status: 'In progress',
    detail: 'Department assigned a repair crew for the next shift.',
    updatedAt: '10 mins ago'
  },
  {
    id: 2,
    title: 'Broken traffic signal',
    category: 'Accident',
    location: 'River Road',
    status: 'Pending',
    detail: 'Waiting for city coordination and safety review.',
    updatedAt: '1 hr ago'
  },
  {
    id: 3,
    title: 'Garbage overflow',
    category: 'Garbage',
    location: 'Oak Avenue',
    status: 'Resolved',
    detail: 'Sanitation team cleared and disinfected the area.',
    updatedAt: 'Yesterday'
  }
];

function loadState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { submissions: JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Unable to load reports', error);
  }
  return { submissions: defaultSubmissions };
}

const state = loadState();
const navLinks = document.querySelectorAll('a[data-page]');
const pages = document.querySelectorAll('section[data-page]');
const statusBox = document.getElementById('status');
const form = document.getElementById('reportForm');
const uploadInput = document.getElementById('uploadInput');
const dropzone = document.getElementById('dropzone');
const preview = document.getElementById('preview');
const issueList = document.getElementById('issueList');
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');
const resolvedCount = document.getElementById('resolvedCount');

function setStatus(message, kind = 'info') {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`;
}

function showPage(pageId) {
  pages.forEach((page) => {
    page.hidden = page.dataset.page !== pageId;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submissions));
}

function renderIssues() {
  if (!issueList) return;
  issueList.innerHTML = state.submissions.map((item) => {
    const badgeClass = item.status.toLowerCase().replace(/\s+/g, '-') || 'pending';
    return `
      <article class="issue-card">
        <div class="issue-top">
          <h3>${item.title}</h3>
          <span class="badge ${badgeClass}">${item.status}</span>
        </div>
        <p>${item.detail}</p>
        <div class="meta-row">
          <span class="meta-item">${item.category}</span>
          <span class="meta-item">${item.location}</span>
          <span class="meta-item">Updated ${item.updatedAt}</span>
        </div>
      </article>
    `;
  }).join('');

  const total = state.submissions.length;
  const pending = state.submissions.filter((item) => item.status === 'Pending').length;
  const resolved = state.submissions.filter((item) => item.status === 'Resolved').length;
  if (totalCount) totalCount.textContent = total;
  if (pendingCount) pendingCount.textContent = pending;
  if (resolvedCount) resolvedCount.textContent = resolved;
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim();
    const category = formData.get('category')?.toString().trim();
    const location = formData.get('location')?.toString().trim();
    const detail = formData.get('detail')?.toString().trim();
    const file = uploadInput.files[0];

    if (!title || !category || !location || !detail) {
      setStatus('Please complete every field before submitting.', 'error');
      return;
    }

    state.submissions.unshift({
      id: Date.now(),
      title,
      category,
      location,
      status: 'Pending',
      detail,
      updatedAt: 'Just now'
    });
    saveState();
    form.reset();
    preview.style.display = 'none';
    preview.src = '';
    setStatus('Report submitted successfully. It is now visible in live monitoring.', 'success');
    renderIssues();
    window.location.href = 'home.html';
  });
}

if (uploadInput) {
  uploadInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}

['dragover', 'dragleave'].forEach((eventName) => {
  dropzone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.toggle('drag-over', eventName === 'dragover');
  });
});

dropzone?.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('drag-over');
  uploadInput.files = event.dataTransfer.files;
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

showPage('home');
renderIssues();
