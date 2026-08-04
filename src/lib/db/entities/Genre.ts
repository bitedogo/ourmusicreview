/** Genre 엔티티 — self-referencing 계층 장르 */

import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity({ name: "genres", schema: "public" })
export class Genre {
  @PrimaryColumn({ name: "id", type: "varchar", length: 100 })
  id!: string;

  @Column({ name: "name_ko", type: "varchar", length: 100 })
  nameKo!: string;

  @Column({ name: "name_en", type: "varchar", length: 100 })
  nameEn!: string;

  @Column({ name: "parent_id", type: "varchar", length: 100, nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Genre, (genre) => genre.children, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parent_id" })
  parent!: Genre | null;

  @OneToMany(() => Genre, (genre) => genre.parent)
  children!: Genre[];
}
