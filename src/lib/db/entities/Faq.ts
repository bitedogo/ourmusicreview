/** FAQ 엔티티 */

import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "faqs", schema: "public" })
export class Faq {
  @PrimaryColumn({ name: "id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "question", type: "text" })
  question!: string;

  @Column({ name: "answer", type: "text" })
  answer!: string;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
