/** The guide's photo, or their initials on a colour picked from their name. */
const COLORS = ["bg-violet-600", "bg-primary-700", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-sky-600", "bg-fuchsia-600"];

export default function GuideAvatar({ name, photo, size = 44 }: { name: string; photo?: string | null; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
  const color = COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];
  const style = { width: size, height: size };
  // eslint-disable-next-line @next/next/no-img-element
  if (photo) return <img src={photo} alt={name} style={style} className="shrink-0 rounded-full object-cover" />;
  return (
    <span style={{ ...style, fontSize: Math.round(size * 0.32) }} className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color}`} aria-hidden>
      {initials}
    </span>
  );
}
