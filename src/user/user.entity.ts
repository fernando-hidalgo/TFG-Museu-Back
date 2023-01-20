import { hash } from "bcryptjs";
import { RoleEntity } from "src/role/role.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class UserEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length: 10, nullable: false, unique: true})
    nickname: string;

    @Column({type: 'varchar', nullable: false, unique: true})
    email: string;

    @Column({type: 'varchar', nullable: false})
    password: string;

    @ManyToMany(type => RoleEntity, role => role.users, {eager: true})
    @JoinTable({
        name: 'user_role',
        joinColumn: {name: 'user_id'},
        inverseJoinColumn: {name: 'role_id'}
    })
    roles: RoleEntity[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPasword() {
        if(!this.password) return;
        this.password = await hash(this.password, 10);
    }
}