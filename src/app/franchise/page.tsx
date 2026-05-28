import FranchiseDashboardView from "@/domains/franchise/components/FranchiseDashboardView";

export default function FranchisePage() {
  // Thin Controller: 화면 로직은 도메인 컴포넌트에 위임
  return <FranchiseDashboardView />;
}
