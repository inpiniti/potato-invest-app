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
│  └─ ScreenContent.tsx
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

- Bottom Tabs 5개: `Home`, `Search`, `Booster(부스터)`, `Notifications(알림)`, `Balance(잔고)`
- 각 탭은 `screens/`에 대응되는 화면 컴포넌트를 가집니다.
- 상단 헤더는 Native Stack을 사용해 확장 가능하며, 현재 `RootNavigator`에서 Tab을 감싸고 있습니다.

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
