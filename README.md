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
