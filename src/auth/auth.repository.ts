import { UserEntity } from './../user/user.entity';
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(UserEntity)
export class AuthRepository extends Repository<UserEntity> {}