## 해외주식 순위 조회 추가 (React Query, 1분 자동 갱신)

한국투자 Open API의 해외주식 시세분석 순위 일부를 조회하는 훅과 화면 구성을 추가했습니다.

- 적용 API (헤더는 문서상 필수값만 사용)
  - 가격급등락: GET /uapi/overseas-stock/v1/ranking/price-fluct (TR: HHDFS76260000)
  - 거래량급증: GET /uapi/overseas-stock/v1/ranking/volume-surge (TR: HHDFS76270000)
  - 매수체결강도상위: GET /uapi/overseas-stock/v1/ranking/volume-power (TR: HHDFS76280000)
- 공통 조건
  - 거래소(EXCD): NAS (나스닥)
  - 고객타입(custtype): P (개인)
  - Authorization: 로그인으로 발급받은 Access Token 사용
  - appkey/appsecret: 로그인 입력값 재사용
- 주기: 1분 간격으로 자동 재조회 (React Query refetchInterval)

참고: 문서에 따르면 위 3개 순위 API는 모의투자 미지원입니다. 데모 환경(env=demo)에서는 호출 실패할 수 있으니 실환경(env=real)에서 테스트하세요.

### 주요 코드

- 앱 전역 Provider: `App.tsx`
  - `@tanstack/react-query`의 `QueryClientProvider`로 래핑
- API 클라이언트: `lib/kiApi.ts`
  - 공통 헤더 빌더와 순위 API 헬퍼 3종(`getPriceFluct`, `getVolumeSurge`, `getVolumePower`)
  - 필수 헤더만 포함: `content-type`, `authorization`, `appkey`, `appsecret`, `tr_id`, `custtype`
- 조회 훅: `hooks/useKIRanking.ts`
  - `usePriceFluctRanking`, `useVolumeSurgeRanking`, `useVolumePowerRanking`
  - 결과는 공통 형태로 정규화하여 화면에서 바로 렌더링
- 화면: `screens/SearchScreen.tsx`
  - "가격 급등 상위", "거래량 급증 상위", "매수 체결강도 상위" 섹션 추가
  - 로딩/에러/데이터 표시 및 1분 자동 갱신 표시

### 사용 방법

1) 로그인 화면에서 App Key, Secret Key 입력 후 토큰 발급까지 정상 완료.
2) 하단 탭의 "테스트"(Search)로 이동.
3) 위 3개 섹션이 1분마다 자동 갱신되며 상위 결과가 나열됩니다.

### 확장 예정

문서 링크의 다른 순위 API(상승율/하락율, 신고가/신저가, 거래량/거래대금/증가율/회전율/시가총액 등)는 TR ID 및 필수 파라미터 확인 후 동일 패턴으로 확장 가능합니다. 필요 시 TR ID를 공유해 주시면 바로 추가하겠습니다.
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
├─ screens/                # 5개 탭 화면 + 온보딩(스플래시/로그인) + 상세
│  ├─ HomeScreen.tsx
│  ├─ SearchScreen.tsx
│  ├─ BoosterScreen.tsx
│  ├─ NotificationsScreen.tsx
│  ├─ BalanceScreen.tsx
│  ├─ SplashScreen.tsx
│  ├─ LoginScreen.tsx
│  └─ HomeDetailScreen.tsx
├─ components/             # 공용 컴포넌트
│  ├─ Container.tsx
│  ├─ EditScreenInfo.tsx
│  ├─ ScreenContent.tsx
│  └─ ui/                 # 테마 기반 UI 컴포넌트
│     ├─ Button.tsx
│     ├─ Card.tsx
│     ├─ Heading.tsx
│     ├─ Input.tsx
│     └─ SegmentedTabs.tsx
│
├─ components/items/       # 리스트 아이템 컴포넌트
│  └─ CurrentPriceItem.tsx
│
├─ components/BottomInfo.tsx # 하단 정보 섹션(의견보내기/고지/약관/아코디언)
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

- 온보딩 플로우
  - 초기 진입: `Splash` → 1초 후 자동으로 `Login` 화면으로 이동
  - 로그인 성공 시: `Root`(Bottom Tabs)로 전환
  - 구현 파일: `screens/SplashScreen.tsx`, `screens/LoginScreen.tsx`, `navigation/RootNavigator.tsx`

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
</Card>;
```

### Input

```tsx
import { Input } from 'components/ui/Input';

<Input label="계좌번호" placeholder="00000000-01" />
```

상태: helperText, error 텍스트 지원. 보안 입력은 `secureTextEntry`.

### SegmentedTabs

```tsx
import { SegmentedTabs } from 'components/ui/SegmentedTabs';

<SegmentedTabs
  tabs={[{ key: 'demo', label: '모의투자' }, { key: 'real', label: '실전투자' }]}
  value={'demo'}
  onChange={(k) => console.log(k)}
/>;
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

## 하단 정보(Accordion, BottomInfo)

- Accordion: 제목을 눌러 내용을 펼치고 접는 간단한 컴포넌트
- BottomInfo: “의견 보내기”, 감자증권 소개/고지, 약관/제작정보, “꼭 알아두세요” 아코디언을 포함한 하단 블록

테스트 탭의 맨 하단에 배치되어 있습니다.

```tsx
import { BottomInfo } from 'components/BottomInfo';

<BottomInfo />;
```

필요한 커스터마이징(테마 색상, 탭 중앙 플로팅 버튼, 헤더 액션 등) 요청 주시면 반영하겠습니다.

## 한국투자 API 연동(로그인/웹소켓 승인키)

본 프로젝트는 로그인 시 한국투자 API의 토큰 발급과 웹소켓 승인키 발급을 호출합니다. 문서 경로 예:
- 토큰: `/oauth2/tokenP` (grant_type=client_credentials, appkey, appsecret)
- 승인키: `/oauth2/Approval` (appkey, appsecret)

환경별 호스트
- real: https://openapi.koreainvestment.com:9443
- demo: https://openapivts.koreainvestment.com:29443

설치
```powershell
npm i zustand @react-native-async-storage/async-storage
```

파일 구조(추가)
- `stores/auth.ts`: 계정/키/환경 + 토큰/승인키 영속 저장(Zustand + AsyncStorage)
- `lib/kiApi.ts`: 토큰/승인키 발급 API 클라이언트
- `hooks/useKIAuth.ts`: 로그인 절차(토큰 → 승인키) 훅
- `hooks/useKIWebSocket.ts`: 승인키/WS 접속 정보 준비 훅(예시)

사용(로그인)
```tsx
import { useKIAuth } from '../hooks/useKIAuth';
const { login } = useKIAuth();
await login(); // 성공 시 토큰/승인키가 stores/auth.ts에 저장
```

스토어 상태
```ts
type Tokens = { accessToken: string|null; tokenExpiresAt: number|null; approvalKey: string|null };
type AuthState = {
  account: string; appKey: string; secretKey: string; env: 'demo'|'real';
  tokens: Tokens;
};
```

LoginScreen
- 입력값(계좌번호/App Key/Secret Key)은 Zustand 스토어로 관리되고, 앱 재실행/로그인 화면 재방문 시 자동 채워집니다.
- “시작하기” 클릭 시 토큰/승인키 발급 후 Root 탭으로 전환.

주의
- 실제 운영 접속 URL/파라미터는 상품 문서 최신본을 확인하세요. 기관/계정별 제약이 있을 수 있습니다.
- WebSocket 실제 구독 URL/프로토콜은 서비스에 따라 상이할 수 있어 hook에는 예시만 포함했습니다.

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
  --border: rgba(255, 255, 255, 0.1);
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
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-ring: #60a5fa;
}
```

적용 팁: Tailwind를 쓰는 경우, 위 변수를 기반으로 CSS 변수 프리셋을 선언하고, 유틸리티에서 var()를 사용하면 라이트/다크 전환이 수월합니다.
