# Github-Gist-Status

GitHub 프로필에 고정(pin)할 수 있는 Gist를 자동으로 업데이트합니다.

[English](README.md)

**2가지 Gist를 지원합니다:**

| Gist | 설명 | 예시 |
|------|------|------|
| **Productive** | 커밋 시간대별 생산성 분석 | `🌞 Morning  120 commits ██████░░░░░░░  25.0%` |
| **Stats** | GitHub 통계 요약 | `⭐ Total Stars: 142` |

### Productive Gist

커밋 기록을 분석하여 시간대별 활동량을 바 차트로 표시합니다.
낮 시간 커밋이 많으면 `I'm an early 🐤`, 밤 시간이 많으면 `I'm a night 🦉`로 Gist 제목이 변경됩니다.

```
🌞 Morning    73 commits ███████▍░░░░░░░░░░░░░  19.3%
🌆 Daytime   142 commits ██████████████▍░░░░░░░  37.6%
🌃 Evening   112 commits ███████████▎░░░░░░░░░░  29.6%
🌙 Night      51 commits █████▏░░░░░░░░░░░░░░░  13.5%
```

### Stats Gist

GitHub 프로필 통계를 한눈에 보여줍니다.

```
⭐    Total Stars:                                142
➕    Total Commits:                            1,234
🔀    Total PRs:                                   56
🚩    Total Issues:                                23
📦    Contributed to:                              18
```

---

## Setup

### 1. Gist 생성

1. [gist.github.com](https://gist.github.com)에서 **2개의 Gist**를 생성합니다.
   - 하나는 Productive용, 하나는 Stats용
   - 파일명과 내용은 아무거나 입력해도 됩니다 (자동으로 업데이트됨)
2. 각 Gist URL에서 ID를 복사합니다.
   - `https://gist.github.com/username/`**`abc123...`** ← 이 부분

### 2. GitHub Token 생성

1. [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)에서 토큰 생성
2. 필요한 권한: **`gist`**, **`repo`** (private repo 커밋도 분석하려면), **`read:user`**

### 3. Repository 설정

이 저장소를 Fork하거나 새로 생성한 뒤:

1. **Settings > Secrets and variables > Actions**에서 다음 시크릿을 추가합니다:

   | Secret | 설명 |
   |--------|------|
   | `GH_TOKEN` | GitHub Personal Access Token |
   | `GIST_ID_PRODUCTIVE` | Productive Gist ID |
   | `GIST_ID_STATS` | Stats Gist ID |

2. Gist를 하나만 사용하고 싶다면, 해당 Gist ID만 설정하면 됩니다.
   나머지는 자동으로 건너뜁니다.

### 4. 워크플로우 설정 (선택)

`.github/workflows/schedule.yml`에서 환경변수를 수정할 수 있습니다:

```yaml
env:
  TIMEZONE: Asia/Seoul      # 시간대 (기본: Asia/Seoul)
  ALL_COMMITS: 'true'       # true: 전체 커밋 수 / false: 최근 1년
  K_FORMAT: 'false'         # true: 1.5k 형식 / false: 1,500 형식
```

### 5. GitHub Actions 활성화

1. **Actions** 탭에서 워크플로우를 활성화합니다.
2. 7시간마다 자동으로 실행되며, `main` 브랜치에 push할 때도 실행됩니다.
3. **Actions > Update Gists > Run workflow**로 수동 실행도 가능합니다.

### 6. Gist 고정

GitHub 프로필에서 Gist를 고정(pin)하면 프로필에 표시됩니다.

---

## Local Development

```bash
# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env
# .env 파일에 토큰과 Gist ID 입력

# 개발 실행
npm run dev

# 빌드
npm run build
```

---

## Project Structure

```
Github-Gist-Status/
├── .github/workflows/
│   └── schedule.yml        # GitHub Actions (7시간마다 실행)
├── src/
│   ├── index.ts            # 메인 엔트리포인트
│   ├── types.ts            # 공유 타입 정의
│   ├── api/
│   │   ├── graphql.ts      # GraphQL 클라이언트
│   │   └── queries.ts      # GraphQL 쿼리
│   ├── modules/
│   │   ├── productive.ts   # 생산성 분석 모듈
│   │   └── stats.ts        # GitHub 통계 모듈
│   └── utils/
│       ├── barChart.ts     # 바 차트 생성
│       └── format.ts       # 숫자 포맷팅
├── action.yml              # GitHub Action 메타데이터
├── package.json
├── tsconfig.json
└── .env.example
```

## License

[MIT](LICENSE) (c) 2026 Jamkris
