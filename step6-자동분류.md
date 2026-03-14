# MyTodo — Step 6: 키워드 기반 자동 카테고리 분류

> 전제: Step 5 완료 (다크 테마, 접근성, 반응형 완료)

할 일 입력 시 텍스트를 분석해 카테고리를 자동으로 선택하는 기능을 추가해줘.

## 1. 키워드 테이블 정의

`app.js` 상단에 카테고리별 키워드 테이블을 선언:

```javascript
const CATEGORY_KEYWORDS = {
  '업무': ['회의', '보고서', '기획', '발표', '미팅', '출장', '계약', '제안서', '업무', '프로젝트', '마감', '클라이언트', '거래처', '이메일', '슬랙', '일정', '인터뷰', '채용'],
  '개인': ['운동', '헬스', '쇼핑', '청소', '요리', '병원', '약속', '여행', '친구', '가족', '취미', '영화', '산책', '독서', '식사', '휴식', '집안일', '빨래', '장보기'],
  '공부': ['공부', '강의', '책', '과제', '시험', '복습', '예습', '학습', '연구', '논문', '자격증', '코딩', '개발', '언어', '수학', '영어', '강좌', '튜토리얼', '스터디'],
};
```

## 2. 감지 함수 (detectCategory)

입력 텍스트에서 카테고리를 자동 감지하는 함수:

```javascript
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
  return null; // 매칭 없음
}
```

반환값: `{ category: '업무', keyword: '회의' }` 또는 `null`

## 3. 상태 플래그 추가

`state` 객체에 수동 선택 잠금 플래그 추가:

```javascript
const state = {
  // 기존 필드들...
  manualCategory: false, // 사용자가 드롭다운을 직접 변경했는지 여부
};
```

## 4. 실시간 입력 감지

`task-input`의 `input` 이벤트에서 실시간으로 카테고리 자동 선택:

동작:
- 입력할 때마다 `detectCategory()` 호출
- 키워드 매칭 시 → 카테고리 드롭다운 자동 변경 + 힌트 텍스트 표시
- 매칭 없을 시 → 마지막 선택 카테고리(`state.lastCategory`)로 복원 + 힌트 숨김
- `state.manualCategory === true`이면 자동 분류 건너뜀

힌트 텍스트 형식: `"회의" → 업무 자동 선택`

## 5. 수동 선택 잠금

`category-select`의 `change` 이벤트:
- 사용자가 드롭다운을 직접 변경하면 `state.manualCategory = true` 설정
- 이후 입력 이벤트에서 자동 분류 비활성화
- `state.lastCategory`도 함께 업데이트

## 6. 잠금 해제

`addTask()` 실행 후(할 일 추가 완료 시):
- `state.manualCategory = false` 로 초기화
- 다음 입력부터 자동 분류 재활성화
- 힌트 텍스트 숨김

## 7. 힌트 UI

`index.html` 입력 영역 하단에 힌트 텍스트 요소 추가:

```html
<p id="category-hint" class="category-hint" aria-live="polite"></p>
```

CSS:
```css
.category-hint {
  display: none;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-primary);
}
```

- 자동 감지 시 `display: block`으로 표시
- `aria-live="polite"`: 스크린 리더에서 변경사항 음성 안내
