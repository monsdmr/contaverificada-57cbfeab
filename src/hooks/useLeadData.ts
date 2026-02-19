import { useMemo } from "react";

export function useLeadData() {
  return useMemo(() => {
    const cpf = sessionStorage.getItem("lead_cpf") || "";
    const name = sessionStorage.getItem("lead_name") || "";
    return { leadCpf: cpf, leadName: name };
  }, []);
}
