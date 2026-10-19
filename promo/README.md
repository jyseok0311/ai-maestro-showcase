# AI 마에스트로 성과공유회 홍보물 — 「마에스트로 콘서트」

2026. 10. 30.(금) 오후 2시 · 대학본부 본관 3층 대강당 · 부산대학교 AX·정보화혁신본부

아이보리 바탕 · 먹색 · 강조는 금색 하나, 글꼴 Pretendard.
오선지 위 8개 음표 = 자율 스터디 8번의 미션(마지막 음표만 금색), 프로그램은 Ⅰ~Ⅳ 악장.

| 용도 | 출력 파일 | 원본 | 규격 |
|---|---|---|---|
| 엑스배너 | `엑스배너_600x1800mm.pdf` | `xbanner.html` | 600×1800mm (재단 여백 미포함) |
| 현수막 | `현수막_5000x900mm.pdf` | `banner.html` | 5000×900mm (재단 여백 미포함) |
| 웹 포스터 | `웹포스터_1200x1697.png` | `poster.html` | 1200×1697px, 참석 신청 QR 포함 |

미리보기: `엑스배너_미리보기.png`, `현수막_미리보기.png`
음악과 함께 보는 웹페이지: [`../concert/`](../concert/) — https://jyseok0311.github.io/ai-maestro-showcase/concert/

이전 디자인(10. 16. 판, 「코딩을 몰라도」 파랑·주황)은 [`_이전_v1/`](_이전_v1/) 에 보관.

## 다시 출력하기

HTML 원본을 고친 뒤 Chrome 헤드리스로 출력합니다(Pretendard 는 CDN 에서 불러옵니다).

```bash
chrome --headless=new --no-pdf-header-footer --virtual-time-budget=12000 --print-to-pdf=엑스배너_600x1800mm.pdf xbanner.html
chrome --headless=new --no-pdf-header-footer --virtual-time-budget=12000 --print-to-pdf=현수막_5000x900mm.pdf banner.html
chrome --headless=new --hide-scrollbars --window-size=1200,1697 --virtual-time-budget=12000 --screenshot=웹포스터_1200x1697.png poster.html
```
