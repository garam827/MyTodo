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

// ===== 키워드 자동 카테고리 분류 =====

const CATEGORY_KEYWORDS = {
  '업무': ['회의', '보고서', '기획', '발표', '미팅', '출장', '계약', '제안서', '업무', '프로젝트', '마감', '클라이언트', '거래처', '이메일', '슬랙', '일정', '인터뷰', '채용'],
  '개인': ['운동', '헬스', '쇼핑', '청소', '요리', '병원', '약속', '여행', '친구', '가족', '취미', '영화', '산책', '독서', '식사', '휴식', '집안일', '빨래', '장보기'],
  '공부': ['공부', '강의', '책', '과제', '시험', '복습', '예습', '학습', '연구', '논문', '자격증', '코딩', '개발', '언어', '수학', '영어', '강좌', '튜토리얼', '스터디'],
};

// 입력 텍스트에서 카테고리 자동 감지 (매칭된 키워드 반환, 없으면 null)
function detectCategory(text) {
  var lower = text.toLowerCase();
  for (var cat in CATEGORY_KEYWORDS) {
    var keywords = CATEGORY_KEYWORDS[cat];
    for (var i = 0; i < keywords.length; i++) {
      if (lower.includes(keywords[i])) {
        return { category: cat, keyword: keywords[i] };
      }
    }
  }
  return null;
}

// ===== 상태 =====

const state = {
  tasks: [],
  currentFilter: '전체',
  lastCategory: '업무',
  editingId: null,       // 현재 인라인 편집 중인 task id
  manualCategory: false, // 사용자가 수동으로 카테고리를 선택했는지 여부
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
  document.getElementById('progress-summary').textContent = completed + ' / ' + total + ' 완료  (' + pct + '%)';

  const cats = ['업무', '개인', '공부'];
  const container = document.getElementById('progress-category');
  container.innerHTML = '';
  cats.forEach(function (cat) {
    const catTotal = state.tasks.filter(t => t.category === cat).length;
    const catDone  = state.tasks.filter(t => t.category === cat && t.completed).length;
    const div = document.createElement('div');
    div.className = 'cat-stat';
    div.innerHTML =
      '<span class="cat-stat-label">' + cat + '</span>' +
      '<span class="cat-stat-value">' + catDone + ' / ' + catTotal + '</span>';
    container.appendChild(div);
  });
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

    const badge = document.createElement('span');
    badge.className = 'tab-badge';
    badge.textContent = count;
    btn.appendChild(badge);

    btn.addEventListener('click', function () {
      state.currentFilter = filter;
      // 메인 상단 필터 레이블 업데이트
      var labelEl = document.getElementById('filter-label');
      if (labelEl) labelEl.textContent = '· ' + filter;
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

      setTimeout(function () {
        editInput.focus();
        editInput.select();
      }, 0);

      editInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')  saveEdit(task.id, editInput.value);
        if (e.key === 'Escape') cancelEdit();
      });

      editInput.addEventListener('blur', function () {
        saveEdit(task.id, editInput.value);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.setAttribute('aria-label', '삭제');
      delBtn.textContent = '🗑';
      delBtn.style.opacity = '0.6';
      delBtn.addEventListener('click', function () { deleteTask(task.id); });

      li.append(checkbox, badge, editInput, delBtn);
    } else {
      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;
      text.title = task.text; // 호버 시 전체 텍스트 툴팁

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
  state.manualCategory = false;
  document.getElementById('category-hint').style.display = 'none';
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

  // 실시간 키워드 감지 → 카테고리 자동 선택
  document.getElementById('task-input').addEventListener('input', function () {
    if (state.manualCategory) return;
    var result = detectCategory(this.value);
    var select = document.getElementById('category-select');
    var hint = document.getElementById('category-hint');
    if (result) {
      select.value = result.category;
      hint.textContent = '"' + result.keyword + '" → ' + result.category + ' 자동 선택';
      hint.style.display = 'block';
    } else {
      select.value = state.lastCategory;
      hint.style.display = 'none';
    }
  });

  document.getElementById('btn-clear').addEventListener('click', clearCompleted);

  // 수동 카테고리 변경 시 자동 분류 잠금
  document.getElementById('category-select').addEventListener('change', function () {
    state.lastCategory = this.value;
    state.manualCategory = true;
    document.getElementById('category-hint').style.display = 'none';
  });

  // 다크 테마 토글
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  // 필터 탭 좌우 화살표 키 전환
  document.querySelector('.filter-tabs').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var idx = FILTERS.indexOf(state.currentFilter);
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  idx = (idx - 1 + FILTERS.length) % FILTERS.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') idx = (idx + 1) % FILTERS.length;
    state.currentFilter = FILTERS[idx];
    var labelEl = document.getElementById('filter-label');
    if (labelEl) labelEl.textContent = '· ' + FILTERS[idx];
    render();
    var activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) activeBtn.focus();
  });

  render();
});
