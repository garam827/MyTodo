// ===== storage (localStorage 유틸) =====

const STORAGE_KEY = 'mytodo_tasks';

function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ===== 상태 =====

const state = {
  tasks: [],
  currentFilter: '전체',
  lastCategory: '업무',
  editingId: null,  // 현재 인라인 편집 중인 task id
};

const FILTERS = ['전체', '업무', '개인', '공부'];

// ===== 렌더링 =====

function render() {
  renderProgress();
  renderFilterTabs();
  renderTaskList();
  renderFooter();
}

// 진행률 프로그레스바 및 카테고리별 요약 업데이트
function renderProgress() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round(completed / total * 100);

  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-summary').textContent = completed + ' / ' + total + ' 완료';

  const cats = ['업무', '개인', '공부'];
  const catText = cats.map(cat => {
    const catTotal = state.tasks.filter(t => t.category === cat).length;
    const catDone  = state.tasks.filter(t => t.category === cat && t.completed).length;
    return cat + ' ' + catDone + '/' + catTotal;
  }).join('  ');
  document.getElementById('progress-category').textContent = catText;
}

function renderFilterTabs() {
  const nav = document.querySelector('.filter-tabs');
  nav.innerHTML = '';

  FILTERS.forEach(function (filter) {
    const count = filter === '전체'
      ? state.tasks.filter(t => !t.completed).length
      : state.tasks.filter(t => t.category === filter && !t.completed).length;

    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (state.currentFilter === filter ? ' active' : '');
    btn.dataset.filter = filter;
    btn.textContent = filter;

    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'tab-badge';
      badge.textContent = count;
      btn.appendChild(badge);
    }

    btn.addEventListener('click', function () {
      state.currentFilter = filter;
      render();
    });

    nav.appendChild(btn);
  });
}

function renderTaskList() {
  const list = document.getElementById('task-list');
  const filtered = state.currentFilter === '전체'
    ? state.tasks
    : state.tasks.filter(t => t.category === state.currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-message">할 일이 없어요 ✓</li>';
    return;
  }

  list.innerHTML = '';
  filtered.forEach(function (task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function () { toggleTask(task.id); });

    const badge = document.createElement('span');
    badge.className = 'badge badge-' + task.category;
    badge.textContent = task.category;

    // 인라인 편집 모드 vs 일반 표시 모드
    if (state.editingId === task.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'task-edit-input';
      editInput.value = task.text;

      // 포커스 및 전체 선택
      setTimeout(function () {
        editInput.focus();
        editInput.select();
      }, 0);

      // Enter: 저장 / Escape: 취소
      editInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')  saveEdit(task.id, editInput.value);
        if (e.key === 'Escape') cancelEdit();
      });

      // blur: 저장
      editInput.addEventListener('blur', function () {
        saveEdit(task.id, editInput.value);
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-delete';
      editBtn.setAttribute('aria-label', '삭제');
      editBtn.textContent = '🗑';
      editBtn.addEventListener('click', function () { deleteTask(task.id); });

      li.append(checkbox, badge, editInput, editBtn);
    } else {
      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      // 더블클릭으로 편집 모드 진입
      text.addEventListener('dblclick', function () { startEdit(task.id); });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.setAttribute('aria-label', '편집');
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', function () { startEdit(task.id); });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.setAttribute('aria-label', '삭제');
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', function () { deleteTask(task.id); });

      li.append(checkbox, badge, text, editBtn, delBtn);
    }

    list.appendChild(li);
  });
}

function renderFooter() {
  const completed = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;

  document.getElementById('stats-text').textContent =
    '완료 ' + completed + '개 · 미완료 ' + (total - completed) + '개';

  const clearBtn = document.getElementById('btn-clear');
  clearBtn.disabled = completed === 0;
}

// ===== 인라인 편집 =====

function startEdit(id) {
  state.editingId = id;
  render();
}

function saveEdit(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    // 빈 값이면 저장 차단, 원본 유지
    cancelEdit();
    return;
  }
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.text = trimmed;
    saveTasks(state.tasks);
  }
  state.editingId = null;
  render();
}

function cancelEdit() {
  state.editingId = null;
  render();
}

// ===== CRUD =====

function addTask() {
  const input = document.getElementById('task-input');
  const select = document.getElementById('category-select');
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  const task = {
    id: generateId(),
    text: text,
    category: select.value,
    completed: false,
    createdAt: Date.now(),
  };

  state.lastCategory = select.value;
  state.tasks.unshift(task);
  saveTasks(state.tasks);

  input.value = '';
  select.value = state.lastCategory;
  input.focus();
  render();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(state.tasks);
    render();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks(state.tasks);
  render();
}

function clearCompleted() {
  state.tasks = state.tasks.filter(t => !t.completed);
  saveTasks(state.tasks);
  render();
}

// ===== 다크 테마 =====

function initTheme() {
  // 저장된 테마 우선, 없으면 시스템 설정 따름
  var saved = localStorage.getItem('mytodo_theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = saved ? saved === 'dark' : prefersDark;
  applyTheme(isDark);
}

function applyTheme(isDark) {
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  var btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  var isDark = document.body.dataset.theme === 'dark';
  var next = !isDark;
  applyTheme(next);
  localStorage.setItem('mytodo_theme', next ? 'dark' : 'light');
}

// ===== 이벤트 바인딩 =====

document.addEventListener('DOMContentLoaded', function () {
  state.tasks = loadTasks();
  initTheme();

  // 오늘 날짜 표시
  var dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });
  }

  document.getElementById('btn-add').addEventListener('click', addTask);

  document.getElementById('task-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });

  document.getElementById('btn-clear').addEventListener('click', clearCompleted);

  document.getElementById('category-select').addEventListener('change', function () {
    state.lastCategory = this.value;
  });

  // 다크 테마 토글
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  // 필터 탭 좌우 화살표 키 전환
  document.querySelector('.filter-tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var idx = FILTERS.indexOf(state.currentFilter);
    if (e.key === 'ArrowLeft')  idx = (idx - 1 + FILTERS.length) % FILTERS.length;
    if (e.key === 'ArrowRight') idx = (idx + 1) % FILTERS.length;
    state.currentFilter = FILTERS[idx];
    render();
    // 새로 렌더된 탭 중 active 버튼에 포커스
    var activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) activeBtn.focus();
  });

  render();
});
