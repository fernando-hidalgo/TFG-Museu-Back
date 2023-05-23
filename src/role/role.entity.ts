import { UserEntity } from './../user/user.entity';
import { RoleType } from './role.enum';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'rol'})
export class RoleEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length: 10, nullable: false, unique: true})
    type: RoleType;

    @ManyToMany(type => UserEntity, user => user.roles)
    users: UserEntity[];

}