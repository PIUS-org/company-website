"""v38 — 3차 A·B실 textImage(데스크톱 1장)를 imageRight → full 로.
옆 열(약 720~880px @1440)에서는 객실·가격·옵션 표 글자가 7px 안팎으로 작아짐 → 콘텐츠 폭 전체(약 1256px @1440).
기존 layout 값만 사용(스키마 추가 없음). 이미지·문구·순서 변경 없음. 1·2차는 건드리지 않음."""
import json
LOG=[]
order=open('/tmp/v35/order.txt').read().split()
for s in order[:12]:
    f=f'content/portfolio/{s}/project.json'; p=json.load(open(f,encoding='utf-8'))
    kinds={i['id']:i['kind'] for i in p['images']}
    for k,b in enumerate(p['blocks']):
        if b['type']=='textImage' and b.get('layout')=='imageRight' and all(kinds[x]=='desktop' for x in b['images']):
            LOG.append((s,f'blocks[{k}].layout','imageRight','full')); b['layout']='full'
    with open(f,'w',encoding='utf-8') as o: json.dump(p,o,ensure_ascii=False,indent=2); o.write('\n')
json.dump(LOG,open('/tmp/r6/fixlog.json','w'),ensure_ascii=False,indent=1); print(len(LOG))
