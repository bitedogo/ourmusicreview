import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
          이용약관
        </h1>
        <p className="mb-10 text-sm text-zinc-500">
          Terms of Service
        </p>

        <article className="space-y-10 leading-relaxed text-zinc-700" style={{ letterSpacing: "0.01em", lineHeight: 1.9 }}>
          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제1조 (목적)
            </h2>
            <p className="text-sm sm:text-base">
              본 약관은 &apos;ORU&apos;(이하 &apos;사이트&apos;)가 제공하는 모든 서비스의 이용 조건, 절차, 이용자와 사이트 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 구체적으로 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제2조 (용어의 정의)
            </h2>
            <ul className="space-y-4 text-sm sm:text-base">
              <li>
                <span className="font-semibold">&apos;회원&apos;</span>이라 함은 사이트에 접속하여 본 약관에 동의하고 계정을 생성한 자를 말합니다.
              </li>
              <li>
                <span className="font-semibold">&apos;게시물&apos;</span>이라 함은 회원이 서비스를 이용함에 있어 게시한 글, 사진, 음원, 영상, 댓글 등을 의미합니다.
              </li>
              <li>
                <span className="font-semibold">&apos;장터&apos;</span>라 함은 회원 간 중고 물품을 거래할 수 있도록 사이트가 제공하는 가상의 공간을 말합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제3조 (이용계약의 성립 및 거절)
            </h2>
            <p className="mb-4 text-sm sm:text-base">
              이용계약은 회원이 되고자 하는 자가 약관 내용에 동의하고 가입을 신청하며, 관리자가 이를 승인함으로써 성립합니다.
            </p>
            <p className="mb-3 text-sm sm:text-base">
              사이트는 다음 각 호에 해당하는 신청에 대하여 승인을 제한하거나 사후에 계약을 해지할 수 있습니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm sm:text-base">
              <li>타인의 명의를 도용하거나 허위 정보를 기재한 경우</li>
              <li>이전에 회원 자격을 상실한 적이 있는 경우</li>
              <li>사회의 안녕질서 혹은 미풍양속을 저해할 목적으로 신청한 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제4조 (이용자의 의무 및 게시물 관리)
            </h2>
            <p className="mb-3 text-sm sm:text-base">
              회원은 다음 각 호의 행위를 해서는 안 됩니다.
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-sm sm:text-base">
              <li>특정 아티스트 및 타인에 대한 비방, 모욕, 명예훼손, 허위사실 유포</li>
              <li>도배, 광고, 스팸성 게시물 작성 및 정치/종교적 분란 조장</li>
              <li>타인의 저작권을 침해하는 음원, 영상, 텍스트의 무단 게시</li>
            </ul>
            <p className="text-sm sm:text-base">
              관리자는 위 조항을 위반한 게시물을 사전 통보 없이 삭제, 이동, 수정할 수 있으며 해당 회원의 활동을 제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제5조 (장터 및 워크룸 특약)
            </h2>
            <ul className="space-y-4 text-sm sm:text-base">
              <li>
                <span className="font-semibold">장터:</span> 회원은 판매 물품의 실물 사진(닉네임 인증 포함)을 반드시 게시해야 하며, 허위 매물이나 사기 행위 시 모든 책임은 회원에게 있고 즉시 영구 제명됩니다. 사이트는 중개자로서 거래 사고에 대한 법적 책임을 지지 않습니다.
              </li>
              <li>
                <span className="font-semibold">워크룸:</span> 본인이 창작하지 않은 작업물을 무단으로 도용하여 게시할 경우 저작권법에 따라 처벌받을 수 있으며, 사이트는 이에 대한 어떠한 책임도 지지 않습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제6조 (손해배상 및 면책)
            </h2>
            <ul className="list-inside list-disc space-y-2 text-sm sm:text-base">
              <li>사이트는 천재지변, 서버 점검, 통신 장애 등 불가항력적인 사유로 서비스가 중단될 경우 책임을 지지 않습니다.</li>
              <li>이용자 간 발생한 분쟁(명예훼손, 거래 사기 등)에 대해 사이트는 개입하지 않으며 이를 보상할 의무가 없습니다.</li>
            </ul>
          </section>
        </article>

        <div className="mt-12 pt-6 border-t border-zinc-200">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
