import { CalendarDaysIcon, HeartIcon, SparklesIcon } from "lucide-react"

const reasons = [
  {
    number: "01",
    title: "Choose with confidence",
    description:
      "See service details, prices, and expected durations before you decide.",
    Icon: SparklesIcon,
  },
  {
    number: "02",
    title: "Make time for yourself",
    description:
      "Explore a considered menu of hair, skin, makeup, nail, and spa services.",
    Icon: HeartIcon,
  },
  {
    number: "03",
    title: "Request a time that suits you",
    description:
      "Choose an appointment date and available time slot in a few simple steps.",
    Icon: CalendarDaysIcon,
  },
] as const

export function WhyChooseUs() {
  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className="mx-auto mt-20 w-full max-w-[84rem] px-4 sm:mt-24 sm:px-6 lg:mt-28 lg:px-10"
    >
      <div className="grid gap-10 rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-12">
        <div className="flex flex-col justify-center">
          <p className="text-[0.58rem] font-medium tracking-[0.28em] text-brand-gold uppercase">
            The SalonBook difference
          </p>
          <h2
            id="why-choose-us-heading"
            className="mt-3 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl"
          >
            Beauty care, made a little more{" "}
            <span className="text-brand-plum italic">thoughtful.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Finding the right treatment should feel as considered as the time
            you spend enjoying it.
          </p>
        </div>

        <ol className="grid">
          {reasons.map(({ number, title, description, Icon }, index) => (
            <li
              key={number}
              className={`grid grid-cols-[2.5rem_1fr] gap-x-4 py-5 ${
                index < reasons.length - 1 ? "border-b border-border/70" : ""
              }`}
            >
              <span className="row-span-2 flex size-10 items-center justify-center rounded-full bg-brand-plum text-brand-cream">
                <Icon aria-hidden className="size-4" />
              </span>
              <p className="flex items-center gap-2 text-[0.58rem] font-medium tracking-[0.22em] text-brand-gold uppercase">
                <span>{number}</span>
                <span className="h-px w-5 bg-brand-gold/50" aria-hidden />
              </p>
              <div className="mt-1">
                <h3 className="font-display text-xl leading-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
