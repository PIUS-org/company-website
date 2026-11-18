"""v37 — 3차 최종 수정 이미지 22장 반영에 따른 문구 보정 (KO·EN·JA). v37 이미지 커밋(7b117d3) 콘텐츠에 실행.

1) B실 5건: v37 교체로 5장 모두 새 브랜드(LUMEN CLINIC·VÉREA RESIDENCE·FlowFin·creada.·GOODHANDS)가 되어,
   제목과 alt에 남은 옛 이름(아틀리에 클리닉 등)이 화면과 맞지 않음 → 제목·alt의 브랜드명만 교체. slug·id 그대로.
2) E실 교체 8장: alt의 데모 프로젝트명이 교체 화면과 다름 → v36과 같은 이름으로(이제 프로젝트 5장 모두 같은 이름).
"""
import json
LOG = []
R = 'content/portfolio/'
def load(s): return json.load(open(R + s + '/project.json', encoding='utf-8'))
def save(s, p):
    with open(R + s + '/project.json', 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=2); f.write('\n')

def walk(o, path, fn):
    if isinstance(o, dict):
        if set(o) >= {'ko', 'en', 'ja'} and all(isinstance(o[k], str) for k in ('ko', 'en', 'ja')):
            new = {k: fn(k, v) for k, v in o.items()}
            if new != o:
                LOG.append(('P0', None, path, dict(o), new)); o.update(new)
            return
        for k, v in o.items(): walk(v, path + '.' + k, fn)
    elif isinstance(o, list):
        for n, v in enumerate(o): walk(v, f'{path}[{n}]', fn)

B = {
 'private-clinic-brand-site': (('아틀리에 클리닉', 'Atelier Clinic', 'アトリエクリニック'), ('루멘 클리닉', 'Lumen Clinic', 'ルーメンクリニック')),
 'luxury-real-estate-showcase': (('포름 에스테이트', 'Forme Estate', 'フォルム エステート'), ('베레아 레지던스', 'Véréa Residence', 'ヴェレア レジデンス')),
 'fintech-product-landing': (('모네타', 'Moneta', 'モネタ'), ('플로우핀', 'FlowFin', 'フローフィン')),
 'creator-membership-platform': (('뮤즈 클럽', 'Muse Club', 'ミューズクラブ'), ('크레아다', 'Creada', 'クレアダ')),
 'nonprofit-donation-platform': (('커먼그라운드', 'Common Ground', 'コモングラウンド'), ('굿핸즈', 'Goodhands', 'グッドハンズ')),
}
E = {
 'creator-collab-workspace': (('그린티 세럼 브랜드 필름', 'Green Tea Serum Brand Film', 'グリーンティーセラム・ブランドフィルム'), ('SOFT GLOW 캠페인', 'Soft Glow Campaign', 'ソフトグロウ・キャンペーン')),
 'social-campaign-builder': (('윈터 컬렉션 론칭', 'Winter Collection Launch', 'ウィンターコレクション・ローンチ'), ('WINTER EDIT 캠페인', 'Winter Edit Campaign', 'ウィンター・エディット・キャンペーン')),
 'podcast-production-hub': (('작은 브랜드의 큰 선택', 'Big Choices for Small Brands', '小さなブランドの大きな選択'), ('일과 일상 사이의 리듬(THE SMALL SHIFT EP08)', 'The Rhythm Between Work and Life (The Small Shift EP08)', '仕事と日常のあいだのリズム（THE SMALL SHIFT EP08）')),
 'online-course-studio': (('좋은 인터페이스를 만드는 법', 'How to Make a Good Interface', '良いインターフェースのつくり方'), ('컬러가 전달하는 인상(DESIGN FUNDAMENTALS)', 'The Impression Color Gives (Design Fundamentals)', '色が伝える印象（DESIGN FUNDAMENTALS）')),
 'wedding-planning-portal': (('서연 & 지훈', 'Seoyeon & Jihoon', 'ソヨン＆ジフン'), ('시온 & 지온', 'Sion & Jion', 'シオン＆ジオン')),
 'architecture-client-portal': (('한남 리빙룸 리노베이션', 'Hannam Living Room Renovation', '漢南リビングルーム・リノベーション'), ('서초 주거 리노베이션', 'Seocho Residence Renovation', '瑞草住宅リノベーション')),
}
for group, pr in ((B, 'P0'), (E, 'P1')):
    for s, (old, new) in group.items():
        p = load(s); n0 = len(LOG)
        idx = {'ko': 0, 'en': 1, 'ja': 2}
        walk(p, '', lambda lg, v: v.replace(old[idx[lg]], new[idx[lg]]))
        for k in range(n0, len(LOG)): LOG[k] = (pr, s) + LOG[k][2:]
        s_all = json.dumps(p, ensure_ascii=False)
        assert not any(o in s_all for o in old), (s, [o for o in old if o in s_all])
        save(s, p)
json.dump(LOG, open('/tmp/r5/fixlog.json', 'w'), ensure_ascii=False, indent=1)
print(len(LOG), 'fields changed')
