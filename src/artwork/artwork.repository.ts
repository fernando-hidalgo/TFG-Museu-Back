import { EntityRepository, Repository } from "typeorm";
import { ArtworkEntity } from "./artwork.entity";

@EntityRepository(ArtworkEntity)
export class ArtworkRepository extends Repository<ArtworkEntity>{}