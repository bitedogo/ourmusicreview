import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
          개인정보처리방침
        </h1>
        <p className="mb-10 text-sm text-zinc-500">
          Privacy Policy
        </p>

        <article className="space-y-10 leading-relaxed text-zinc-700" style={{ letterSpacing: "0.01em", lineHeight: 1.9 }}>
          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제1조 (수집하는 개인정보 항목 및 수집방법)
            </h2>
            <p className="mb-3 text-sm sm:text-base">
              <span className="font-semibold">수집 항목 (필수):</span> 이메일, 닉네임, 프로필 사진(소셜 로그인 시), 접속 IP 정보, 쿠키, 서비스 이용 기록.
            </p>
            <p className="text-sm sm:text-base">
              <span className="font-semibold">수집 방법:</span> 홈페이지 회원가입, 서비스 이용 과정에서의 자동 생성, 고객 문의 메일.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제2조 (개인정보의 이용 목적)
            </h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <span className="font-semibold">서비스 제공 및 운영:</span> 게시물 작성, 댓글 참여, 장터 이용, 워크룸 공유 기능 제공.
              </li>
              <li>
                <span className="font-semibold">회원 관리:</span> 회원 식별, 불량 이용자의 부정 이용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존.
              </li>
              <li>
                <span className="font-semibold">마케팅 및 광고(선택):</span> 신규 서비스 안내 및 이벤트 정보 전달 (동의 시).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제3조 (개인정보의 보유 및 이용기간)
            </h2>
            <p className="mb-4 text-sm sm:text-base">
              원칙적으로 회원이 탈퇴할 때까지 보유하며, 탈퇴 시 지체 없이 파기합니다.
            </p>
            <p className="mb-3 text-sm sm:text-base">
              단, 다음의 경우 명시한 기간 동안 보관합니다.
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm sm:text-base">
              <li>
                <span className="font-semibold">부정이용 기록:</span> 부정 가입 및 징계 기록 확인을 위해 탈퇴 후 6개월간 보관.
              </li>
              <li>
                전자상거래 등에서의 소비자 보호에 관한 법률 등 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보존.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제4조 (개인정보의 파기절차 및 방법)
            </h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <span className="font-semibold">파기절차:</span> 이용자가 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 일정 기간 저장된 후 파기됩니다.
              </li>
              <li>
                <span className="font-semibold">파기방법:</span> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제5조 (이용자의 권리와 그 행사방법)
            </h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                회원은 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, &apos;회원 탈퇴&apos;를 통해 동의를 철회할 수 있습니다.
              </li>
              <li>
                개인정보 보호와 관련한 문의는 관리자 메일(
                <a
                  href="mailto:forsix5020@naver.com"
                  className="font-medium text-zinc-900 underline hover:text-zinc-700"
                >
                  forsix5020@naver.com
                </a>
                )로 연락 주시면 즉시 조치하겠습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold text-zinc-900">
              제6조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
            </h2>
            <p className="text-sm sm:text-base">
              사이트는 이용자의 환경 설정을 유지하기 위해 &apos;쿠키(cookie)&apos;를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
            </p>
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
