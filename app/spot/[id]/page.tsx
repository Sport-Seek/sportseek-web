import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { spotsService } from "@/app/services/spots.service";
import { catalogService } from "@/app/services/catalog.service";
import SpotDetailsClient from "./SpotDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const spot = await spotsService.fetchSpotById(id);
    if (!spot) {
      return {};
    }

    const title = spot.name ? `Spot : ${spot.name}` : `Spot de ${spot.sportName || "sport"} à ${spot.city}`;
    const description = spot.comment || `Découvrez ce spot de ${spot.sportName || "sport"} situé à ${spot.city}. Ouvrez l'application SportSeek pour voir tous les détails.`;
    const photoUrl = spot.photos?.[0]?.url || spot.photos?.[0]?.uri || "https://sportseek.fr/og-image-default.jpg";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: photoUrl }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [photoUrl],
      },
    };
  } catch (error) {
    return {
      title: "Spot introuvable",
    };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params;
  
  try {
    // Parallel fetching for performance
    const [spot, sports, equipments, properties] = await Promise.all([
      spotsService.fetchSpotById(id),
      catalogService.fetchSports(),
      catalogService.fetchEquipments(),
      catalogService.fetchProperties()
    ]);

    if (!spot) {
      notFound();
    }

    // Convert arrays to lookup dictionaries for O(1) access in the UI
    const equipmentsDict = Object.fromEntries(equipments.map(e => [e.id, e]));
    const propertiesDict = Object.fromEntries(properties.map(p => [p.id, p]));

    return (
      <SpotDetailsClient 
        spot={spot} 
        catalog={{
          sports,
          equipments: equipmentsDict,
          properties: propertiesDict
        }} 
      />
    );
  } catch (error) {
    // API error or not found
    notFound();
  }
}
