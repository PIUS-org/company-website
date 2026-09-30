/* Logo pieces as SVG fragments (vectors from the original .ai) */
import { MARK, WORD, TAG_SVG } from '@/lib/logo';

export const MarkPaths = () => <>{MARK.map((d, i) => <path key={i} d={d} />)}</>;
export const WordPaths = () => <>{WORD.map((d, i) => <path key={i} d={d} />)}</>;
export const TagPaths = () => <g dangerouslySetInnerHTML={{ __html: TAG_SVG }} />;
/** mark + wordmark lockup (no tagline) — viewBox LOCKUP_VB */
export const LockupPaths = () => (<><MarkPaths /><g transform="translate(333 273)"><WordPaths /></g></>);
