"""v36 — 3차 수정 이미지 100장 반영에 따른 문구 보정 (이미지 내용이 바뀐 곳만, KO·EN·JA).

이미지 자체는 R3-REPLACEMENT-MANIFEST.csv의 target_path로 덮어썼고, 이 스크립트는 JSON 문구만 고친다.
- E실: alt가 '데모 프로젝트 ○○'를 설명하는데, 교체된 화면은 다른 데모 이름을 보여 준다 → 교체된 화면의 alt만 실제 이름으로.
- D실 cleaning 05: '11월 5일 별도 이용 건'이 '11월 19일(목) 이용 완료'로 바뀜 → 캡션·alt·흐름 단계·개요.
- D실 language 01: 배울 언어 선택이 '일본어'에서 '영어'로 바뀜(연습 문장도 영어) → 개요.
v36 시작 커밋(98b2c38) 콘텐츠에 실행하는 것을 전제로 한다.
"""
import json

LOG = []
root = 'content/portfolio/'


def load(s):
    return json.load(open(root + s + '/project.json', encoding='utf-8'))


def save(s, p):
    with open(root + s + '/project.json', 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.write('\n')


# 1) E — demo-project name in alt, replaced images only (names read off each replaced screen)
E = {
    'creator-collab-workspace': (['01', '02', '05'],
        ('그린티 세럼 브랜드 필름', 'Green Tea Serum Brand Film', 'グリーンティーセラム・ブランドフィルム'),
        ('SOFT GLOW 캠페인', 'Soft Glow Campaign', 'ソフトグロウ・キャンペーン')),
    'social-campaign-builder': (['01', '03', '04', '05'],
        ('윈터 컬렉션 론칭', 'Winter Collection Launch', 'ウィンターコレクション・ローンチ'),
        ('WINTER EDIT 캠페인', 'Winter Edit Campaign', 'ウィンター・エディット・キャンペーン')),
    'podcast-production-hub': (['01', '03', '04', '05'],
        ('작은 브랜드의 큰 선택', 'Big Choices for Small Brands', '小さなブランドの大きな選択'),
        ('일과 일상 사이의 리듬(THE SMALL SHIFT EP08)', 'The Rhythm Between Work and Life (The Small Shift EP08)', '仕事と日常のあいだのリズム（THE SMALL SHIFT EP08）')),
    'online-course-studio': (['02', '04', '05'],
        ('좋은 인터페이스를 만드는 법', 'How to Make a Good Interface', '良いインターフェースのつくり方'),
        ('컬러가 전달하는 인상(DESIGN FUNDAMENTALS)', 'The Impression Color Gives (Design Fundamentals)', '色が伝える印象（DESIGN FUNDAMENTALS）')),
    'wedding-planning-portal': (['01', '03', '04', '05'],
        ('서연 & 지훈', 'Seoyeon & Jihoon', 'ソヨン＆ジフン'),
        ('시온 & 지온', 'Sion & Jion', 'シオン＆ジオン')),
    'architecture-client-portal': (['01', '02', '04', '05'],
        ('한남 리빙룸 리노베이션', 'Hannam Living Room Renovation', '漢南リビングルーム・リノベーション'),
        ('서초 주거 리노베이션', 'Seocho Residence Renovation', '瑞草住宅リノベーション')),
}
for s, (ids, old, new) in E.items():
    p = load(s)
    for im in p['images']:
        if im['id'][-2:] not in ids:
            continue
        before = dict(im['alt'])
        a = dict(before)
        for k, lg in enumerate(('ko', 'en', 'ja')):
            a[lg] = a[lg].replace(old[k], new[k])
            assert a[lg] != before[lg], (s, im['id'], lg)
        im['alt'] = a
        LOG.append(('P1', s, f"images[{im['id']}].alt", before, a))
    save(s, p)

# 2) D — cleaning 05 now shows the same 11/19 booking completed (no longer a separate 11/5 booking)
s = 'second-home-cleaning-app'; p = load(s)
cap = {'ko': '11월 19일 이용 완료와 후기', 'en': 'Completed November 19 visit and review', 'ja': '11月19日の利用完了とレビュー'}
for im in p['images']:
    if im['id'] == 'second-home-cleaning-app-05':
        LOG.append(('P1', s, f"images[{im['id']}].caption", dict(im['caption']), cap)); im['caption'] = dict(cap)
        alt = {'ko': '하루 클린 — ' + cap['ko'], 'en': 'Haru Clean — ' + cap['en'], 'ja': 'ハル・クリーン — ' + cap['ja']}
        LOG.append(('P1', s, f"images[{im['id']}].alt", dict(im['alt']), alt)); im['alt'] = alt
for k, b in enumerate(p['blocks']):
    if b['type'] == 'textImage':
        for j, bl in enumerate(b.get('bullets', [])):
            if bl['ko'] == '11월 5일 완료된 별도 이용 건과 후기':
                LOG.append(('P1', s, f'blocks[{k}].textImage.bullets[{j}]', dict(bl), cap)); b['bullets'][j] = dict(cap)
ov = {'ko': '20~29평 일반 홈클리닝 65,000원에 추가 옵션 25,000원을 더한 90,000원 예약을 설계했습니다. 11월 19일 오전 11시 방문 예약이 담당자 배정을 거쳐 이용 완료와 후기까지 이어집니다.',
      'en': 'The UI shows a KRW 90,000 booking: KRW 65,000 for standard cleaning plus KRW 25,000 in extras. The November 19, 11 AM visit carries through cleaner assignment to completion and a review.',
      'ja': '標準清掃65,000ウォンと追加25,000ウォンの合計90,000ウォンの予約を表現。11月19日11時の訪問予約が担当者割当を経て、利用完了とレビューまでつながります。'}
LOG.append(('P1', s, 'overview', dict(p['overview']), ov)); p['overview'] = ov
save(s, p)

# 3) D — language 01 now selects English (the practice sentences were English all along)
s = 'language-speaking-challenge-app'; p = load(s)
o = dict(p['overview'])
n = {'ko': o['ko'].replace('일본어 초급 학습자', '영어 초급 학습자'),
     'en': o['en'].replace('A beginner Japanese learner', 'A beginner English learner'),
     'ja': o['ja'].replace('日本語初級者', '英語初級者')}
assert all(n[l] != o[l] for l in n)
LOG.append(('P1', s, 'overview', o, n)); p['overview'] = n
save(s, p)

json.dump(LOG, open('/tmp/r4/fixlog.json', 'w'), ensure_ascii=False, indent=1)
print(len(LOG), 'changes')
