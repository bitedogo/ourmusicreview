/** 프로필 편집 연필 아이콘 */

export function EditPencilIcon({ size = 22 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/edit-pencil.png"
      alt=""
      width={size}
      height={size}
      className="block object-contain"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
