import { useMemo } from "react";

export function useLeadData() {
  return useMemo(() => {
    const cpf = sessionStorage.getItem("lead_cpf") || "52998224725";
    const name = sessionStorage.getItem("lead_name") || "Carlos Eduardo Silva";
    return { leadCpf: cpf, leadName: name };
  }, []);
}
