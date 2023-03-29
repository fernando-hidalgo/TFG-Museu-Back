import { ArtworkEntity } from "./artwork/artwork.entity";

export interface ArtAndFilters {
    artworks: ArtworkEntity[],
    nameFilter: string[],
    artistFilter: string[],
    styleFilter: string[],
    museumFilter: string[]
}