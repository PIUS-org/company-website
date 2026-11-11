# content/portfolio

프로젝트 하나 = 폴더 하나.

```
<slug>/project.json   콘텐츠 (한·영·일)
<slug>/images/        화면 이미지 원본
_template/            새 프로젝트 틀 (npm run portfolio:new -- <slug>)
```

- 이 폴더의 이미지는 공개 여부와 관계없이 여기에만 둡니다. 빌드할 때 **공개 승인된 프로젝트의 이미지만** `public/portfolio/`로 복사됩니다.
- 검사: `npm run portfolio:check`
- 자세한 내용: `docs/PORTFOLIO_CONTENT_GUIDE.md`, `docs/PORTFOLIO_SCHEMA.md`
