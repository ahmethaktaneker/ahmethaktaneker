import { Reveal } from "@/components/motion/reveal";
import { AmbientGlow } from "@/components/motion/ambient-glow";
import { getPodcastEpisodes } from "@/lib/content";

export const metadata = { title: "Podcast — Ahmet Haktan Eker" };

const dateFmt = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

export default function PodcastPage() {
  const episodes = getPodcastEpisodes();

  return (
    <div className="relative mx-auto w-full max-w-[820px] overflow-hidden px-6 py-24 sm:px-16 sm:py-32">
      <AmbientGlow />
      <Reveal as="p" className="text-xs uppercase tracking-[0.2em] text-primary">
        Podcast
      </Reveal>
      <Reveal
        as="h1"
        variant="line"
        delay={0.1}
        className="mt-5 font-display text-4xl leading-tight text-on-surface sm:text-6xl"
      >
        Sesli yazılar.
      </Reveal>

      <ul className="mt-16 flex flex-col gap-8">
        {episodes.map((episode, i) => (
          <li key={episode.slug}>
            <Reveal
              variant="fade-up"
              delay={Math.min(i * 0.08, 0.4)}
              className="rounded-sm border border-outline-variant/20 bg-surface p-7 transition-colors duration-250 hover:border-primary/40"
            >
              <span className="text-xs uppercase tracking-[0.15em] text-primary">
                {dateFmt(episode.date)}
              </span>
              <h2 className="mt-3 font-display text-2xl text-on-surface">{episode.title}</h2>
              <p className="mt-3 text-on-surface-variant">{episode.excerpt}</p>
              <div className="mt-6 overflow-hidden rounded-sm">
                {episode.platform === "spotify" ? (
                  <iframe
                    className="w-full"
                    height={152}
                    src={`https://open.spotify.com/embed/episode/${episode.embedId}`}
                    title={episode.title}
                    loading="lazy"
                    allow="encrypted-media"
                  />
                ) : (
                  <div className="aspect-video w-full bg-surface-high">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${episode.embedId}`}
                      title={episode.title}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
