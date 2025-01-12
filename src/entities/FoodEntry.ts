import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Child } from "./Child";

@Entity("food_entries")
export class FoodEntry {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    foodId!: number;

    @Column()
    triedDate!: Date;

    @Column({ nullable: true })
    notes?: string;

    @ManyToOne(() => Child, child => child.foodEntries, { onDelete: 'CASCADE' })
    child!: Child;
}
