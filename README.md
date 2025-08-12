# my-expo-app

Expo + React Native + NativeWind 기반 앱으로, 하단 탭 5개와 상단 헤더가 있는 기본 레이아웃을 포함합니다.

## 스택

- Expo 53 / React Native 0.79 / React 19
- NativeWind + TailwindCSS
- React Navigation (Bottom Tabs + Native Stack)

## 폴더 구조

```
my-expo-app/
├─ App.tsx                 # 네비게이션 진입점
├─ navigation/
│  └─ RootNavigator.tsx    # Stack + BottomTab 레이아웃
├─ screens/                # 5개 탭 화면 + 상세
│  ├─ HomeScreen.tsx
│  ├─ SearchScreen.tsx
│  ├─ BoosterScreen.tsx
│  ├─ NotificationsScreen.tsx
│  ├─ BalanceScreen.tsx
│  └─ HomeDetailScreen.tsx
├─ components/             # 공용 컴포넌트
│  ├─ Container.tsx
│  ├─ EditScreenInfo.tsx
│  ├─ ScreenContent.tsx
│  └─ ui/                 # 테마 기반 UI 컴포넌트
│     ├─ Button.tsx
│     ├─ Card.tsx
│     └─ Heading.tsx
│
├─ components/items/       # 리스트 아이템 컴포넌트
│  └─ CurrentPriceItem.tsx
├─ assets/                 # 앱 아이콘/스플래시 등
│  ├─ icon.png, splash.png, ...
│  └─ images/.keep         # 이미지 폴더(필요 시 사용)
├─ global.css              # NativeWind 스타일 엔트리
├─ tailwind.config.js      # Tailwind 스캔 경로(App/components/screens/navigation)
├─ babel.config.js         # babel-preset-expo + nativewind/babel
└─ app.json                # Expo 설정
```

## 설치 및 실행

PowerShell 기준:

```powershell
# 의존성 설치
npm install

# (선택) iOS/Android/Web 중 하나로 실행
npm start
# 또는
npm run android
npm run ios
npm run web
```

## 네비게이션 구성

- Bottom Tabs 5개(좌→우): `Home`, `Balance(잔고)`, `Booster(부스터)`, `Notifications(알림)`, `Search("테스트")`
- 각 탭은 `screens/`에 대응되는 화면 컴포넌트를 가집니다.
- 상단 헤더는 Native Stack을 사용해 확장 가능하며, 현재 `RootNavigator`에서 Tab을 감싸고 있습니다.

- 변경 사항
  - 검색 탭 → "테스트"로 라벨 변경
  - 잔고 탭과 검색 탭의 위치 교체
  - 잔고 탭 아이콘: `wallet-outline`

### 홈 상세 화면 이동
- `HomeScreen`에 "상세 보기" 버튼을 추가하여 `HomeDetail` 스택 화면으로 이동합니다.
- 스택 네비게이터에 `HomeDetail`을 등록하여 상단 헤더의 기본 뒤로가기 버튼이 표시됩니다.

아이콘/라벨 변경은 `navigation/RootNavigator.tsx`의 `Tab.Screen` 및 `screenOptions` 영역에서 가능합니다.

## 스타일(NativeWind + Tailwind)

- `babel.config.js`
  - `presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']`
- `tailwind.config.js`
  - `content`에 `./App.{js,ts,tsx}`, `./components/**/*`, `./screens/**/*`, `./navigation/**/*` 추가
- 전역 스타일 엔트리: `global.css`

## 스크린 추가 방법

1. `screens/NewScreen.tsx` 생성
2. `RootNavigator.tsx`의 `Tab.Navigator`에 `Tab.Screen` 추가
3. 필요하면 Stack Screen을 추가해 상세 화면/모달 화면 등으로 확장

## 자주 쓰는 커맨드

```powershell
# 포맷/린트
npm run format
npm run lint

# 캐시 초기화 실행
npx expo start -c
```

## 변경 요약

- React Navigation 및 탭 5개 도입
- 각 탭 화면 생성 및 연결
- Tailwind 스캔 경로 확장, NativeWind 설정 유지
- 에셋 폴더 보강(`assets/images`)
- 공용 UI 컴포넌트 추가: `components/ui/{Button,Card,Heading}`
- 검색 탭 라벨을 "테스트"로 변경하고, 테마 컴포넌트 미리보기 추가
- 잔고/검색 탭 위치 교체, 잔고 아이콘을 `wallet-outline`으로 변경

## 공용 UI 컴포넌트 사용 예

검색 탭(테스트)에서 아래 컴포넌트를 미리볼 수 있습니다.

```tsx
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { Heading } from 'components/ui/Heading';

// 예시
<Card className="mt-6 w-4/5 items-center">
  <Heading level={2}>Card 타이틀</Heading>
  <Button className="mt-4 self-stretch" title="Primary 버튼" />
  <Button className="mt-2 self-stretch" title="Secondary 버튼" variant="secondary" />
  <Button className="mt-2 self-stretch" title="위험 버튼" variant="destructive" />
  <Button className="mt-2 self-stretch" title="Ghost 버튼" variant="ghost" />
  {/* 텍스트는 text-foreground 등 토큰 유틸 사용 */}
  {/* 배경은 bg-background, 카드 bg-card, 버튼 bg-primary 등 */}
  {/* 라운딩은 rounded-app (tailwind.config.js의 borderRadius.app) */}
  {/* 다크모드는 루트에 class="dark" 토글로 적용 가능 */}
  {/* NativeWind 유틸을 사용하므로 클래스는 className에 입력 */}
</Card>
```

## 섹션/아이템 컴포넌트

- Section: 제목 + 리스트를 담는 컨테이너(카드 스타일), 아이템 간 구분선 자동 처리, 헤더 우측 액션(`headerRight`) 지원
- CurrentPriceItem: 순위/이름/가격/등락률 등 간단한 현재가 표시용 아이템

검색 탭(“테스트”)에 예시가 추가되어 있습니다.

```tsx
import { Section } from 'components/ui/Section';
import { CurrentPriceItem } from 'components/items/CurrentPriceItem';

<Section title="실시간 거래대금 차트" headerRight={<Text className="text-primary">다른 차트 더 보기 ›</Text>}>
  <CurrentPriceItem rank={1} name="두산에너빌리티" price="69,800원" change="+5.1%" changePositive />
  <CurrentPriceItem rank={2} name="NAVER" price="225,000원" change="-1.9%" />
  <CurrentPriceItem rank={3} name="이브이첨단소재" price="2,630원" change="+17.4%" changePositive />
</Section>

<Section title="맞춤형 서비스">
  <CurrentPriceItem name="출석체크하고 주식받기" price="리워드" change="" changePositive />
  <CurrentPriceItem name="오늘의 미션 확인하기" price="미션" change="" changePositive />
  <CurrentPriceItem name="지금 핫한 주제별 커뮤니티" price="커뮤니티" change="" changePositive />
  <CurrentPriceItem name="증권 계좌에 돈 채우기" price="입금" change="" changePositive />
</Section>
```

필요한 커스터마이징(테마 색상, 탭 중앙 플로팅 버튼, 헤더 액션 등) 요청 주시면 반영하겠습니다.

## Design Theme (Toss Invest inspired)

참고: 이 환경에서는 Playwright MCP로의 전체 브라우징은 직접 실행하지 않습니다. 공개 페이지를 기반으로 톤/무드를 참고해 테마 토큰을 추출·정리한 것이며, 정확한 색상은 디자이너 확인 또는 컬러 피커로 보정하는 것을 권장합니다.

### Theme tokens (JSON)

```json
{
  "radius": 10,
  "light": {
    "background": "#ffffff",
    "foreground": "#0f172a",
    "card": "#ffffff",
    "cardForeground": "#0f172a",
    "popover": "#ffffff",
    "popoverForeground": "#0f172a",
    "primary": "#3182f6",
    "primaryForeground": "#ffffff",
    "secondary": "#f3f4f6",
    "secondaryForeground": "#0f172a",
    "muted": "#f5f5f5",
    "mutedForeground": "#64748b",
    "accent": "#f3f4f6",
    "accentForeground": "#0f172a",
    "destructive": "#ef4444",
    "border": "#e5e7eb",
    "input": "#e5e7eb",
    "ring": "#93c5fd",
    "chart1": "#2563eb",
    "chart2": "#06b6d4",
    "chart3": "#7c3aed",
    "chart4": "#22c55e",
    "chart5": "#f59e0b",
    "sidebar": "#f8fafc",
    "sidebarForeground": "#0f172a",
    "sidebarPrimary": "#3182f6",
    "sidebarPrimaryForeground": "#ffffff",
    "sidebarAccent": "#eef2f7",
    "sidebarAccentForeground": "#0f172a",
    "sidebarBorder": "#e5e7eb",
    "sidebarRing": "#93c5fd"
  },
  "dark": {
    "background": "#0f172a",
    "foreground": "#f8fafc",
    "card": "#111827",
    "cardForeground": "#f8fafc",
    "popover": "#111827",
    "popoverForeground": "#f8fafc",
    "primary": "#60a5fa",
    "primaryForeground": "#0b1220",
    "secondary": "#1f2937",
    "secondaryForeground": "#f8fafc",
    "muted": "#1f2937",
    "mutedForeground": "#94a3b8",
    "accent": "#1f2937",
    "accentForeground": "#f8fafc",
    "destructive": "#f87171",
    "border": "rgba(255,255,255,0.10)",
    "input": "rgba(255,255,255,0.15)",
    "ring": "#60a5fa",
    "chart1": "#60a5fa",
    "chart2": "#22d3ee",
    "chart3": "#a78bfa",
    "chart4": "#34d399",
    "chart5": "#fbbf24",
    "sidebar": "#111827",
    "sidebarForeground": "#f8fafc",
    "sidebarPrimary": "#60a5fa",
    "sidebarPrimaryForeground": "#0b1220",
    "sidebarAccent": "#1f2937",
    "sidebarAccentForeground": "#f8fafc",
    "sidebarBorder": "rgba(255,255,255,0.10)",
    "sidebarRing": "#60a5fa"
  }
}
```

### CSS variables (copy-paste)

```css
:root {
  --radius: 0.625rem;
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #3182f6;
  --primary-foreground: #ffffff;
  --secondary: #f3f4f6;
  --secondary-foreground: #0f172a;
  --muted: #f5f5f5;
  --muted-foreground: #64748b;
  --accent: #f3f4f6;
  --accent-foreground: #0f172a;
  --destructive: #ef4444;
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #93c5fd;
  --chart-1: #2563eb;
  --chart-2: #06b6d4;
  --chart-3: #7c3aed;
  --chart-4: #22c55e;
  --chart-5: #f59e0b;
  --sidebar: #f8fafc;
  --sidebar-foreground: #0f172a;
  --sidebar-primary: #3182f6;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #eef2f7;
  --sidebar-accent-foreground: #0f172a;
  --sidebar-border: #e5e7eb;
  --sidebar-ring: #93c5fd;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card: #111827;
  --card-foreground: #f8fafc;
  --popover: #111827;
  --popover-foreground: #f8fafc;
  --primary: #60a5fa;
  --primary-foreground: #0b1220;
  --secondary: #1f2937;
  --secondary-foreground: #f8fafc;
  --muted: #1f2937;
  --muted-foreground: #94a3b8;
  --accent: #1f2937;
  --accent-foreground: #f8fafc;
  --destructive: #f87171;
  --border: rgba(255, 255, 255, 0.10);
  --input: rgba(255, 255, 255, 0.15);
  --ring: #60a5fa;
  --chart-1: #60a5fa;
  --chart-2: #22d3ee;
  --chart-3: #a78bfa;
  --chart-4: #34d399;
  --chart-5: #fbbf24;
  --sidebar: #111827;
  --sidebar-foreground: #f8fafc;
  --sidebar-primary: #60a5fa;
  --sidebar-primary-foreground: #0b1220;
  --sidebar-accent: #1f2937;
  --sidebar-accent-foreground: #f8fafc;
  --sidebar-border: rgba(255, 255, 255, 0.10);
  --sidebar-ring: #60a5fa;
}
```

적용 팁: Tailwind를 쓰는 경우, 위 변수를 기반으로 CSS 변수 프리셋을 선언하고, 유틸리티에서 var()를 사용하면 라이트/다크 전환이 수월합니다.
