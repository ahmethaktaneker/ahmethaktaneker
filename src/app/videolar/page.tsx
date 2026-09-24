import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { AmbientGlow } from "@/components/motion/ambient-glow";
import { getVideos } from "@/lib/content";

export const metadata = { title: "Videolar — Ahmet Haktan Eker" };

export default function VideosPage() {
  const videos = getVideos();

  return (
    <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden px-6 py-24 sm:px-16 sm:py-32">
      <AmbientGlow />
      <Reveal as="p" className="text-xs uppercase tracking-[0.2em] text-primary">
        Videolar
      </Reveal>
      <Reveal
        as="h1"
        variant="line"
        delay={0.1}
        className="mt-5 font-display text-4xl leading-tight text-on-surface sm:text-6xl"
      >
        Görüntülü içerikler.
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
        {videos.map((video, i) => (
          <Reveal key={video.slug} variant="fade-up" delay={Math.min(i * 0.08, 0.32)}>
            <TiltCard maxTilt={4}>
              <div className="overflow-hidden rounded-sm border border-outline-variant/20 bg-surface-high transition-colors duration-250 group-hover:border-primary/40">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.embedId}`}
                    title={video.title}
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>
              <h2 className="mt-5 font-display text-xl text-on-surface">{video.title}</h2>
              <time className="mt-1 block text-sm text-on-surface-variant">
                {new Date(video.date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
