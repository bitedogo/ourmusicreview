import Link from "next/link";

export default function CommunityGuidelinesPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          커뮤니티 가이드라인
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          ORU Community Guidelines
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <article
          className="space-y-10 leading-relaxed text-zinc-700"
          style={{ letterSpacing: "0.01em", lineHeight: 1.9 }}
        >
          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">序. 목적 및 비전</h2>
            <p className="text-sm sm:text-base">
              본 가이드라인은 음악 평론과 담론의 장 ORU(이하 &apos;사이트&apos;) 내에서 회원들이 상호 존중을 바탕으로 건강한 비평 문화를 형성하고, 고품격 커뮤니티 환경을 유지하는 것을 목적으로 합니다. 모든 회원은 본 가이드라인을 준수함으로써 음악적 가치를 공유하는 전문적인 평론가로서 활동하게 됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">1. 보편적 운영 원칙 (General Rules)</h2>
            <p className="mb-4 text-sm sm:text-base">
              사이트의 품격을 저해하는 다음 각 호의 행위는 발견 즉시 운영진의 재량에 따라 게시물 삭제 및 이용 권한 제한(경고 또는 영구 제명) 조치가 취해질 수 있습니다.
            </p>
            <ul className="space-y-4 text-sm sm:text-base">
              <li>
                <span className="font-semibold">비방 및 명예훼손:</span> 아티스트에 대한 근거 없는 비난, 악의적 루머 유포, 회원 간의 인신공격 및 혐오 표현을 엄격히 금지합니다. 건전한 &apos;비평&apos;은 적극 권장되나, 인격 모독을 동반한 &apos;비난&apos;은 허용되지 않습니다.
              </li>
              <li>
                <span className="font-semibold">사회적 분란 조장:</span> 정치, 종교 등 음악적 담론과 무관한 주제로 논쟁을 유도하거나, 특정 집단 및 커뮤니티를 비방하여 갈등을 유발하는 행위를 금지합니다.
              </li>
              <li>
                <span className="font-semibold">게시 질서 교란:</span> 홍보성 도배, 스팸, 제목과 내용이 불일치하는 기만적 게시물(낚시성) 작성을 금지합니다.
              </li>
              <li>
                <span className="font-semibold">다중 계정 오용:</span> 징계 회피 목적의 재가입이나 다수의 계정을 이용한 여론 왜곡 및 투표 조작 행위 적발 시 모든 관련 계정은 즉시 영구 제한됩니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">2. 게시판별 세부 운용 지침 (Specific Guidelines)</h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-bold text-zinc-800">A. [KR/Global] 담론 게시판</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li>
                    <span className="font-semibold">논리적 견해의 견지:</span> 단순한 호불호의 표현을 넘어, 반드시 본인만의 음악적 근거가 포함된 비평적 서술을 지향해 주십시오.
                  </li>
                  <li>
                    <span className="font-semibold">지적 재산권 준수:</span> 번역 가사, 뉴스 기사 등 외부 자료 인용 시 반드시 원문의 출처를 명확히 기재해야 합니다.
                  </li>
                  <li>
                    <span className="font-semibold">다양성 존중:</span> 개인의 취향과 관계없이 특정 장르나 아티스트의 예술적 가치를 저급하게 묘사하거나 폄훼하지 않습니다.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-zinc-800">B. [Market] 장터 게시판</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li>
                    <span className="font-semibold">투명한 인증 절차:</span> 실물 사진 내에 본인의 닉네임과 날짜가 기재된 메모가 포함되지 않은 게시물은 사전 통보 없이 삭제됩니다.
                  </li>
                  <li>
                    <span className="font-semibold">가격 명시제:</span> 경매나 가격 제시 유도는 금지하며, 판매 희망가를 정확히 기재해야 합니다.
                  </li>
                  <li>
                    <span className="font-semibold">거래 책임 한계:</span> 안전한 거래를 위해 직거래를 권장하며, 개인 간 발생한 거래 사고 및 분쟁에 대하여 ORU는 어떠한 법적 책임도 지지 않습니다.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-zinc-800">C. [Workroom] 워크룸</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li>
                    <span className="font-semibold">저작권 윤리 준수:</span> 타인의 창작물을 무단 도용하거나 샘플링 클리어런스 등 권리 관계가 불분명한 작업물을 본인의 독자적 창작물로 사칭하는 행위는 엄격히 금지됩니다.
                  </li>
                  <li>
                    <span className="font-semibold">건설적 피드백:</span> 피드백 요청 시 믹싱, 편곡 등 구체적인 고민을 명시해야 하며, 답변자는 창작자의 성장을 돕는 전문적이고 건설적인 방향을 제시해야 합니다.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">3. 신고 및 보호 시스템 (Reports &amp; Protection)</h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <span className="font-semibold">제보자 익명성:</span> 모든 신고 내용은 암호화되어 관리자에게만 전달되며, 신고자의 신원은 철저히 보호됩니다.
              </li>
              <li>
                <span className="font-semibold">객관적 전수 조사:</span> 신고된 모든 사안은 운영원칙에 의거하여 관리자가 객관적으로 검토 후 처리합니다.
              </li>
              <li>
                <span className="font-semibold">악성 신고 제재:</span> 특정 사용자를 조직적으로 괴롭히거나 허위 사실로 업무를 방해하는 악의적 신고자는 그에 상응하는 이용 제한 조치를 받게 됩니다.
              </li>
            </ul>
          </section>

          <section>
            <p className="text-sm sm:text-base">
              여러분의 깊이 있는 기록들이 ORU의 가치를 완성합니다. 가이드라인 위반 시 사안의 경중에 따라 게시물 삭제, 기간제 이용 정지, 또는 영구 이용 제한 조치가 취해질 수 있음을 유념해 주시기 바랍니다.
            </p>
          </section>
        </article>

        <div className="mt-12 pt-6 border-t border-zinc-200">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline hover:text-[var(--color-brand-primary)]"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
