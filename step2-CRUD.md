# MyTodo — Step 2: 핵심 CRUD 기능 구현

> 전제: Step 1 완료 상태 (index.html / app.js / storage.js 존재)

app.js에 할 일 CRUD 기능을 구현해줘.

## 1. 할 일 추가 (addTask)
- 트리거: 추가 버튼 클릭 OR 텍스트 필드에서 Enter 키
- 입력 검증: 빈 문자열 또는 공백만 있으면 추가 차단 + 포커스 유지
- 신규 Task 객체 생성 후 state.tasks 앞에 unshift() (최신 항목이 상단)
- 추가 성공 시: 텍스트 필드 초기화, 카테고리 드롭다운은 마지막 선택값 유지
- saveTasks() 호출 → render() 호출

## 2. 완료 체크 토글 (toggleTask)
- 트리거: 체크박스 클릭
- 해당 id의 task.completed 값을 반전 (true ↔ false)
- 완료 상태 시각 처리: CSS class 'completed' 추가
  - text-decoration: line-through
  - opacity: 0.5
- saveTasks() 호출 → render() 호출

## 3. 할 일 삭제 (deleteTask)
- 트리거: 각 항목의 삭제 버튼 (🗑) 클릭
- state.tasks에서 해당 id 제거 (filter 사용)
- saveTasks() 호출 → render() 호출

## 렌더링 규칙 (renderTaskList)
- currentFilter에 맞는 tasks만 표시
  - '전체': 전체 항목
  - '업무' / '개인' / '공부': 해당 category만 필터
- 각 할 일 항목 HTML 구조:
  [체크박스] [카테고리 배지] [텍스트] [삭제 버튼]
- 항목이 0개일 때: "할 일이 없어요 ✓" 빈 상태 메시지 표시

## 반드시 지킬 것
- 모든 상태 변경 직후 saveTasks() 즉시 호출 (자동 저장)
- 새로고침 후에도 데이터가 유지되는지 확인
- 전역 변수 최소화, state 객체 중심으로 관리
