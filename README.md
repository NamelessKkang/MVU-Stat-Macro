# MVU-Stat-Macro

[English](#english) | [한국어](#korean) | [Development Notes (개발 노트)](#development-notes)

---

<a name="english"></a>
## English

A SillyTavern extension that provides the `{{get_mvu_stat}}` macro.
This macro is designed to retrieve variables (specifically `stat_data`) stored within the `JS-Slash-Runner` extension's variable system, making them accessible for use in prompt templates, quick replies, and other macro-supported areas.

### Key Features

- **Latest Data Access**: Automatically scans the most recent chat history (default: last 10 messages) to find the latest variable value.
- **Swipe-Aware**: Correctly reads variables from the *currently selected swipe* (`swipe_id`) of a message, not just the first one.
- **Nested Macro Support**: Fully compatible with SillyTavern's Macro Engine 2.0. Works inside `{{if}}` conditions (e.g., `{{if {{get_mvu_stat::var}} > 10}}...{{/if}}`).
- **Deep Property Access**: Supports **Dot Notation** for nested variables (e.g., `Character.Stats.HP`).
- **Data Compatibility**: Supports both 'Legacy' (Array `[value, description]`) and 'New' (Direct Value) variable formats.
- **Targeting**: Can optionally target specific messages by index.

### Usage

#### Basic Usage (Auto-Scan)
Retrieves the most recent value of the variable from the last 10 messages.
```
{{get_mvu_stat::variable_name}}
```
*Example:* `{{get_mvu_stat::affection}}`

#### Deep Nesting & Arrays (Dot Notation)
Access specific properties inside complex objects or arrays of any depth.
```
{{get_mvu_stat::Lian.Equipment.Weapons.0.Name}}
```
*Example:* retrieves the 'Name' of the first weapon in the equipment list.

#### Nested into Logic (If/Else)
Perfect for conditional prompts based on stats.
```
{{if {{get_mvu_stat::affection}} > 50}}
    User is loved.
{{else}}
    User is indifferent.
{{/if}}
```

#### Advanced: Specific Message Targeting
You can target a specific message by its index.
- `0`: First message.
- `-1`: Last (newest) message.
- `-2`: Second to last message.

```
{{get_mvu_stat::variable_name::message_index}}
```
*Example:* `{{get_mvu_stat::summary::-1}}` (Get 'summary' from the very last message only)

---

<a name="korean"></a>
## 한국어 (Korean)

SillyTavern용 `{{get_mvu_stat}}` 매크로를 제공하는 확장 기능입니다.
이 매크로는 `JS-Slash-Runner` 확장이 관리하는 변수 시스템(특히 `stat_data`)에서 값을 가져와 프롬프트 템플릿, 빠른 응답, 기타 매크로 지원 영역에서 사용할 수 있게 해줍니다.

### 주요 기능

- **최신 데이터 접근**: 최근 채팅 기록(기본값: 마지막 10개)을 자동으로 스캔하여 가장 최신 변수 값을 찾습니다. 무거운 스캔을 방지하기 위해 깊이 제한이 있습니다.
- **스와이프 인식 (Swipe-Aware)**: 단순히 첫 번째 메시지가 아니라, 사용자가 현재 보고 있는 **선택된 스와이프 (`swipe_id`)**에 저장된 변수를 정확하게 읽어옵니다.
- **중첩 매크로 지원**: SillyTavern의 Macro Engine 2.0과 완벽하게 호환됩니다. `{{if}}` 조건문 내부에서도 정상 작동합니다. (예: `{{if {{get_mvu_stat::var}} > 10}}...{{/if}}`)
- **깊은 속성 접근 (점 표기법)**: 중첩된 객체 변수도 **점(.)**으로 구분하여 접근할 수 있습니다. (예: `Lian.Moral`)
- **데이터 호환성**: '구형' (배열 `[값, 설명]`) 및 '신형' (값 직접 저장) 형식을 모두 지원합니다.
- **특정 메시지 지정**: 인덱스를 통해 특정 위치의 메시지를 콕 집어 값을 가져올 수 있습니다.

### 사용법

#### 기본 사용법 (자동 스캔)
최근 10개의 메시지 중에서 가장 최신 값을 가져옵니다.
```
{{get_mvu_stat::변수명}}
```
*예시:* `{{get_mvu_stat::affection}}` (호감도 변수 가져오기)

#### 중첩 변수 및 배열 (Deep Nesting & Arrays)
복잡한 객체 구조나 배열 내부의 값도 **점(.)**으로 구분하여 제한 없이 접근할 수 있습니다.
```
{{get_mvu_stat::리안.장비.무기.0.이름}}
```
*예시:* `리안` > `장비` > `무기` 배열의 `첫 번째` 아이템 > `이름`

#### 논리 연산 중첩 (If/Else)
스탯에 따라 프롬프트 내용을 다르게 할 때 유용합니다.
```
{{if {{get_mvu_stat::affection}} > 50}}
    사용자는 사랑받고 있습니다.
{{else}}
    사용자는 무관심의 대상입니다.
{{/if}}
```

#### 고급: 특정 메시지 타게팅
메시지 인덱스를 지정하여 특정 메시지의 값만 가져올 수 있습니다.
- `0`: 첫 번째 메시지
- `-1`: 마지막 (가장 최신) 메시지
- `-2`: 뒤에서 두 번째 메시지

```
{{get_mvu_stat::변수명::메시지인덱스}}
```
*예시:* `{{get_mvu_stat::summary::-1}}` (가장 최근 메시지의 summary 변수만 가져오기)

---

<a name="development-notes"></a>
## Development Notes (분석 보고서)

이 확장을 개발하기 위해 분석한 SillyTavern 내부 구조와 데이터 로직에 대한 상세 기록입니다. 추후 유지보수 시 이 내용을 참고하십시오.

### 1. Macro Engine 2.0 분석 및 중첩 문제 해결

#### 문제 상황
- `JS-Slash-Runner` 자체 매크로는 `{{if}}` 문 내부에서 작동하지 않거나 값이 누락되는 문제가 있었습니다.
- 이는 SillyTavern의 **Macro Engine 2.0**이 중첩된 매크로를 처리하는 방식 때문입니다.

#### 분석 (Source Code Analysis)
- **파일**: `public/scripts/macros/definitions/core-macros.js` (`{{if}}` 구현부)
- **파일**: `public/scripts/macros/engine/MacroRegistry.js` (레지스트리)
- **파일**: `public/scripts/macros/engine/MacroEngine.js` (실행기)

**작동 원리**:
1. `{{if}}` 매크로는 `delayArgResolution: true` 옵션으로 등록되어 있습니다. 이는 인자를 즉시 해석하지 않고 원본 문자열 그대로(`raw`) 받겠다는 의미입니다.
2. `{{if}}` 핸들러 내부에서 `resolve(condition)` 함수를 직접 호출하여 조건문을 평가합니다.
3. 이때 `resolve()` (즉, `MacroEngine.evaluate`)는 **`MacroRegistry`에 공식적으로 등록된 매크로**만을 재귀적으로 탐색하여 실행합니다.
4. 기존 방식(단순 정규식 치환 `String.replace`)으로 만들어진 매크로는 이 레지스트리에 없으므로, `resolve()` 과정에서 무시되거나 문자열 그대로 반환되어 조건문이 오작동하게 됩니다.

#### 해결책
- 반드시 `SillyTavern.getContext().macros.register`를 사용하여 매크로를 공식 레지스트리에 등록해야 합니다.
- 이렇게 하면 `{{if}}` 내부에서 `resolve()`가 호출될 때 우리 매크로를 인식하고 값을 올바르게 변환합니다.

### 2. JS-Slash-Runner 데이터 구조 분석

#### 저장 위치
- 변수는 SillyTavern의 채팅 기록 객체인 `chat` 배열 내 각 메시지에 저장됩니다.
- **경로**: `msg.variables`

#### 구조적 특징 (Swipe Handling)
- 각 메시지는 여러 번 재생성(Swipe)될 수 있으므로, 변수도 스와이프별로 따로 저장됩니다.
- `msg.variables`는 **배열(Array)** 형태입니다.
- 올바른 값을 찾기 위해서는 반드시 **`msg.swipe_id`**를 참조하여 해당 인덱스의 변수를 조회해야 합니다.

```javascript
// 올바른 접근 방식
const currentSwipeIndex = msg.swipe_id ?? 0;
const currentVariables = msg.variables[currentSwipeIndex];
const statData = currentVariables.stat_data;
```

#### 데이터 포맷 호환성 (Legacy vs New)
- **구형 (Legacy)**: 값이 `[값, "설명"]` 형태의 배열로 저장됨.
- **신형 (New - Zod 기반)**: 값이 `값` 그대로 저장됨.
- **대응**: 본 확장은 `Array.isArray()` 체크를 통해 두 형식을 모두 지원하도록 구현되었습니다.

### 3. 중첩 변수(Deep Property) 지원 로직

- 사용자가 `리안.도덕성`과 같은 점 표기법(Dot Notation)을 요청했습니다.
- 이를 지원하기 위해 `resolvePropertyPath(obj, path)` 헬퍼 함수를 구현했습니다.
- 이 함수는 `.`을 기준으로 문자열을 쪼개어(split), 객체 내부를 순차적으로 탐색합니다.
- 탐색 중 해당 키가 없으면 `undefined`를 반환하고, 최종 값을 찾으면 해당 값을 반환합니다. 이 값 역시 Legacy 포맷인지 검사하여 처리됩니다.

### 4. 확장 프로그램 구조 (SillyTavern Extension API)

#### index.js
- `import { getContext } from "../../../extensions.js";` 경로를 사용하여 컨텍스트를 가져옵니다.
- jQuery `$(async () => { ... })` 훅을 사용하여 SillyTavern 로드 시점에 매크로를 등록합니다.

#### manifest.json
- `display_name`과 `loading_order` 필드가 없으면 확장 관리자 목록에 뜨지 않을 수 있으므로 반드시 포함해야 합니다.

