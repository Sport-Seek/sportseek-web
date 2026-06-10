import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPhotoUrl } from "@/app/lib/photoUrl";
import { catalogService } from "@/app/services/catalog.service";
import { spotsService } from "@/app/services/spots.service";
import type { Equipment, Property, Sport } from "@/app/types/sports";
import type { Spot } from "@/app/types/spots";
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

    const title = spot.name
      ? `Spot : ${spot.name}`
      : `Spot de ${spot.sportName || "sport"} à ${spot.city}`;
    const description =
      spot.comment ||
      `Découvrez ce spot de ${spot.sportName || "sport"} situé à ${spot.city}. Ouvrez l'application SportSeek pour voir tous les détails.`;
    const photoUrl =
      buildPhotoUrl(spot.photos?.[0]?.url) ??
      buildPhotoUrl(spot.photos?.[0]?.uri) ??
      "https://sportseek.fr/og-image-default.jpg";

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
  } catch {
    return {
      title: "Spot introuvable",
    };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params;

  let spot: Spot | null = null;
  let sports: Sport[] = [];
  let equipments: Equipment[] = [];
  let properties: Property[] = [];

  try {
    [spot, sports, equipments, properties] = await Promise.all([
      spotsService.fetchSpotById(id),
      catalogService.fetchSports(),
      catalogService.fetchEquipments(),
      catalogService.fetchProperties(),
    ]);
  } catch {
    notFound();
  }

  if (!spot) {
    notFound();
  }

  const equipmentsDict = Object.fromEntries(equipments.map((equipment) => [equipment.id, equipment]));
  const propertiesDict = Object.fromEntries(properties.map((property) => [property.id, property]));

  return (
    <SpotDetailsClient
      spot={spot}
      catalog={{
        sports,
        equipments: equipmentsDict,
        properties: propertiesDict,
      }}
    />
  );
}
