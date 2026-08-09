/** 장르 트리 DTO */

export interface GenreOption {
  id: string;
  nameKo: string;
  nameEn: string;
  parentId: string | null;
}

export interface GenreTreeNode extends GenreOption {
  children: GenreOption[];
}
