import { Suspense } from "react"
import type { Metadata } from "next"

import { FeaturedServices } from "@/components/home/featured-services"
import { HomeHero } from "@/components/home/hero-section"
import { ServiceCategories } from "@/components/home/service-categories"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { BACKEND_UNAVAILABLE_MESSAGE, backendFetch } from "@/lib/backend"
import { parseServiceList, type ServiceRow } from "@/lib/services"

export const metadata: Metadata = {
  title: "Salon services, beautifully booked",
  description:
    "Discover SalonBook's hair, skin, and beauty services. Explore the menu and request an appointment that works for you.",
}

export default function Home() {
  return (
    <main className="flex-1 pb-16">
      <Suspense fallback={<HomeServicesSkeleton />}>
        <HomeServiceSections />
      </Suspense>
      <ServiceCategories />
      <WhyChooseUs />
    </main>
  )
}

async function HomeServiceSections() {
  const { services, error } = await getActiveServices()
  const heroImage =
    services.find((service) => service.image)?.image ??
    "/services/signature-silk-blowout.svg"

  return (
    <>
      <HomeHero image={heroImage} />
      <FeaturedServices
        services={services.slice(0, 6)}
        activeServiceCount={services.length}
        error={error}
      />
    </>
  )
}

async function getActiveServices(): Promise<{
  services: ServiceRow[]
  error: string | null
}> {
  let response: Response

  try {
    response = await backendFetch("/services", { method: "GET" })
  } catch (error) {
    return {
      services: [],
      error:
        error instanceof Error && error.message
          ? error.message
          : BACKEND_UNAVAILABLE_MESSAGE,
    }
  }

  if (!response.ok) {
    return {
      services: [],
      error: `The services API answered with status ${response.status}.`,
    }
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return {
      services: [],
      error: "The services API returned invalid JSON.",
    }
  }

  if (!Array.isArray(payload)) {
    return {
      services: [],
      error: "The services API returned an unexpected response.",
    }
  }

  return {
    services: parseServiceList(payload).filter(
      (service) => service.status === "active"
    ),
    error: null,
  }
}

function HomeServicesSkeleton() {
  return (
    <div aria-label="Loading featured services" aria-busy="true">
      <div className="mx-auto mt-5 h-[30rem] max-w-[84rem] animate-pulse rounded-3xl bg-muted sm:mx-6 lg:mx-auto lg:h-[36rem]" />
      <div className="mx-auto mt-16 max-w-[84rem] px-4 sm:px-6 lg:px-10">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="aspect-4/5 animate-pulse rounded-2xl bg-muted/70"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
