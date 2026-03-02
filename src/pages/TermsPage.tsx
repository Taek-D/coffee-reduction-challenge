import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <section className="screen">
      <h1>이용약관</h1>
      <p>본 서비스는 커피 기록과 지출 변화를 기록 기반 추정으로 보여줘요.</p>
      <p>무료 기능(기록/달력/기본 통계)은 계속 이용할 수 있어요.</p>
      <p>서비스 목적은 기록 관리와 지출 변화 확인이에요.</p>
      <Link to="/settings" className="btn secondary">
        설정으로 돌아가기
      </Link>
    </section>
  );
}
