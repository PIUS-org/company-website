"""v39 검수 — 개요 문단 의미 중복 4건만 다듬음 (KO·EN·JA). 새 사실·수치 없음, v38/v39에 이미 있던 문장만 사용.

- bulkbridge: v39 lead와 body가 같은 내용(거래처 가격·박스 단위·승인)을 두 번 말함
  → body를 v38의 구체 예시(가상 구매사 72개 · 총액 ₩704,880)로 되돌림.
- smart-factory-mes: lead 둘째 문장과 body가 모두 '작업지시·LOT를 공통 기준으로' → lead 둘째 문장 삭제(설계 판단은 body에 남김).
- project-resource-costing: body가 lead와 같은 주장(배정·타임시트·원가 분리 시 예산 판단 어려움) → body 삭제.
- clinic-branch-reception: body가 lead 요약 반복 → body 삭제.
v39 반입 커밋(5dc153c) 콘텐츠에 실행. v38 콘텐츠는 dae0cba에서 읽음.
"""
import json, subprocess
LOG = []
R = 'content/portfolio/'
def load(s): return json.load(open(R + s + '/project.json', encoding='utf-8'))
def save(s, p):
    with open(R + s + '/project.json', 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=2); f.write('\n')
def ov(p): return [b for b in p['blocks'] if b['type'] == 'overview'][0]

# bulkbridge
s = 'bulkbridge'; p = load(s); b = ov(p)
v38 = json.loads(subprocess.run(['git', 'show', f'dae0cba:{R}{s}/project.json'], capture_output=True, text=True).stdout)
old = dict(b['body']); b['body'] = dict(ov(v38)['body']); LOG.append((s, 'overview.body', old, b['body'])); save(s, p)

# smart-factory-mes — drop the lead's second sentence
s = 'smart-factory-mes'; p = load(s); b = ov(p); old = dict(b['lead'])
cut = {'ko': ' 이 데모는 작업지시와 LOT를 공통 연결 기준으로 삼는 화면 구조를 보여줍니다.',
       'en': ' This demo uses work orders and LOT identifiers to connect the screens.',
       'ja': '本デモでは作業指示とLOT番号を共通の連携基準として扱います。'}
for lg, c in cut.items():
    assert c in b['lead'][lg], (s, lg); b['lead'][lg] = b['lead'][lg].replace(c, '').strip()
LOG.append((s, 'overview.lead', old, dict(b['lead']))); save(s, p)

for s in ('project-resource-costing', 'clinic-branch-reception'):
    p = load(s); b = ov(p); old = b.pop('body'); LOG.append((s, 'overview.body', old, None)); save(s, p)

json.dump(LOG, open('/tmp/v39/fixlog.json', 'w'), ensure_ascii=False, indent=1)
print(len(LOG), 'fields')
