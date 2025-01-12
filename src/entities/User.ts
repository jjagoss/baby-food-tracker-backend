import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Child } from "./Child";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Child, child => child.user)
    children!: Child[];
}