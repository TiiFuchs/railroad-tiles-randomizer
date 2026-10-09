<template>
  <header class="hero">
    <div class="logo">
      <svg viewBox="0 0 600 260" aria-hidden="true">
        <path id="cartouche" class="outer" d="M60,40 H240 Q270,40 300,6 Q330,40 360,40 H540 Q560,40 560,60 Q540,75 540,95 V165 Q540,185 560,200 Q560,220 540,220 H360 Q330,220 300,254 Q270,220 240,220 H60 Q40,220 40,200 Q60,185 60,165 V95 Q60,75 40,60 Q40,40 60,40 Z" />
        <path class="inner" d="M60,40 H240 Q270,40 300,6 Q330,40 360,40 H540 Q560,40 560,60 Q540,75 540,95 V165 Q540,185 560,200 Q560,220 540,220 H360 Q330,220 300,254 Q270,220 240,220 H60 Q40,220 40,200 Q60,185 60,165 V95 Q60,75 40,60 Q40,40 60,40 Z" transform="translate(300 130) scale(.95 .9) translate(-300 -130)" />
      </svg>
      <div class="words">
        <span class="title">Railroad</span>
        <span class="sub">Tiles</span>
        <span class="tagline">Randomizer</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero { padding: 20px 12px 8px; display: grid; place-items: center; }
.logo { position: relative; width: min(520px, 92vw); aspect-ratio: 600 / 260; container-type: inline-size; filter: drop-shadow(0 5px 0 rgba(217, 138, 61, .55)); }
.logo svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.outer { fill: #fff; stroke: var(--navy); stroke-width: 3; stroke-linejoin: round; }
.inner { fill: none; stroke: var(--blue); stroke-width: 1.5; stroke-linejoin: round; }
.words { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; gap: 1.5cqw; }
.title { font-family: 'Limelight', Georgia, serif; font-size: 10.5cqw; color: var(--navy); text-transform: uppercase; letter-spacing: .02em; }
.sub { font-family: 'Josefin Sans', sans-serif; font-weight: 700; color: var(--orange); font-size: 7.5cqw; letter-spacing: .06em; text-transform: uppercase; }
.tagline { font-family: 'Josefin Sans', sans-serif; font-weight: 700; font-size: 2.6cqw; letter-spacing: .45em; margin-right: -.45em; color: var(--blue); text-transform: uppercase; }
</style>
