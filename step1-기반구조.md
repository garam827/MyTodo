# MyTodo — Step 1: 프로젝트 초기화 및 HTML 골격 구성

MyTodo 앱의 프로젝트 기반을 만들어줘.

## 요구사항
- 파일 구성: index.html / app.js / storage.js (3파일 분리)
- 외부 라이브러리 금지 — 순수 HTML, CSS, JavaScript만 사용
- 브라우저에서 index.html 파일을 직접 열어서 실행 가능해야 함

## index.html 레이아웃 (6개 영역, 위→아래 순서)
1. 헤더: 앱 타이틀 "MyTodo" + 오늘 날짜
2. 진행률 카드: 전체 완료율 프로그레스바 + 카테고리별 요약 텍스트
3. 입력 영역: 텍스트 필드 + 카테고리 드롭다운 + 추가 버튼
4. 필터 탭: 전체 / 업무 / 개인 / 공부
5. 할 일 목록: 빈 상태 메시지 포함
6. 하단 액션: "완료된 항목 삭제" 버튼 + 완료/미완료 통계

## CSS 설계 원칙
- CSS 변수로 색상 시스템 정의 (카테고리 3색 + 기본 팔레트)
  - 업무: 파란색 계열 (--cat-work-bg, --cat-work-text)
  - 개인: 초록색 계열 (--cat-personal-bg, --cat-personal-text)
  - 공부: 보라색 계열 (--cat-study-bg, --cat-study-text)
- 최소 너비 320px에서 정상 동작하는 반응형 레이아웃
- 깔끔하고 현대적인 UI (카드형 디자인, 적절한 여백)

## storage.js 구현
localStorage 키: 'mytodo_tasks'

Task 객체 스키마:
```
{
  id: string,        // Date.now() + Math.random()으로 생성
  text: string,      // 할 일 내용
  category: string,  // '업무' | '개인' | '공부'
  completed: boolean,
  createdAt: number  // 타임스탬프 (ms)
}
```

export할 함수:
- loadTasks()         → localStorage에서 tasks 배열 반환
- saveTasks(tasks)    → tasks 배열을 localStorage에 저장
- generateId()        → 고유 id 문자열 생성

## app.js 초기 구조
- DOMContentLoaded 이벤트로 앱 초기화
- state 객체: { tasks: [], currentFilter: '전체' }
- loadTasks()로 초기 데이터 로드 후 render() 호출
- render() 함수: state를 기반으로 전체 UI를 다시 그림
