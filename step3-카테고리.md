# MyTodo — Step 3: 카테고리 분류 및 필터 탭

> 전제: Step 2 완료 (기본 CRUD 동작 확인됨)

카테고리 분류와 필터 탭 기능을 완성해줘.

## 카테고리 색상 시스템
Step 1에서 정의한 CSS 변수를 활용해 배지를 스타일링:
- 업무: --cat-work-bg (배경) / --cat-work-text (텍스트)
- 개인: --cat-personal-bg / --cat-personal-text
- 공부: --cat-study-bg / --cat-study-text

각 할 일 항목에 pill 형태의 카테고리 배지 표시:
```html
<span class="badge badge-업무">업무</span>
```

## 필터 탭 구현
탭 목록: ['전체', '업무', '개인', '공부']

탭 클릭 시 동작:
1. state.currentFilter를 클릭한 탭 값으로 업데이트
2. 활성 탭에 'active' CSS 클래스 추가 (비활성 탭에서 제거)
3. renderTaskList() 호출 (필터 적용된 목록 다시 렌더)

## 탭 배지 (미완료 수 표시)
- 각 탭 옆에 해당 카테고리의 미완료(completed === false) 개수 표시
- 개수가 0이면 배지 숨김 (display: none)
- 예시: "업무 3" (미완료 3개인 경우)
- '전체' 탭은 전체 미완료 수 표시

## renderFilterTabs() 함수
- 탭별 미완료 수를 실시간 계산하여 배지 업데이트
- render() 함수 내부에서 renderFilterTabs() 호출

## 드롭다운 동기화
- 추가 입력 영역의 카테고리 드롭다운도 동일한 3가지 옵션
- state.lastCategory로 마지막 선택 카테고리 기억
- 기본값: '업무'
- 다음 추가 시 마지막 선택값 자동 유지
