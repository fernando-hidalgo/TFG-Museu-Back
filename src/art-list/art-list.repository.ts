import { EntityRepository, Repository } from "typeorm";
import { ArtListEntity } from "./art-list.entity";

@EntityRepository(ArtListEntity)
export class ArtListRepository extends Repository<ArtListEntity>{}