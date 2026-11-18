"""Build content/portfolio/<slug>/project.json for the 30 R3 projects from the parsed workroom prompts."""
import json, re, os, shutil, glob, colorsys

ROOT = '/home/claude/work/content/portfolio'
P = json.load(open('/tmp/r3/gen/parsed.json'))
LOG = []  # (slug, field, before, after, reason)

def L(ko, en, ja): return {'ko': ko, 'en': en, 'ja': ja}

# ---- per-project choices (UI accent picked from each project's own buttons/brand marks) ----
ACCENT = {
 'boutique-hotel-booking': '#514132', 'wellness-retreat-program': '#364A3A', 'premium-interior-studio': '#373A38',
 'skincare-brand-experience': '#835D53', 'art-fair-ticketing': '#2D40D4', 'design-conference-portal': '#E34521',
 'private-clinic-brand-site': '#5B4E3C', 'luxury-real-estate-showcase': '#2F3B33', 'fintech-product-landing': '#1F4E4F',
 'creator-membership-platform': '#5A3F6B', 'nonprofit-donation-platform': '#2F5D43', 'custom-furniture-configurator': '#3B4A3F',
 'dog-walking-booking-app': '#2E6A55', 'local-fitness-class-app': '#D2502B', 'home-cooking-subscription-app': '#4C7A3C',
 'travel-itinerary-companion': '#1C5A78', 'used-fashion-market-app': '#2B2B2B', 'parenting-care-record-app': '#9A6C45',
 'language-speaking-challenge-app': '#5B47D6', 'second-home-cleaning-app': '#2A7A6E', 'beauty-appointment-app': '#B4685A',
 'neighborhood-community-app': '#2F7A4E', 'mindful-journal-app': '#8E7BB0', 'concert-fan-companion-app': '#6C55D8',
 'creator-collab-workspace': '#3F6E66', 'social-campaign-builder': '#C2673D', 'podcast-production-hub': '#6B5BB5',
 'online-course-studio': '#4C63A8', 'wedding-planning-portal': '#8A6347', 'architecture-client-portal': '#4F7A72',
}
LAYOUT = {
 'boutique-hotel-booking': 'editorial', 'wellness-retreat-program': 'split', 'premium-interior-studio': 'editorial',
 'skincare-brand-experience': 'rail', 'art-fair-ticketing': 'split', 'design-conference-portal': 'rail',
 'private-clinic-brand-site': 'split', 'luxury-real-estate-showcase': 'editorial', 'fintech-product-landing': 'rail',
 'creator-membership-platform': 'split', 'nonprofit-donation-platform': 'editorial', 'custom-furniture-configurator': 'rail',
 'dog-walking-booking-app': 'split', 'local-fitness-class-app': 'rail', 'home-cooking-subscription-app': 'split',
 'travel-itinerary-companion': 'rail', 'used-fashion-market-app': 'split', 'parenting-care-record-app': 'rail',
 'language-speaking-challenge-app': 'rail', 'second-home-cleaning-app': 'split', 'beauty-appointment-app': 'rail',
 'neighborhood-community-app': 'split', 'mindful-journal-app': 'rail', 'concert-fan-companion-app': 'split',
 'creator-collab-workspace': 'split', 'social-campaign-builder': 'rail', 'podcast-production-hub': 'editorial',
 'online-course-studio': 'split', 'wedding-planning-portal': 'editorial', 'architecture-client-portal': 'rail',
}
DARK = {'concert-fan-companion-app'}
INDUSTRY = {  # ko from the workroom; en/ja translated here (the prompts give ko only)
 '호텔 예약': ('Hotel booking', 'ホテル予約'), '웰니스 리트릿': ('Wellness retreat', 'ウェルネスリトリート'),
 '인테리어 스튜디오': ('Interior design studio', 'インテリアスタジオ'), '스킨케어 브랜드': ('Skincare brand', 'スキンケアブランド'),
 '아트페어 티켓팅': ('Art fair ticketing', 'アートフェアのチケット販売'), '디자인 컨퍼런스': ('Design conference', 'デザインカンファレンス'),
 '클리닉': ('Private clinic', 'クリニック'), '부동산': ('Residential real estate', '不動産'), '핀테크': ('Fintech', 'フィンテック'),
 '크리에이터': ('Creator membership', 'クリエイター'), '후원': ('Donations and nonprofits', '寄付・非営利'), '가구': ('Furniture', '家具'),
 '언어 교육': ('Language learning', '語学教育'), '생활 서비스': ('Home services', '生活サービス'), '뷰티 예약': ('Beauty booking', 'ビューティー予約'),
 '지역 커뮤니티': ('Local community', '地域コミュニティ'), '마음 기록': ('Mood journaling', '感情記録'), '공연·팬덤': ('Live music and fandom', '公演・ファンダム'),
 '크리에이터·브랜드 콘텐츠': ('Creator and brand content', 'クリエイター・ブランドコンテンツ'), '마케팅·광고': ('Marketing and advertising', 'マーケティング・広告'),
 '미디어·팟캐스트': ('Media and podcasts', 'メディア・ポッドキャスト'), '에듀테크': ('Edtech', 'エドテック'), '웨딩·이벤트': ('Weddings and events', 'ウェディング・イベント'),
 '건축·인테리어': ('Architecture and interiors', '建築・インテリア'),
}
C_INDUSTRY = {  # C gives one generic industry for all six; the service itself is more useful
 'dog-walking-booking-app': L('반려견 산책 예약', 'Dog walking booking', '犬の散歩予約'),
 'local-fitness-class-app': L('지역 피트니스 클래스', 'Local fitness classes', '地域フィットネスクラス'),
 'home-cooking-subscription-app': L('밀키트 정기 구독', 'Meal-kit subscription', 'ミールキット定期便'),
 'travel-itinerary-companion': L('여행 일정 관리', 'Travel itineraries', '旅行日程管理'),
 'used-fashion-market-app': L('중고 패션 거래', 'Pre-loved fashion resale', '中古ファッション売買'),
 'parenting-care-record-app': L('육아 기록', 'Parenting records', '育児記録'),
}
# English/Japanese alt/caption fragments that the workroom templates left in Korean
KO_EN = {
 '가든 스위트': 'Garden Suite', '숲의 리듬 · 3박 4일': 'Forest Rhythm · 3 nights, 4 days', '한남동 레지던스': 'Hannam-dong Residence',
 '밸런싱 세럼 · 30ml': 'Balancing Serum · 30ml', '일반 입장권': 'General admission', '일반 패스 · 2일': 'General pass · 2 days',
 '호텔 예약': 'hotel booking', '웰니스 리트릿': 'wellness retreat', '인테리어 스튜디오': 'interior studio', '스킨케어 브랜드': 'skincare brand',
 '아트페어 티켓팅': 'art fair ticketing', '디자인 컨퍼런스': 'design conference',
}
E_DEMO = {  # E: the fictional project shown inside each workspace
 '그린티 세럼 브랜드 필름': ('Green Tea Serum Brand Film', 'グリーンティーセラム・ブランドフィルム'),
 '윈터 컬렉션 론칭': ('Winter Collection Launch', 'ウィンターコレクション・ローンチ'),
 '작은 브랜드의 큰 선택': ('Big Choices for Small Brands', '小さなブランドの大きな選択'),
 '좋은 인터페이스를 만드는 법': ('How to Make a Good Interface', '良いインターフェースのつくり方'),
 '서연 & 지훈의 결혼 준비': ('Seoyeon & Jihoon’s Wedding Planning', 'ソヨン＆ジフンの結婚準備'),
 '한남 리빙룸 리노베이션': ('Hannam Living Room Renovation', '漢南リビングルーム・リノベーション'),
}
H = {
 'overview': L('프로젝트 개요', 'Project overview', 'プロジェクト概要'),
 'features': L('대표 기능', 'Key features', '主な機能'),
 'flow': L('이용 흐름', 'User flow', '利用の流れ'),
 'screens': L('주요 화면', 'Key screens', '主要画面'),
 'more': L('이어지는 화면', 'More screens', 'その他の画面'),
 'mobile': L('모바일 화면', 'Mobile screens', 'モバイル画面'),
 'scope': L('제작 범위', 'Demo scope', '制作範囲'),
}
EYEBROW = L('PIUS 자체 UI 데모', 'PIUS UI concept demo', 'PIUS自主UIデモ')
SCOPE_KEYS = [{'key': 'ui'}, {'key': 'frontend', 'label': L('정적 프론트엔드 화면', 'Static front-end screens', '静的フロントエンド画面')}]

def ink(hexc):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    r, g, b = colorsys.hls_to_rgb(h, 0.14, min(s, 0.45))
    return '#%02X%02X%02X' % (round(r * 255), round(g * 255), round(b * 255))

def split_list(t, sep):
    out = [re.sub(r'^and\s+', '', x.strip().rstrip('.。')) for x in re.split(sep, t) if x.strip()]
    return [x[:1].upper() + x[1:] if re.match(r'[a-z]', x) else x for x in out]

def steps(T):
    out = []
    parts = {lg: [x.strip().rstrip('.。') for x in T[lg]['userFlow'].split('→')] for lg in T}
    parts['en'] = [x[:1].upper() + x[1:] for x in parts['en']]
    n = len(parts['ko']); assert all(len(v) == n for v in parts.values()), parts
    return [{'title': L(parts['ko'][i], parts['en'][i], parts['ja'][i])} for i in range(n)]

def bullets(T, key, sep):
    parts = {lg: split_list(T[lg][key], sep) for lg in T}
    n = len(parts['ko']); assert all(len(v) == n for v in parts.values()), (key, parts)
    return [L(parts['ko'][i], parts['en'][i], parts['ja'][i]) for i in range(n)]

def fix_text(slug, lg, kind, t):
    t0 = t
    if P[slug]['wr'] == 'A' and lg == 'en':
        for k in sorted(KO_EN, key=len, reverse=True): t = t.replace(k, KO_EN[k])
        t = re.sub(r'· (Desktop|Mobile) (\w[\w ]*?) experience', lambda m: f'· {m.group(1)} {m.group(2)} experience', t)
    if P[slug]['wr'] == 'B' and lg == 'ko':
        t = t.replace('. 단계의', ' 단계의')
    if P[slug]['wr'] == 'E':
        for k, (en, ja) in E_DEMO.items():
            if lg == 'en': t = t.replace(f'showing the {k} demo workspace', f'showing the demo project “{en}”')
            if lg == 'ja': t = t.replace(f'「{k}」', f'「{ja}」')
        if lg == 'en': t = t.replace('annotated 2d plan', 'annotated 2D plan')
    if t != t0: LOG.append((slug, f'{kind}.{lg}', t0, t, 'workroom template left a Korean fragment / stray period'))
    return t

ORDER_SEQ = []
wr = {w: [s for s, p in P.items() if p['wr'] == w] for w in 'ABCDE'}
for i in range(6):
    for w in 'ACBDE': ORDER_SEQ.append(wr[w][i])

def build(slug):
    p = P[slug]; W = p['wr']; T = p['T']
    ims = p['images']; ids = [os.path.splitext(i['file'])[0] for i in ims]
    images = []
    for i, iid in zip(ims, ids):
        images.append({'id': iid, 'file': i['file'], 'kind': i['kind'],
                       'alt': {lg: fix_text(slug, lg, f'images.{iid}.alt', i[lg]['alt']) for lg in ('ko', 'en', 'ja')},
                       'caption': {lg: fix_text(slug, lg, f'images.{iid}.caption', i[lg]['caption']) for lg in ('ko', 'en', 'ja')},
                       'presentation': {'tier': 'core'}})
    g = lambda k: L(T['ko'][k], T['en'][k], T['ja'][k])
    for s_, old, new in [('social-campaign-builder', 'ソーシャルキャンペーンビルダー', 'ソーシャル・キャンペーン・ビルダー'), ('local-fitness-class-app', '地域フィットネスクラスアプリ', '地域フィットネス・クラスアプリ')]:
        if slug == s_:
            for holder in (T['ja'], p['name']):
                key = 'title' if 'title' in holder else 'ja'
                if holder.get(key) == old:
                    LOG.append((slug, 'title.ja', old, new, 'long katakana compound broke mid-word on the cover: word separator added'))
                    holder[key] = new
    # (art-fair-ticketing subtitle.ko: one word matched the client-name ban list and was reworded; the term is not recorded here)
    if W == 'A':
        title = p['name']; subtitle = g('title'); summary = g('cardSummary'); headline = g('subtitle')
        lead = g('problem'); overview = g('overview'); scope = g('scope'); closing = g('closing')
    elif W == 'B':
        title = g('title'); subtitle = g('subtitle'); summary = g('cardSummary'); headline = g('cardSummary')
        lead = g('problem'); overview = g('overview'); scope = g('scope'); closing = g('statement')
    elif W == 'C':
        title = p['name']; subtitle = g('subtitle'); summary = g('cardSummary'); headline = g('cardSummary')
        lead = g('problemAndSolution / services'); overview = g('overview'); scope = g('scope'); closing = g('statement')
    elif W == 'D':
        title = g('title'); subtitle = g('subtitle'); summary = g('cardSummary'); headline = g('cardSummary')
        lead = g('problem'); overview = g('overview'); scope = g('scope'); closing = g('statement')
    else:  # E: subtitle == card summary and overview == problem in the source
        title = g('title'); subtitle = g('subtitle'); summary = g('cardSummary')
        headline = g('overview')
        lead = L(*[' · '.join(split_list(T[lg]['features'], r'[,、]\s*|\s+and\s+')) for lg in ('ko', 'en', 'ja')])
        overview = g('overview'); scope = g('scope'); closing = g('statement')
    industry = C_INDUSTRY.get(slug) or L(p['industry_ko'], *INDUSTRY[p['industry_ko']])
    mobile_only = all(i['kind'] == 'mobile' for i in ims)
    main = p['cat']
    cats = [main] + [c for c in (['mobile'] if mobile_only else ['web']) if c != main]
    sec = lambda n, label: {'index': f'{n:02d}', 'label': label}
    blocks = [{'type': 'cover', 'eyebrow': EYEBROW, 'headline': headline, 'images': [ids[0]]}]
    n = 1
    def add(b, label):
        nonlocal n
        b = {'type': b.pop('type'), 'section': sec(n, label), **b}; blocks.append(b); n += 1
    add({'type': 'overview', 'heading': H['overview'], 'lead': lead}, 'OVERVIEW')
    if W == 'A':
        add({'type': 'screenShowcase', 'layout': 'desktop', 'surface': 'light', 'heading': H['screens'], 'images': [ids[1]]}, 'SCREENS')
        add({'type': 'textImage', 'layout': 'imageRight', 'heading': H['features'], 'bullets': bullets(T, 'keyFeatures', r'[,、]\s*'), 'images': [ids[2]]}, 'FEATURES')
        add({'type': 'screenShowcase', 'layout': 'desktop', 'heading': H['more'], 'images': [ids[3]]}, 'MORE SCREENS')
        add({'type': 'screenShowcase', 'layout': 'phones', 'surface': 'light', 'heading': H['mobile'], 'images': [ids[4]]}, 'MOBILE')
        add({'type': 'userFlow', 'heading': H['flow'], 'steps': steps(T)}, 'USER FLOW')
    elif W == 'B':
        add({'type': 'textImage', 'layout': 'imageRight', 'heading': H['features'], 'bullets': bullets(T, 'features', r'[,、]\s*'), 'images': [ids[1]]}, 'FEATURES')
        add({'type': 'userFlow', 'heading': H['flow'], 'steps': steps(T)}, 'USER FLOW')
        add({'type': 'screenShowcase', 'layout': 'desktop', 'surface': 'light', 'heading': H['screens'], 'images': [ids[2], ids[3]]}, 'SCREENS')
        add({'type': 'screenShowcase', 'layout': 'phones', 'heading': H['mobile'], 'images': [ids[4]]}, 'MOBILE')
    elif W == 'C':
        add({'type': 'userFlow', 'heading': H['flow'], 'steps': steps(T)}, 'USER FLOW')
        add({'type': 'screenShowcase', 'layout': 'phones', 'surface': 'light', 'heading': H['screens'], 'images': ids[1:5]}, 'SCREENS')
    elif W == 'D':
        add({'type': 'textImage', 'layout': 'imageRight', 'heading': H['features'], 'bullets': bullets(T, 'features', r'\s*/\s*'), 'images': [ids[1]]}, 'FEATURES')
        add({'type': 'userFlow', 'heading': H['flow'], 'steps': steps(T)}, 'USER FLOW')
        add({'type': 'screenShowcase', 'layout': 'phones', 'surface': 'light', 'heading': H['screens'], 'images': ids[2:5]}, 'SCREENS')
    else:
        add({'type': 'userFlow', 'heading': H['flow'], 'steps': steps(T)}, 'USER FLOW')
        add({'type': 'screenShowcase', 'layout': 'desktop', 'surface': 'light', 'heading': H['screens'], 'images': [ids[1], ids[2], ids[3]]}, 'SCREENS')
        add({'type': 'screenShowcase', 'layout': 'phones', 'heading': H['mobile'], 'images': [ids[4]]}, 'MOBILE')
    add({'type': 'scope', 'heading': H['scope'], 'note': scope}, 'DEMO SCOPE')
    blocks.append({'type': 'statement', 'section': sec(n, 'STATEMENT'), 'text': closing})
    proj = {
        'id': slug, 'slug': slug, 'status': 'review', 'visible': True, 'featured': False,
        'order': 450 + 10 * ORDER_SEQ.index(slug), 'includeInPdf': True,
        'title': title, 'subtitle': subtitle, 'summary': summary, 'overview': overview, 'industry': industry,
        'categories': cats, 'mainCategory': main,
        'platforms': [{'type': 'app'}] if mobile_only else [{'type': 'web'}],
        'scope': SCOPE_KEYS,
        'theme': {'accent': ACCENT[slug], 'accentInk': ink(ACCENT[slug]), 'cover': 'dark' if slug in DARK else 'light', 'layout': LAYOUT[slug]},
        'thumbnail': [ids[0]],
        'reviewNotes': [
            'PIUS 3차(batch-3) 자체 정적 UI 데모 — 실제 고객 수행 실적·운영 서비스·기능 구현 실적이 아님. 화면 속 인물·장소·금액·일정은 가상 데이터.',
            f'출처: PIUS_R3_A-E_CLAUDE_MASTER_HANDOFF_20261113 / {W}실 claude-integration-prompt.txt. 이미지 5장은 {W.lower()}-final-images.zip 원본 그대로(SHA-256 MANIFEST·QA CSV 일치).',
            '표지(01)는 본문에서 다시 쓰지 않음(같은 화면 중복 노출 방지). services 블록은 열마다 플랫폼·대상이 필수라 쓰지 않고 기능 목록은 textImage bullets로 둠.',
        ],
        'blocks': blocks, 'images': images,
    }
    return proj

if __name__ == '__main__':
    for slug in P:
        d = os.path.join(ROOT, slug); os.makedirs(os.path.join(d, 'images'), exist_ok=True)
        for i in P[slug]['images']:
            src = glob.glob(f'/tmp/r3/img/*/{i["file"]}')[0]
            shutil.copyfile(src, os.path.join(d, 'images', i['file']))
        open(os.path.join(d, 'project.json'), 'w').write(json.dumps(build(slug), ensure_ascii=False, indent=2) + '\n')
    json.dump(LOG, open('/tmp/r3/gen/textfix-log.json', 'w'), ensure_ascii=False, indent=1)
    print('built', len(P), 'text fixes', len(LOG))
