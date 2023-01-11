import { EntityRepository, Repository } from "typeorm";
import { RatingEntity } from "./rating.entity";

@EntityRepository(RatingEntity)
export class RatingRepository extends Repository<RatingEntity>{}