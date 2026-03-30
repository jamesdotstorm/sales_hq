import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    {
      name: "Hotels & Accommodation",
      marketSize: 10_600_000_000,
      cagr: 7.2,
      projectedSize2029: 15_600_000_000,
      source: "Hotel Management Network, 2024",
      sourceUrl: "https://www.hotelmanagement.net",
      notes: "Largest vertical. International guests billing in USD = natural fit.",
      examples: "Boutique hotels, game lodges, B&Bs, hotel groups",
    },
    {
      name: "Safari & Game Reserves",
      marketSize: 16_900_000_000,
      cagr: 6.2,
      projectedSize2029: null,
      source: "Grand View Research, 2023; Southern Africa: Grand View Research, 2024",
      sourceUrl: "https://www.grandviewresearch.com/industry-analysis/africa-safari-tourism-market-report",
      notes: "Near 100% USD billing. Highest value per booking. Southern Africa alone = $13.2B.",
      examples: "Private game reserves, guided safari operators, bush camps",
    },
    {
      name: "Tour Operators / DMCs",
      marketSize: 1_500_000_000,
      cagr: 6.5,
      projectedSize2029: null,
      source: "Est. ~15% of $8.7B global DMC market (Verified Market Research, 2024)",
      sourceUrl: "https://www.verifiedmarketresearch.com",
      notes: "Multi-currency billing. High volume of international card payments across borders.",
      examples: "Destination Management Companies, inbound operators, tour designers",
    },
    {
      name: "Travel Agents / OTAs",
      marketSize: 3_000_000_000,
      cagr: 8.0,
      projectedSize2029: null,
      source: "Statista 2024; Booking.com/Expedia — 340M new MEA+APAC users 2024",
      sourceUrl: "https://www.statista.com",
      notes: "Gateway into upstream tourism supply chain. OTAs charge 15–25% commission.",
      examples: "Retail agents, OTAs, corporate travel management",
    },
    {
      name: "Airlines (regional/charter)",
      marketSize: 10_000_000_000,
      cagr: 5.0,
      projectedSize2029: null,
      source: "AFRAA (African Airlines Association), 2024",
      sourceUrl: "https://afraa.org",
      notes: "Charter operators are direct B2B target. SWIFT fees on charter bookings = 2–4%.",
      examples: "Fastjet, Airlink, Safair, charter operators",
    },
    {
      name: "Car Rental",
      marketSize: 3_930_000_000,
      cagr: 14.0,
      projectedSize2029: null,
      source: "Statista, 2024; South Africa alone: $2.4B",
      sourceUrl: "https://www.statista.com/outlook/mmo/shared-mobility/car-rentals-ride-hailing/car-rentals/africa",
      notes: "International tourist card spend is dominant payment method. SA CAGR of 14%.",
      examples: "Self-drive operators, chauffeur services",
    },
    {
      name: "Adventure & Activities",
      marketSize: 2_000_000_000,
      cagr: 8.6,
      projectedSize2029: null,
      source: "Africa est. — Namibia adventure tourism alone $1.9B in 2024 (Namibia Tourism Board)",
      sourceUrl: "https://www.namibiatourism.com.na",
      notes: "Mostly cash/card on-site. TurnStay can improve international card acceptance.",
      examples: "Zip lines, dive ops, whale watching, bungee, hot air balloon",
    },
    {
      name: "PMS / Booking Software",
      marketSize: 350_000_000,
      cagr: 8.6,
      projectedSize2029: null,
      source: "Global PMS market $5.28B (Grand View Research, 2025). Africa est. ~5–8% = $250–400M",
      sourceUrl: "https://www.grandviewresearch.com/industry-analysis/property-management-system-market",
      notes: "DISTRIBUTION PLAY — 1 PMS deal = hundreds of properties. Priority: ResRequest, Cloudbeds.",
      examples: "ResRequest, Cloudbeds, Nightsbridge, RoomRaccoon, Opera",
    },
    {
      name: "Cruise & Marine",
      marketSize: 500_000_000,
      cagr: 6.0,
      projectedSize2029: null,
      source: "Africa coastal/river cruise market est. (Cruise Lines International Association, 2024)",
      sourceUrl: "https://cruising.org",
      notes: "Niche but high value per booking. USD billing is natural for yacht charters.",
      examples: "Coastal cruises, river cruises, yacht charters",
    },
  ];

  const totalMarket = categories.reduce((s, c) => s + c.marketSize, 0);

  const topStats = {
    africaInternationalReceipts: { value: 42_600_000_000, source: "UN Tourism, 2024", url: "https://www.untourism.int" },
    internationalArrivals: { value: 74_000_000, source: "UNWTO, 2024", url: "https://www.unwto.org" },
    crossBorderPayments: { value: 329_000_000_000, source: "EcoFin Agency, 2025", url: "https://www.ecofinagency.com" },
    crossBorderPayments2035: { value: 1_000_000_000_000, source: "EcoFin Agency projection", url: "https://www.ecofinagency.com" },
    turnstayTam: { value: 17_500_000_000, source: "Internal estimate: ~40–60% of Africa tourism spend via card payments", url: null },
    typicalMdr: { value: "2.5–4.5%", source: "Africa payment processor benchmarks", url: null },
    turnstayRate: { value: "1–2.5%", source: "TurnStay pricing", url: null },
  };

  return NextResponse.json({ categories, totalMarket, topStats });
}
