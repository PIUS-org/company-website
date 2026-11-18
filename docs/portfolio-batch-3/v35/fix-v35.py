"""v35 3차 품질 수정 — 카드 대표 화면, C실 상세 배치, D실 마무리 문장. 이미지 파일은 건드리지 않는다."""
import json, sys
ROOT = '/home/claude/work/content/portfolio' if len(sys.argv) < 2 else sys.argv[1]
LOG = []
def load(s): return json.load(open(f'{ROOT}/{s}/project.json'))
def save(s, p): open(f'{ROOT}/{s}/project.json', 'w').write(json.dumps(p, ensure_ascii=False, indent=2) + '\n')

# 1) card images: a screen that shows what is particular to each service (all existing core images)
THUMB = {
 # A — three hero pages share the same split layout: pair the hero with its own phone screen
 'boutique-hotel-booking': ['01', '05'], 'wellness-retreat-program': ['01', '05'], 'premium-interior-studio': ['01', '05'],
 # B — the action screen instead of the near-identical brand hero
 'private-clinic-brand-site': ['01', '05'], 'luxury-real-estate-showcase': ['03'], 'creator-membership-platform': ['03'],
 'nonprofit-donation-platform': ['03'], 'custom-furniture-configurator': ['02'],
 # C / D — home + the key action screen (two phones)
 'dog-walking-booking-app': ['01', '04'], 'local-fitness-class-app': ['01', '03'], 'home-cooking-subscription-app': ['01', '04'],
 'travel-itinerary-companion': ['01', '04'], 'used-fashion-market-app': ['01', '03'], 'parenting-care-record-app': ['01', '04'],
 'language-speaking-challenge-app': ['01', '04'], 'second-home-cleaning-app': ['01', '02'], 'beauty-appointment-app': ['01', '03'],
 'neighborhood-community-app': ['01', '03'], 'mindful-journal-app': ['01', '04'], 'concert-fan-companion-app': ['01', '04'],
 # E — six hubs with the same sidebar/centre/panel frame: show each service's signature tool
 'creator-collab-workspace': ['04'], 'social-campaign-builder': ['02'], 'podcast-production-hub': ['02'],
 'online-course-studio': ['04'], 'wedding-planning-portal': ['03'], 'architecture-client-portal': ['03'],
}
for s, nums in THUMB.items():
    p = load(s); ids = {i['id'] for i in p['images']}
    new = [f'{s}-{n}' for n in nums]; assert all(x in ids for x in new), s
    if p['thumbnail'] != new:
        LOG.append(('P1', s, 'thumbnail', p['thumbnail'], new)); p['thumbnail'] = new; save(s, p)

# 2) C — four equal phones → the key action screen large, the other three beside it (existing 'focus' layout)
FOCUS = {'dog-walking-booking-app': '04', 'local-fitness-class-app': '03', 'home-cooking-subscription-app': '04',
         'travel-itinerary-companion': '04', 'used-fashion-market-app': '03', 'parenting-care-record-app': '04'}
for s, key in FOCUS.items():
    p = load(s)
    b = [x for x in p['blocks'] if x['type'] == 'screenShowcase'][0]
    assert b['layout'] == 'phones' and len(b['images']) == 4, s
    main = f'{s}-{key}'; rest = [i for i in b['images'] if i != main]
    old = (b['layout'], list(b['images']))
    b['layout'] = 'focus'; b['images'] = [main] + rest
    LOG.append(('P1', s, 'blocks.screenShowcase', old, (b['layout'], b['images']))); save(s, p)

# 3) D — statement: one sentence on each app's experience (the demo notice stays in scope)
ST = {
 'language-speaking-challenge-app': (
   '하루 10분 목표에서 시작해 듣고, 말하고, 고친 문장을 다시 말하는 짧은 반복이 연속 학습 기록으로 쌓이도록 했습니다.',
   'From a ten-minute daily goal, short loops of listening, speaking and repeating a corrected sentence build up into a visible learning streak.',
   '1日10分の目標から、聞く・話す・直した文をもう一度言う短い繰り返しが、続けた記録として積み重なるようにしました。'),
 'second-home-cleaning-app': (
   '평수와 옵션을 고르는 순간부터 금액이 보이고, 예약 뒤에는 담당자와 방문 단계를 한 화면에서 확인하도록 했습니다.',
   'The price shows from the moment you pick the home size and options, and after booking the assigned cleaner and visit stages stay on one screen.',
   '広さとオプションを選んだ時点から金額が見え、予約後は担当者と訪問の進み具合を一つの画面で確認できるようにしました。'),
 'beauty-appointment-app': (
   '사진으로 스타일을 고르고, 그 스타일을 만든 디자이너의 포트폴리오에서 바로 시술과 시간을 예약하는 흐름입니다.',
   'You pick a style from photos, then book the service and time straight from the portfolio of the designer behind it.',
   '写真でスタイルを選び、そのスタイルを手がけたデザイナーのポートフォリオから施術と時間をそのまま予約する流れです。'),
 'neighborhood-community-app': (
   '동네 소식과 모임을 한 흐름으로 묶어, 글을 읽다가 모임을 발견하고 참여 신청까지 이어지게 했습니다.',
   'Local posts and meetups share one feed, so reading neighbourhood news can lead straight to finding a group and asking to join.',
   '近所の投稿と集まりを一つの流れにまとめ、記事を読むうちに集まりを見つけて参加申請まで進めるようにしました。'),
 'mindful-journal-app': (
   '감정 하나를 고르는 가벼운 체크인에서 시작해, 쌓인 기록을 달력과 주간 분포로 차분히 돌아보게 했습니다.',
   'It starts with a light check-in of a single mood, then lets you look back calmly on the entries through a calendar and a weekly breakdown.',
   '気分を一つ選ぶ軽いチェックインから始め、たまった記録をカレンダーと週ごとの分布で落ち着いて振り返れるようにしました。'),
 'concert-fan-companion-app': (
   '공연을 찾고 좌석을 확인한 뒤, 티켓과 팬들의 준비 이야기를 같은 앱에서 이어 보는 공연 전후의 경험을 담았습니다.',
   'It covers the time around a show: finding the concert and checking the seat, then keeping the ticket and fans’ preparation posts in the same app.',
   '公演を探して座席を確かめ、チケットとファンの準備の投稿を同じアプリで続けて見られる、公演前後の体験をまとめました。'),
}
for s, (ko, en, ja) in ST.items():
    p = load(s); b = [x for x in p['blocks'] if x['type'] == 'statement'][0]
    old = dict(b['text']); b['text'] = {'ko': ko, 'en': en, 'ja': ja}
    LOG.append(('P1', s, 'blocks.statement.text', old, b['text'])); save(s, p)

# 4) C·E — the cover message repeated p.overview, which the overview block prints right below it
#    (C: card summary == overview in the source; E: subtitle == summary, so overview had been used).
#    A short cover line drawn from each project's own screens and flow replaces it.
HEAD = {
 'dog-walking-booking-app': ('워커를 고르고, 산책을 예약하고, 진행 상황까지 확인합니다.', 'Choose a walker, book the walk and check how it is going.', '散歩スタッフ選びから予約、散歩の進み具合の確認まで。'),
 'local-fitness-class-app': ('동네 클래스를 찾고, 남은 자리를 확인하고, 내 일정으로 관리하기까지.', 'Find a class nearby, check the places left and keep it in your schedule.', '近くのクラスを探し、残席を確かめ、自分の予定として管理するまで。'),
 'home-cooking-subscription-app': ('메뉴를 고르면 인분·횟수·배송일까지 한 번에 정리되는 구독.', 'Pick the dishes, and servings, frequency and delivery day fall into place.', 'メニューを選べば、人数・回数・配送日まで一度に整う定期便。'),
 'travel-itinerary-companion': ('여행 카드 한 장에서 시작해 일정, 장소, 당일 체크까지.', 'From one trip card to the day plan, saved places and on-the-day checks.', '旅のカード一枚から、日程、スポット、当日のチェックまで。'),
 'used-fashion-market-app': ('마음에 드는 물건을 발견하고, 판매자에게 묻고, 내 옷을 내놓기까지.', 'Discover a piece, ask the seller about it and list one of your own.', '気に入った一品を見つけ、出品者に尋ね、自分の服を出品するまで。'),
 'parenting-care-record-app': ('수유와 수면을 몇 번의 탭으로 남기고, 가족이 함께 돌아보는 기록.', 'Log feeds and sleep in a few taps, then look back on them together as a family.', '授乳と睡眠を数タップで残し、家族で一緒に振り返る記録。'),
 'creator-collab-workspace': ('브리프에서 핀 코멘트, 모바일 승인까지 하나의 작업 공간에서.', 'From the brief to pinned comments and mobile approval, in one workspace.', 'ブリーフからピン留めコメント、モバイル承認まで一つのワークスペースで。'),
 'social-campaign-builder': ('플로우 캔버스와 캘린더 위에서 소재를 편집하고 버전별로 검수합니다.', 'Edit assets on a flow canvas and a calendar, and review them version by version.', 'フローキャンバスとカレンダーの上で素材を編集し、版ごとに確認します。'),
 'podcast-production-hub': ('멀티트랙 타임라인과 대본, 구간 코멘트를 한 화면에서.', 'The multitrack timeline, script and timecoded comments on one screen.', 'マルチトラックのタイムライン、台本、区間コメントを一つの画面で。'),
 'online-course-studio': ('커리큘럼을 짜고, 레슨과 퀴즈를 편집하고, 수강생 화면으로 미리 봅니다.', 'Build the curriculum, edit lessons and quizzes, and preview them as a learner.', 'カリキュラムを組み、レッスンとクイズを編集し、受講者の画面で確かめます。'),
 'wedding-planning-portal': ('준비 일정, 업체 견적 비교, 제안서와 계약 검토를 한곳에서.', 'The planning timeline, vendor quote comparison, proposals and contracts in one place.', '準備の日程、業者の見積比較、提案書と契約の確認を一か所で。'),
 'architecture-client-portal': ('공간 시안과 2D 평면에 핀으로 의견을 남기고, 결정과 승인을 기록합니다.', 'Pin comments on concepts and 2D plans, and keep a record of decisions and approvals.', '空間案と2D平面にピンでコメントを残し、決定と承認を記録します。'),
}
for s, (ko, en, ja) in HEAD.items():
    p = load(s); b = [x for x in p['blocks'] if x['type'] == 'cover'][0]
    if b['headline'] == {'ko': ko, 'en': en, 'ja': ja}: continue
    assert b['headline']['ko'] == p['overview']['ko'], s
    old = dict(b['headline']); b['headline'] = {'ko': ko, 'en': en, 'ja': ja}
    LOG.append(('P1', s, 'blocks.cover.headline', old, b['headline'])); save(s, p)

# 5) E — the six statements were one shared sentence about "a self-made UX/UI demo".
#    Each now names that service's own signature screen (all visible in its images).
EST = {
 'creator-collab-workspace': ('브리프와 시안, 핀으로 남긴 의견과 승인이 한 화면에 모여 누가 무엇을 결정했는지 바로 보이도록 했습니다.', 'Briefs, drafts, pinned comments and approvals sit on one screen, so it is always clear who decided what.', 'ブリーフ、案、ピン留めのコメント、承認が一つの画面に集まり、誰が何を決めたかがすぐに分かります。'),
 'social-campaign-builder': ('채널별 소재가 캘린더와 플로우 위에 놓여, 무엇이 언제 어떤 상태로 나가는지 한눈에 따라갈 수 있습니다.', 'Each channel’s assets sit on the calendar and the flow, so you can follow what goes out, when, and in what state.', 'チャネルごとの素材がカレンダーとフローの上に並び、何がいつどの状態で出るのかを一目で追えます。'),
 'podcast-production-hub': ('파형과 대본, 타임코드 코멘트가 같은 시간축에 맞춰져 고칠 구간을 바로 찾아 들을 수 있습니다.', 'Waveforms, script and timecoded comments share one timeline, so the part to fix can be found and heard right away.', '波形、台本、タイムコード付きコメントが同じ時間軸にそろい、直す箇所をすぐに見つけて聴けます。'),
 'online-course-studio': ('강사가 편집하는 레슨과 퀴즈를 수강생이 보게 될 화면 그대로 바로 확인할 수 있습니다.', 'Instructors can check the lessons and quizzes they edit exactly as learners will see them.', '講師が編集するレッスンとクイズを、受講者が見る画面のまま確かめられます。'),
 'wedding-planning-portal': ('남은 일정과 업체 견적, 제안서와 계약이 나란히 놓여 두 사람이 같은 정보를 보며 결정할 수 있습니다.', 'Upcoming milestones, vendor quotes, proposals and contracts sit side by side, so the couple decide from the same information.', '残りの日程、業者の見積、提案書と契約が並び、二人が同じ情報を見ながら決められます。'),
 'architecture-client-portal': ('평면 위의 핀 하나가 의견이 되고, 변경 전후 비교와 승인 기록으로 이어져 결정의 근거가 남습니다.', 'A pin on the plan becomes a comment, then a before-and-after comparison and an approval, so each decision keeps its reasoning.', '平面上のピン一つがコメントになり、変更前後の比較と承認記録につながって、決定の根拠が残ります。'),
}
for s, (ko, en, ja) in EST.items():
    p = load(s); b = [x for x in p['blocks'] if x['type'] == 'statement'][0]
    if b['text'] == {'ko': ko, 'en': en, 'ja': ja}: continue
    old = dict(b['text']); b['text'] = {'ko': ko, 'en': en, 'ja': ja}
    LOG.append(('P1', s, 'blocks.statement.text', old, b['text'])); save(s, p)

# 6) B·E captions — every caption carried the same disclaimer tail (B: "…자체 UI 데모", E: "편집·검토 상태와 연결된…
#    데모 화면") and E a "02." prefix, so the figcaptions read as one repeated sentence. Keep the screen name only,
#    as A/C/D do. The demo scope stays stated once in each project's scope block. fintech-02 KO label matched to EN/JA.
import re
B_E = ['private-clinic-brand-site', 'luxury-real-estate-showcase', 'fintech-product-landing', 'creator-membership-platform',
       'nonprofit-donation-platform', 'custom-furniture-configurator', 'creator-collab-workspace', 'social-campaign-builder',
       'podcast-production-hub', 'online-course-studio', 'wedding-planning-portal', 'architecture-client-portal']
for s in B_E:
    p = load(s); ch = False
    for im in p['images']:
        old = dict(im['caption']); new = {}
        for lg in ('ko', 'en', 'ja'):
            t = old[lg].split(' — ')[0].strip()
            new[lg] = re.sub(r'^\d{2}\.\s*', '', t)
        if im['id'] == 'fintech-product-landing-02': new['ko'] = '거래 관리 기능'
        if new != old:
            im['caption'] = new; ch = True
            LOG.append(('P1', s, f"images[{im['id']}].caption", old, new))
    if ch: save(s, p)

# 7) E cards — summary was the same sentence as the subtitle, so each card printed it twice.
ESUM = {
 'creator-collab-workspace': ('콘텐츠 브리프 편집, 산출물 리뷰, 핀 코멘트 검토와 모바일 최종 승인 화면.', 'Brief editing, deliverable review, pinned-comment review and final approval on mobile.', 'ブリーフ編集、成果物レビュー、ピン留めコメント確認、モバイルでの最終承認の画面。'),
 'social-campaign-builder': ('플로우 캔버스, 콘텐츠 캘린더, 소재 편집, 버전별 승인과 게시 예정 화면.', 'A flow canvas, content calendar, asset editor, version approvals and scheduled posts.', 'フローキャンバス、投稿カレンダー、素材編集、版ごとの承認、公開予定の画面。'),
 'podcast-production-hub': ('에피소드 워크스페이스, 멀티트랙 타임라인, 대본·쇼 노트, 구간 리뷰와 모바일 검수 화면.', 'Episode workspace, multitrack timeline, script and show notes, segment review and a mobile check.', 'エピソード管理、マルチトラック編集、台本とショーノート、区間レビュー、モバイル確認の画面。'),
 'online-course-studio': ('커리큘럼·레슨·퀴즈 편집과 수강생 미리보기, 모바일 수강 화면.', 'Curriculum, lesson and quiz editing with a learner preview and a mobile lesson view.', 'カリキュラム・レッスン・クイズの編集と、受講者プレビュー、モバイル受講画面。'),
 'wedding-planning-portal': ('준비 홈과 일정 관리, 업체 견적 비교, 제안서·계약 검토, 예식 당일 타임라인 화면.', 'Planning home, timeline, vendor quote comparison, proposal and contract review, and a wedding-day schedule.', '準備ホーム、日程管理、業者の見積比較、提案書・契約確認、当日のタイムラインの画面。'),
 'architecture-client-portal': ('프로젝트 개요, 공간 시안 갤러리, 2D 핀 피드백, 결정·승인 기록과 모바일 진행 화면.', 'Project overview, concept gallery, pinned feedback on 2D plans, decision log and mobile progress.', 'プロジェクト概要、空間案ギャラリー、2D平面へのピンコメント、決定・承認記録、モバイル進捗の画面。'),
}
for s, (ko, en, ja) in ESUM.items():
    p = load(s)
    if p['summary'] == {'ko': ko, 'en': en, 'ja': ja}: continue
    assert p['summary'] == p['subtitle'], s
    old = dict(p['summary']); p['summary'] = {'ko': ko, 'en': en, 'ja': ja}
    LOG.append(('P1', s, 'summary', old, p['summary'])); save(s, p)

json.dump(LOG, open('/tmp/v35/fixlog.json', 'w'), ensure_ascii=False, indent=1)
print('changes', len(LOG))
