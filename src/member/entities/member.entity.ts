import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name : "members"})
export class Member {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true, nullable: false})
    useremail: string;

    @Column({nullable: false})
    password: string;

    @Column()
    usertype: string;

    @Column()
    name: string;

    @Column()
    nickname: string;

}
