# AI 마에스트로 성과공유회 홍보물 — 확정 디자인 (2026. 10. 20.)

2026. 10. 30.(금) 오후 2시 · 대학본부 본관 3층 대강당 · 부산대학교 AX·정보화혁신본부

종이빛 바탕 · 금색 이중 테두리 · PERFORMANCE · **AI 마에스트로** · 성·과·공·유·회.
금색 이중 가로선 사이에 옅은 악보 띠를 깔고 메인 문구 「코딩을 몰라도, AI 에이전트를 만들어 냈습니다.」와
인용 문구 「21명이 완주한 8번의 미션, 100건의 활용 사례」를 올린 구성. 글꼴 Pretendard.

| 용도 | 출력 파일 | 원본 | 규격 |
|---|---|---|---|
| 포스터(웹·공지) | `웹포스터_1200x1697.png` | `포스터_편집원본.pptx` | 1200×1697px, 참석 신청 QR 포함 |
| 포스터(인쇄) | `포스터_A4_210x297mm.pdf` | `포스터_편집원본.pptx` | A4, 290dpi |
| 엑스배너 | `엑스배너_606x1806mm(재단3mm포함).pdf` | `xbanner.html` | 완성 600×1800mm + 재단 3mm |
| 현수막 | `현수막_3006x506mm(재단3mm포함).pdf` | `banner_3000x500.html` | 완성 3000×500mm + 재단 3mm (업체 견적 규격) |

재단 여백 없는 완성 크기 판: `엑스배너_600x1800mm.pdf`, `현수막_3000x500mm.pdf`
미리보기: `엑스배너_미리보기.png`, `현수막_3000x500_미리보기.png`
음악과 함께 보는 웹페이지: [`../concert/`](../concert/) — https://ai-maestro-showcase.vercel.app/concert/

이전 디자인(10. 16. 판)은 [`_이전_v1/`](_이전_v1/) 에 보관.

## 다시 출력하기

엑스배너·현수막은 HTML 원본(악보 띠 이미지 포함)을 Chrome 헤드리스로 출력합니다(Pretendard 는 CDN 에서 불러옵니다).

```bash
chrome --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf=엑스배너_600x1800mm.pdf xbanner.html
chrome --headless=new --no-pdf-header-footer --virtual-time-budget=15000 --print-to-pdf=현수막_3000x500mm.pdf banner_3000x500.html
```

포스터는 `포스터_편집원본.pptx` 를 PowerPoint 에서 고친 뒤 PNG(1200px 폭)·PDF 로 저장합니다.
