# MyTodo — Step 4: 진행률 표시 및 UX 개선

> 전제: Step 3 완료 (카테고리 필터 동작 확인됨)

진행률 표시와 UX 개선 기능을 추가해줘.

## 1. 진행률 프로그레스바 (renderProgress)

프로그레스바:
- 완료 수 / 전체 수 비율로 너비 계산 → CSS width: N%
- 애니메이션: transition: width 0.3s ease
- 전체 항목이 0개일 때: 0% 상태 표시

텍스트 요약:
- 전체 현황: "3 / 7 완료" 형태
- 카테고리별 현황: "업무 2/5  개인 1/3  공부 0/2" 형태

render() 함수 안에서 renderProgress() 호출.

## 2. 인라인 편집 (editTask)

편집 모드 진입 (더블클릭 OR ✏️ 버튼 클릭):
- 텍스트를 `<input type="text">`로 교체
- 기존 텍스트 값을 input에 채운 후 포커스 + 전체 선택 (select())
- 한 번에 하나의 항목만 편집 가능 (state.editingId로 관리)

저장 (Enter 키 또는 input blur):
- 빈 문자열이면 저장 차단 (원본 텍스트 유지)
- 저장 성공 시 saveTasks() → render() 호출

취소 (Escape 키):
- 원본 텍스트 유지하고 뷰 모드로 복귀

## 3. 완료 항목 일괄 삭제

하단 "완료된 항목 삭제" 버튼:
- 클릭 시 completed === true인 task 전부 제거
- 완료 항목이 없으면 버튼 disabled 처리
- 삭제 후 saveTasks() → render() 호출

하단 통계 텍스트:
- "완료 3개 · 미완료 4개" 형태
- render() 시 실시간 업데이트
