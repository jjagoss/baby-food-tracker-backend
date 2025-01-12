import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { FoodEntry } from "./FoodEntry";

@Entity("children")
export class Child {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    dateOfBirth!: Date;

    @ManyToOne(() => User, user => user.children, { onDelete: 'CASCADE' })
    user!: User;

    @OneToMany(() => FoodEntry, entry => entry.child)
    foodEntries!: FoodEntry[];
}