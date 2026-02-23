import { useMemo } from "react";

const PREVIEW_NAME = "Carlos";
const PREVIEW_CPF = "123.456.789-00";

export function useLeadData() {
  return useMemo(() => {
    let cpf = sessionStorage.getItem("lead_cpf") || "";
    let name = sessionStorage.getItem("lead_name") || "";
    const email = sessionStorage.getItem("lead_email") || "";
    const phone = sessionStorage.getItem("lead_phone") || "";

    // Populate with preview data if empty (for visualization)
    if (!cpf && !name) {
      cpf = PREVIEW_CPF;
      name = PREVIEW_NAME;
      sessionStorage.setItem("lead_cpf", cpf);
      sessionStorage.setItem("lead_name", name);
    }

    return { leadCpf: cpf, leadName: name, leadEmail: email, leadPhone: phone };
  }, []);
}
