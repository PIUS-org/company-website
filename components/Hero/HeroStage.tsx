/* The two WebGL layers live outside <main> so they stack under the copy:
   hero background (scrolls with the hero) → 3D glass pieces (fixed) → content. */
import s from './Hero.module.css';
export default function HeroStage() {
  return (
    <>
      <canvas className={s.hero__gl} id="heroGL" aria-hidden="true" />
      <canvas className={s.bg3d} id="bgGL" aria-hidden="true" />
    </>
  );
}
