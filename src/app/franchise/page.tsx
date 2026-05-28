import FranchiseDashboardView from "@/domains/franchise/components/FranchiseDashboardView";
import { createFranchise } from "@/domains/franchise/actions/createFranchise";
import { getFranchises } from "@/domains/franchise/queries/getFranchises";

export const dynamic = "force-dynamic";

export default async function FranchisePage() {
  const { franchises, error } = await getFranchises();
  return (
    <FranchiseDashboardView
      franchises={franchises}
      createAction={createFranchise}
      dbError={error}
    />
  );
}
