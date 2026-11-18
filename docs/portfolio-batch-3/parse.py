import re,json
X='/tmp/r3/x'
def blocks_by(text,pat):
    idx=[m.start() for m in re.finditer(pat,text,re.M)]+[len(text)]
    return [text[idx[i]:idx[i+1]] for i in range(len(idx)-1)]
out={}
def kv(seg,key):
    m=re.search(r'^\s*-?\s*'+re.escape(key)+r'\s*:\s*(.+)$',seg,re.M); return m.group(1).strip() if m else None
# ---- A
t=open(f'{X}/A/a-claude-integration-prompt.txt').read()
for seg in blocks_by(t,r'^### A-0\d / '):
    slug=re.match(r'### A-0\d / (\S+)',seg).group(1)
    names=kv(seg,'projectName').split(' / ')
    P=dict(wr='A',slug=slug,name=dict(zip(['ko','en','ja'],names)),industry_ko=kv(seg,'industry'),cat=kv(seg,'category'),T={})
    for lg in ['ko','en','ja']:
        s=seg.split(f'[{lg}]')[1].split('\n\n')[0]
        P['T'][lg]={k:kv(s,k) for k in ['title','subtitle','cardSummary','overview','problem','keyFeatures','userFlow','scope','closing']}
    P['images']=[]
    for im in blocks_by(seg,r'^image a\d\d-\d\d:'):
        d={'file':kv(im,'file'),'kind':kv(im,'kind')}
        for lg in ['ko','en','ja']: d[lg]={'alt':kv(im,f'{lg}.alt'),'caption':kv(im,f'{lg}.caption')}
        P['images'].append(d)
    out[slug]=P
# ---- B
t=open(f'{X}/B/b-claude-integration-prompt.txt').read()
for seg in blocks_by(t,r'^=== PROJECT B-0\d: '):
    slug=re.match(r'=== PROJECT B-0\d: (\S+)',seg).group(1)
    m=re.search(r'영문명: (.+?) / 한글명: (.+)',seg)
    ind=re.search(r'산업: (.+?) / 권장 카테고리: (\w+)',seg)
    P=dict(wr='B',slug=slug,name={'en':m.group(1),'ko':m.group(2)},industry_ko=ind.group(1),cat=ind.group(2),T={})
    for lg in ['ko','en','ja']:
        s=seg.split(f'[{lg} 콘텐츠]')[1].split('\n\n')[0]
        P['T'][lg]={k:kv(s,k) for k in ['title','subtitle','cardSummary','overview','problem','features','userFlow','scope','statement']}
    P['images']=[]
    for im in blocks_by(seg,r'^ID: '):
        d={'file':kv(im,'filename'),'kind':kv(im,'kind')}
        for lg in ['ko','en','ja']: d[lg]={'alt':kv(im,f'{lg}.alt'),'caption':kv(im,f'{lg}.caption')}
        P['images'].append(d)
    out[slug]=P
# ---- C
t=open(f'{X}/C/c-claude-integration-prompt.txt').read()
for seg in blocks_by(t,r'^## PROJECT '):
    slug=re.match(r'## PROJECT (\S+)',seg).group(1)
    P=dict(wr='C',slug=slug,name={'ko':kv(seg,'projectName'),'en':kv(seg,'englishName'),'ja':kv(seg,'japaneseName')},industry_ko=kv(seg,'industry'),cat=kv(seg,'category').split('`')[1],brand=kv(seg,'internalBrand'),T={})
    for lg in ['ko','en','ja']:
        s=seg.split(f'### Locale {lg}')[1].split('###')[0]
        P['T'][lg]={k:kv(s,k) for k in ['subtitle','cardSummary','overview','problemAndSolution / services','userFlow','scope','statement']}
    P['images']=[]
    for im in blocks_by(seg,r'^Image \d: '):
        d={'file':re.search(r'filename=`([^`]+)`',im).group(1),'kind':re.search(r'kind=`([^`]+)`',im).group(1)}
        for lg in ['ko','en','ja']: d[lg]={'alt':kv(im,f'{lg} alt'),'caption':kv(im,f'{lg} caption')}
        P['images'].append(d)
    out[slug]=P
# ---- D
t=open(f'{X}/D/d-claude-integration-prompt.txt').read()
t=t.split('## Claude의 필수')[0]
for seg in blocks_by(t,r'^## \d\. '):
    slug=re.match(r'## \d\. (\S+)',seg).group(1)
    names=kv(seg,'프로젝트명').split(' / ')
    P=dict(wr='D',slug=slug,name=dict(zip(['ko','en','ja'],names)),industry_ko=kv(seg,'산업'),cat='mobile',T={'ko':{},'en':{},'ja':{}})
    for lg in ['ko','en','ja']:
        for k in ['title','subtitle','cardSummary','overview','problem','userFlow','features','scope','statement']:
            m=re.search(r'^\['+lg+r'\] '+k+r': (.+)$',seg,re.M); P['T'][lg][k]=m.group(1).strip() if m else None
    P['images']=[]
    for im in blocks_by(seg,r'^IMAGE id='):
        d={'file':re.search(r'filename=(\S+)',im).group(1),'kind':re.search(r'kind=(\w+)',im).group(1)}
        for lg in ['ko','en','ja']:
            d[lg]={'alt':re.search(r'^\['+lg+r'\] alt: (.+)$',im,re.M).group(1).strip(),'caption':re.search(r'^\['+lg+r'\] caption: (.+)$',im,re.M).group(1).strip()}
        P['images'].append(d)
    out[slug]=P
# ---- E
t=open(f'{X}/E/e-claude-integration-prompt.txt').read().split('## 수행할 실제')[0]
for seg in blocks_by(t,r'^## PROJECT E-0\d'):
    slug=re.match(r'## PROJECT E-0\d — (\S+)',seg).group(1)
    P=dict(wr='E',slug=slug,name={'ko':kv(seg,'한글명'),'en':kv(seg,'영문명')},industry_ko=kv(seg,'산업'),cat=kv(seg,'카테고리 후보').split()[0],T={})
    for lg,hd in [('ko','### ko 전체 콘텐츠'),('en','### en 전체 콘텐츠'),('ja','### ja 전체 콘텐츠')]:
        s=seg.split(hd)[1].split('###')[0]
        P['T'][lg]={'title':kv(s,'제목'),'subtitle':kv(s,'부제'),'cardSummary':kv(s,'목록 카드 요약'),'overview':kv(s,'개요'),'problem':kv(s,'해결 과제'),
                    'features':kv(s,'핵심 기능(services)'),'userFlow':kv(s,'업무 흐름(userFlow)'),'scope':kv(s,'제작 범위(scope)'),'statement':kv(s,'마무리 문구(statement)')}
    P['images']=[]
    for im in blocks_by(seg,r'^- 이미지 ID: '):
        d={'file':kv(im,'파일명'),'kind':kv(im,'kind').split()[0]}
        for lg in ['ko','en','ja']: d[lg]={'alt':kv(im,f'alt.{lg}'),'caption':kv(im,f'caption.{lg}')}
        P['images'].append(d)
    out[slug]=P
json.dump(out,open('/tmp/r3/gen/parsed.json','w'),ensure_ascii=False,indent=1)
# sanity
miss=[]
for s,P in out.items():
    assert len(P['images'])==5,(s,len(P['images']))
    for lg in ['ko','en','ja']:
        for k,v in P['T'][lg].items():
            if not v: miss.append((s,lg,k))
        for i in P['images']:
            if not i[lg]['alt'] or not i[lg]['caption']: miss.append((s,lg,i['file']))
print(len(out),'projects; missing:',miss)
