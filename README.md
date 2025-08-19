## 해외주식 순위 조회 추가 (React Query, 수동 Reload 갱신)

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
- 초기 1회 조회 후 자동 주기 갱신은 비활성 (refetchInterval 사용 안함). 각 섹션 왼쪽 Reload 버튼 클릭 시 재조회.

NOTE: 본 앱은 실전(real) 전용으로 구성되었으며 모든 데모(openapivts) 관련 코드는 제거되었습니다.

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
  - 여러 순위/테스트(잔고/기간손익/체결) 섹션 및 Reload 버튼 표시
  - 로딩/빈데이터/에러 메시지 + 수동 Reload

### 데이터/상태 폴더 구조 (store/hook/api)

- `stores/`
  - `stores/auth.ts`: 계좌/키/환경 + 토큰/승인키를 Zustand + AsyncStorage로 영속 저장
    - shape: `{ account, appKey, secretKey, env, tokens: { accessToken, tokenExpiresAt, approvalKey } }`
    - actions: `setCredentials`, `setTokens`, `reset`

- `lib/`
  - `lib/kiApi.ts`: 한국투자 API 클라이언트
    - 토큰 발급: `issueAccessToken()`, 승인키 발급: `issueApprovalKey()`
    - 공통 HTTP/헤더: `buildHeaders()` (content-type, authorization, appkey, appsecret, tr_id, custtype)
    - 순위 공통 호출기: `getOverseasRanking()` (쿼리: EXCD=NAS, KEYB/AUTH 공란 포함)
    - 순위 헬퍼 구현(실사용 TR ID 포함):
      - 가격급등락 `getPriceFluct` (TR: HHDFS76260000)
      - 거래량급증 `getVolumeSurge` (TR: HHDFS76270000)
      - 매수체결강도상위 `getVolumePower` (TR: HHDFS76280000)
      - 상승/하락률 `getUpdownRate` (TR: HHDFS76290000)
      - 신고/신저가 `getNewHighLow` (TR: HHDFS76300000)
      - 거래량 순위 `getTradeVol` (TR: HHDFS76310010)
      - 거래대금 순위 `getTradePbmn` (TR: HHDFS76320010)
      - 거래 증가율 순위 `getTradeGrowth` (TR: HHDFS76330000)
      - 거래 회전율 순위 `getTradeTurnover` (TR: HHDFS76340000)
      - 시가총액 순위 `getMarketCap` (TR: HHDFS76350100)
    - 구현 메모: 응답은 대개 `output1`(요약) + `output2`(리스트) 구조 → 리스트 병합 시 `output2` 우선 사용

- `hooks/`
  - 인증: `hooks/useKIAuth.ts` (토큰·승인키 발급), `hooks/useKIWebSocket.ts` (WS 접속 정보 준비 예시)
  - 순위: `hooks/useKIRanking.ts` (React Query, 수동 refetch)
    - 제공 훅(모두 EXCD=NAS 기본값):
      - `usePriceFluctRanking`, `useVolumeSurgeRanking`, `useVolumePowerRanking`
      - `useUpRateRanking`, `useDownRateRanking`, `useNewHighRanking`, `useNewLowRanking`
      - `useTradeVolRanking`, `useTradePbmnRanking`, `useTradeGrowthRanking`, `useTradeTurnoverRanking`, `useMarketCapRanking`
    - 정규화: 종목명/가격/등락률 텍스트로 가공, ticker도 추출하여 아이콘/로고에 활용 가능

- `components/`
  - `components/items/CurrentPriceItem.tsx`: `ticker` prop 지원, 가격/등락률 표시, 길면 이름 말줄임 처리
  - `components/ui/LogoSvg.tsx`: TradingView SVG 로고를 원형으로 중앙 정렬 렌더 (viewBox 보정)
  - `logoData.ts`: 방대한 `logos[]` 데이터와 `getLogoByTicker()` 제공 (티커 → TradingView logoid)

### 사용 방법

1. 로그인 화면에서 App Key, Secret Key 입력 후 토큰 발급까지 정상 완료.
2. 하단 탭의 "테스트"(Search)로 이동.
3. 각 섹션 좌측 Reload(새로고침 아이콘) 버튼을 눌러 수동 재조회할 수 있습니다.

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
│     ├─ SegmentedTabs.tsx
│     └─ LogoSvg.tsx
│
├─ components/items/       # 리스트 아이템 컴포넌트
│  └─ CurrentPriceItem.tsx
│
├─ hooks/                  # 데이터 훅(인증/순위 등)
│  ├─ useKIAuth.ts
│  ├─ useKIRanking.ts
│  └─ useKIWebSocket.ts
│
├─ lib/                    # API 클라이언트
│  └─ kiApi.ts
│
├─ stores/                 # 앱 상태 저장소
│  └─ auth.ts
│
├─ logoData.ts             # 티커→TradingView logoid 매핑 데이터/헬퍼
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
- 탭 재구성: 알림 탭을 기간손익 탭으로 교체, 체결내역/기간손익 탭 추가, 부스터 탭을 마지막으로 이동
- 홈 섹션 '더 보기' 클릭 시 해당 탭/상세로 이동 (잔고→잔고, 기간손익→기간손익, 체결내역→체결내역, 매수 체결강도 상위→상세 화면)
- 랭킹 상세 화면 추가: `RankingDetailScreen` (kind 파라미터로 여러 랭킹 전체 리스트 표시)
- 부스터 기능 추가: 종목 부스터 토글(아이템 우측 번개 아이콘), Zustand 영속 저장소(`stores/booster.ts`), 부스터 탭에서 등록 종목 리스트 출력 및 전체 비우기
- 종목 상세 화면 추가: `StockDetailScreen` (리스트 아이템(CurrentPriceItem) 탭 시 이동, 내부 전용 Tab.Navigator: 차트/분석/재무분석/커뮤니티/뉴스 – 각 탭은 중앙에 텍스트 placeholder)

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

<Input label="계좌번호" placeholder="00000000-01" />;
```

상태: helperText, error 텍스트 지원. 보안 입력은 `secureTextEntry`.

### SegmentedTabs

```tsx
import { SegmentedTabs } from 'components/ui/SegmentedTabs';

{/* 데모 환경 제거로 SegmentedTabs 예시는 real 단일 옵션만 필요 시 사용 */}
<SegmentedTabs
  tabs={[
    { key: 'real', label: '실전투자' },
  ]}
  value={'real'}
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

환경 호스트 (본 앱은 실전(real) 전용이며 데모 환경 호출 코드는 제거되었습니다)

- real: https://openapi.koreainvestment.com:9443

설치

```powershell
npm i zustand @react-native-async-storage/async-storage
```

파일 구조(추가)

- `stores/auth.ts`: 계정/키/환경 + 토큰/승인키 영속 저장(Zustand + AsyncStorage)
- `lib/kiApi.ts`: 토큰/승인키 발급 API 클라이언트
- `hooks/useKIAuth.ts`: 로그인 절차(토큰 → 승인키) 훅
- `hooks/useKIWebSocket.ts`: 승인키/WS 접속 정보 준비 훅(예시)
 - `hooks/useKIRanking.ts`: 해외 순위(가격 급등, 거래량 급증 등) 조회 훅
 - `hooks/useKITrading.ts`: 해외 잔고/기간손익 조회 훅 (TR ID placeholder 상태)

사용(로그인)

```tsx
import { useKIAuth } from '../hooks/useKIAuth';
const { login } = useKIAuth();
await login(); // 성공 시 토큰/승인키가 stores/auth.ts에 저장
```

스토어 상태

```ts
type Tokens = {
  accessToken: string | null;
  tokenExpiresAt: number | null;
  approvalKey: string | null;
};
type AuthState = {
  account: string;
  appKey: string;
  secretKey: string;
  env: 'real'; // 데모 제거
  tokens: Tokens;
};
```

LoginScreen

- 입력값(계좌번호/App Key/Secret Key)은 Zustand 스토어로 관리되고, 앱 재실행/로그인 화면 재방문 시 자동 채워집니다.
- “시작하기” 클릭 시 토큰/승인키 발급 후 Root 탭으로 전환.

주의

- 실제 운영 접속 URL/파라미터는 상품 문서 최신본을 확인하세요. 기관/계정별 제약이 있을 수 있습니다.
- WebSocket 실제 구독 URL/프로토콜은 서비스에 따라 상이할 수 있어 hook에는 예시만 포함했습니다.

### 해외 순위 랭킹 훅 요약

`usePriceFluctRanking`, `useVolumeSurgeRanking`, `useVolumePowerRanking`, `useUpRateRanking`, `useDownRateRanking`, `useNewHighRanking`, `useNewLowRanking`, `useTradeVolRanking`, `useTradePbmnRanking`, `useTradeGrowthRanking`, `useTradeTurnoverRanking`, `useMarketCapRanking`

모든 랭킹 API 는 응답 내 `output1`(요약/헤더), `output2`(리스트) 형태일 수 있어 내부에서 `output2`를 우선 병합합니다.

### 해외 잔고 / 기간손익 조회

문서상 잔고(inquire-balance), 기간손익(inquire-period-profit) 엔드포인트를 위한 기초 훅/헬퍼가 추가되었습니다.

구현 파일:

- `lib/kiApi.ts` 내 `getOverseasBalance`, `getOverseasPeriodProfit`, `splitAccountParts`
- `hooks/useKITrading.ts` 내 `useOverseasBalance`, `useOverseasPeriodProfit`, `useOverseasExecutions`

TR ID 는 실제 문서의 최신 값을 확인 후 `TRADING_TR_IDS` 상수의 placeholder 를 교체해야 합니다.

사용 예시:

```tsx
import { useOverseasBalance, useOverseasPeriodProfit } from 'hooks/useKITrading';

function BalanceWidget() {
  // 특정 해외거래소 / 통화 선택 (기본 NASD / USD). exchange, currency 생략 시 내부 defaultQuery 값 사용.
  const bal = useOverseasBalance({ exchange: 'NASD', currency: 'USD' });
  if (bal.isPending) return <Text>불러오는 중…</Text>;
  if (bal.error) return <Text>오류: {String(bal.error)}</Text>;
  return (
    <View>
      <Text>종목수: {bal.data.rows.length}</Text>
      <Text>총 평가손익: {bal.data.summary?.evlu_pfls_amt}</Text>
    </View>
  );
}

function PeriodProfitWidget() {
  const profit = useOverseasPeriodProfit({ start: '20250101', end: '20250131', exchange: 'NASD', currency: 'USD' });
  if (profit.isPending) return <Text>불러오는 중…</Text>;
  if (profit.error) return <Text>오류: {String(profit.error)}</Text>;
  return (
    <View>
      <Text>레코드 수: {profit.data.rows.length}</Text>
      <Text>누적 손익: {profit.data.summary?.pft_amt}</Text>
    </View>
  );
}
```

추가/변경 사항:

- 잔고/기간손익/체결 API 호출 시 기본 쿼리에 다음 필드가 포함되도록 수정: `OVRS_EXCG_CD(NASD)`, `TR_CRCY_CD(USD)`, `AFHR_FLPR_YN(N)`, `FUND_STTL_ICLD_YN(Y)`, `FNCG_AMT_AUTO_RDPT_YN(N)`, `PRCS_DVSN_CD(00)`, `INQR_DVSN_CD(00)`, `SLL_BUY_DVSN_CD(00)` 및 페이징 커서 `CTX_AREA_FK200/NK200`.
- 훅 옵션으로 `exchange`, `currency` 전달 시 해당 기본값 override.
- 아직 TR ID / 경로 placeholder 인 `executions` 는 실제 문서의 `/inquire-ccnl` 등 확인 후 교체 필요.

계좌번호 파싱:

```ts
const { cano, acntPrdtCd } = splitAccountParts('12345678-01'); // { cano: '12345678', acntPrdtCd: '01' }
```

병합 로직:

- 잔고/기간손익 응답 또한 `output1`, `output2` 혼합 가능 → `mergeTradingOutputs` 로 summary/rows 분리.
- `output2` 가 배열이면 리스트, `output1` 은 요약으로 간주. 구조 역전 시도 대비 fallback 포함.
- 체결내역(Executions) 역시 동일한 병합 로직 재사용 (TR ID / 경로 placeholder)

리스크 & TODO:

- 실제 TR ID 확인 필요 (`TRADING_TR_IDS` placeholder)
- 필드 이름(손익/수량 등)은 계정/상품 유형별 변동 가능 → UI 사용 전 실제 응답 shape 콘솔 확인 권장
- 기간손익 API 의 응답 구조(일자 vs 종목별)는 문서/계정 권한에 따라 다를 수 있음 → 후속 세분화 필요

## 부스터 기능

- 목적: 관심 종목을 "부스터"로 빠르게 마킹해 별도 탭에서 모아보기
- 저장소: `stores/booster.ts` (Zustand + AsyncStorage persist)
  - shape: `{ items: { ticker, addedAt }[] }`
  - actions: `add(ticker)`, `remove(ticker)`, `toggle(ticker)`, `clear()`
- UI 연동:
  - `CurrentPriceItem` 우측 번개 아이콘(미등록: 회색 flash-outline, 등록: 파란 flash)
  - 탭의 `BoosterScreen`에서 부스터 등록 종목을 `Section` 컴포넌트로 표시 (순서: 추가한 시간 기준, 순위 번호 제공)
  - footer: "전체 비우기" (존재 시)
- 사용 방법:
  1. 아무 랭킹/잔고/손익 리스트 아이템 우측 번개 아이콘 탭 → 파란색으로 변하면 등록 완료
  2. Booster 탭 이동 → 등록 종목 확인
  3. 다시 아이콘 탭 시 해제 / "전체 비우기"로 모두 초기화
- 확장 예정 아이디어:
  - 부스터 메모/분류 태그
  - 실시간 시세/알림 연동
  - 정렬(추가순/티커/변동률) 및 검색 필터

### 부스터 실시간 시세(WebSocket) 구독

부스터에 추가한 티커들은 WebSocket을 통해 실시간으로 가격/등락률을 받아 `BoosterScreen` 에 표시합니다. 현재는 한국투자 실제 HDFSCNT0(또는 해외 실시간) 프로토콜 적용 전으로, placeholder JSON 포맷(`{ type:'subscribe', ticker }`)을 사용하고 있으므로 추후 실제 스펙을 치환하면 됩니다.

구성 요약:

- 훅: `useBoosterPrices()`
  - 렌더 결과를 반환하지 않고 사이드이펙트만 수행 (소켓 생성/구독 diff 관리)
  - 승인키(approvalKey) 변경 시 1회 재연결
  - 부스터 티커 목록 증감(diff) 계산 → subscribe/unsubscribe 메시지 전송
  - 200ms 이하 동일 티커 다발 업데이트는 throttle (최대 5회/초) 하여 렌더 폭주 방지
- 시세 스토어: `useBoosterPriceStore`
  - shape: `prices[ticker] = { last, rate, updatedAt, prevLast? }`
  - `prevLast` 비교로 가격 변동시 UI 플래시 처리
- UI: `CurrentPriceItem`
  - `prevLast !== last` 감지 → 1초간 붉은 border flash 효과
  - 번개 아이콘으로 실시간 구독 대상(부스터) 토글
- 화면: `BoosterScreen`
  - `useBoosterPrices()` 호출로 구독 유지
  - shallow selector(`useShallow`)로 `prices` 읽어 불필요한 리렌더 최소화

예시 흐름:

1. 사용자가 아이템 우측 번개 아이콘 탭 → `booster` 스토어에 티커 추가
2. 훅이 diff 계산 → 구독 메시지 전송 (소켓 미오픈이면 pending queue 저장 후 onopen 시 처리)
3. 서버로부터 `{ ticker, last, rate }` 수신 → throttle → `update()` 스토어 반영
4. 컴포넌트가 `prevLast` 변화 감지 → flash border
5. 해제 시 unsubscribe 메시지 전송 + 가격 데이터 제거

재연결 / 예외 처리:

- 현재 onclose 시 단순 초기화만 수행 (자동 재시도/백오프 미구현)
- 향후: 지수적 백오프, 상태 인디케이터(연결/재연결/에러), 에러 프레임 처리 추가 예정

TODO:

- [ ] 실제 HDFSCNT0 (또는 해외 실시간 채널) 구독/해제 포맷 반영
- [ ] 재연결 & 백오프 + 자동 재구독
- [ ] 연결 상태 UI (연결/재연결/에러 배지)
- [ ] 추가 필드(bid/ask, 체결량, 거래대금 등) 확장
- [ ] 가격 변동 방향별 색상 플래시 (현재 단일 붉은 border)

이 설계로 비즈니스 로직(소켓/구독)과 프레젠테이션(UI)이 분리되어 유지보수가 용이하며, 실제 프로토콜 적용 시 `buildSubscribeMessage`/`buildUnsubscribeMessage` 및 onmessage 파싱 부분만 교체하면 됩니다.

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
