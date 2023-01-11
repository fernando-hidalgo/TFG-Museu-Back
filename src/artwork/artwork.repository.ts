import { EntityRepository, Repository } from "typeorm";
import { ArtworkEntity } from "./artwork.entity";

@EntityRepository(ArtworkEntity)
export class ArtworkRepository extends Repository<ArtworkEntity>{

}


/*
import { Injectable } from "@nestjs/common";
import { DataSource, EntityRepository, Repository } from "typeorm";
import { ArtworkEntity } from "./artwork.entity";

@Injectable()
export class ArtworkRepository extends Repository<ArtworkRepository>{
    constructor(private dataSource: DataSource){
        super(ArtworkEntity, dataSource.createEntityManager());
    }



}
*/