/** 이용약관 본문 콘텐츠 */

export function TermsContent() {
  return (
    <article
      className="space-y-10 leading-relaxed text-[var(--color-text-primary)]"
      style={{ letterSpacing: "0.01em", lineHeight: 1.9 }}
    >
      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제1조 (목적)</h2>
        <p className="text-sm sm:text-base">
          본 약관은 &apos;ORU&apos;(이하 &apos;사이트&apos;)가 제공하는 모든 서비스의 이용 조건, 절차, 이용자와 사이트 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 구체적으로 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제2조 (용어의 정의)</h2>
        <ul className="space-y-4 text-sm sm:text-base">
          <li>
            <span className="font-semibold">&apos;회원&apos;</span>이라 함은 사이트에 접속하여 본 약관에 동의하고 계정을 생성한 자를 말합니다.
          </li>
          <li>
            <span className="font-semibold">&apos;게시물&apos;</span>이라 함은 회원이 서비스를 이용함에 있어 게시한 글, 사진, 음악 데이터, 댓글 등을 의미합니다.
          </li>
          <li>
            <span className="font-semibold">&apos;리뷰&apos;</span>라 함은 특정 앨범이나 아티스트에 대해 회원이 작성한 주관적인 평가 및 비평 콘텐츠를 말합니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제3조 (회원가입 및 계정 관리)</h2>
        <ul className="space-y-3 text-sm sm:text-base">
          <li>이용계약은 회원이 되고자 하는 자가 약관 내용에 동의하고 가입을 신청하며, 관리자가 이를 승인함으로써 성립합니다.</li>
          <li>회원은 1인 1계정 원칙을 준수해야 하며, 타인의 정보를 도용하여 가입한 경우 사전 통보 없이 계정이 삭제될 수 있습니다.</li>
          <li>회원은 자신의 비밀번호 및 계정에 대한 관리 책임을 지며, 본인의 부주의로 인해 발생하는 도용 및 이용상의 불이익은 회원 본인이 부담합니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제4조 (서비스 이용 및 제한)</h2>
        <p className="mb-4 text-sm sm:text-base">
          사이트는 회원에게 앨범 검색, 리뷰 작성, 커뮤니티 게시판 이용 등의 서비스를 제공합니다.
        </p>
        <p className="mb-3 text-sm sm:text-base">
          사이트는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 게시물을 삭제할 수 있습니다.
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm sm:text-base">
          <li>특정 아티스트, 회원 또는 제3자에 대한 비방, 모욕, 명예훼손</li>
          <li>공공질서 및 미풍양속에 위반되는 음란물이나 폭력적인 게시물 작성</li>
          <li>사이트의 운영을 방해할 목적으로 동일한 내용을 반복 게시하는 행위(도배)</li>
          <li>확인되지 않은 허위 사실 유포 및 정치/종교적 분란 조장 행위</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제5조 (게시물의 저작권 및 이용)</h2>
        <ul className="space-y-3 text-sm sm:text-base">
          <li>회원이 사이트 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
          <li>회원은 자신이 게시한 콘텐츠가 제3자의 저작권을 침해하지 않음을 보증해야 하며, 이와 관련하여 발생하는 법적 책임은 회원 본인에게 있습니다.</li>
          <li>사이트는 서비스의 홍보 및 운영을 위해 회원의 게시물을 검색 결과에 노출하거나 통계 자료로 활용할 수 있습니다. 단, 이 과정에서 원문이 훼손되지 않도록 최선을 다합니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제6조 (권리의 귀속 및 지적재산권)</h2>
        <ul className="space-y-3 text-sm sm:text-base">
          <li>사이트가 제공하는 서비스, 소프트웨어, 이미지, 디자인, UI/UX 등 사이트 자체의 지적재산권은 &apos;ORU&apos;에 귀속됩니다.</li>
          <li>회원은 사이트를 이용함으로써 얻은 정보를 관리자의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">제7조 (계정 해지 및 자격 상실)</h2>
        <ul className="space-y-3 text-sm sm:text-base">
          <li>회원은 언제든지 서비스 내 설정 메뉴를 통해 이용계약 해지(탈퇴)를 신청할 수 있습니다.</li>
          <li>회원이 본 약관의 의무를 위반하거나 사이트의 정상적인 운영을 방해한 경우, 관리자는 경고, 일시 정지, 영구 이용 정지 등의 단계별 조치를 취할 수 있습니다.</li>
          <li>영구 이용 정지 조치를 받은 회원은 향후 재가입이 제한될 수 있습니다.</li>
        </ul>
      </section>
    </article>
  );
}
