# Design System: Project Tika (Kanban Interface)

이 문서는 Linear와 Trello의 사용성을 벤치마킹하여 제작된 Tika 프로젝트의 디자인 가이드라인입니다.

---

## 1. Design Philosophy
- **Minimalism:** 불필요한 장식을 배제하고 데이터(Task) 중심의 UI 구성 (Linear 스타일).
- **Spatial Awareness:** 보드와 카드 간의 명확한 레이어 분리 (Trello 스타일).
- **Immediate Feedback:** 중요도 및 상태 변화를 컬러 배지로 즉각 인지.

## 2. Layout Structure
- **Global Header:** 검색창과 '새 업무' 버튼이 위치한 최상단 고정 영역.
- **Side Inventory (Backlog):** 왼쪽 272px 고정 영역. 미배정 업무 리스트.
- **Main Board:** 3칼럼 칸반 보드 영역 (TODO / In Progress / Done).

## 3. Typography
- **Primary Font:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **제목 (카드 타이틀, 칼럼 헤더):** 14px / Bold / Gray-900
- **내용 (설명, 입력 필드, 메타 정보):** 12px / Regular / Gray-600
- **라벨 (폼 라벨):** 12px / Semi-bold / Gray-600
- **배지:** 11px / Semi-bold

## 4. Column Colors (Swimlane)

각 칼럼은 고유한 파스텔 배경색으로 시각적 구분을 제공하며, 1px 구분선으로 영역을 명확히 한다.

| 칼럼 | 배경색 | 액센트 | 용도 |
|------|--------|--------|------|
| Backlog | `#F0EDFA` (라벤더) | `#8B7EC8` | 미배정 업무 |
| TODO | `#FFF8E1` (옐로) | `#F59E0B` | 할 일 |
| In Progress | `#E8F4FD` (블루) | `#3B82F6` | 진행 중 |
| Done | `#E8F5E9` (그린) | `#22C55E` | 완료 |

## 5. Components

### Task Card
- **Background:** White (#FFFFFF)
- **Border:** 1px solid Gray-200
- **Radius:** 8px
- **Shadow:** `0 1px 2px rgba(0,0,0,0.08)` idle, `0 4px 8px rgba(0,0,0,0.12)` hover
- **Padding:** 12px

### Badges (Priority)
- **High:** Red-100 BG / Red-800 Text
- **Medium:** Blue-100 BG / Blue-800 Text
- **Low:** Gray-100 BG / Gray-700 Text

### Input Fields
- **Font size:** 12px
- **Padding:** 8px 12px
- **Border:** 1px solid `#E2E8F0`
- **Border-radius:** 6px
- **Focus:** `border-color: #3B82F6` + `box-shadow: 0 0 0 3px rgba(59,130,246,0.15)`

## 6. Interaction
- **Card Hover:** shadow 증가 + 커서 `grab`
- **Card Dragging:** opacity 0.5, overlay에 `rotate(3deg)` + 강한 shadow
- **Search Bar:** Focus 시 ring 효과
- **Buttons:** Primary Hover 시 어두운 톤

---
*Created for Tika Project Board UI*
