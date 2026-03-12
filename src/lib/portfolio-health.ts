export interface PropertyFinancials {
    currentValue?: number;
    debt?: number;
    monthlyRent?: number;
    monthlyExpenses?: number;
    monthlyDebtService?: number;
    principalPayment?: number;
    interestRate?: number;
    debtType?: string;
    fixedTermRemainingMonths?: number;
}

export interface PropertyMinimal {
    id: string | number;
    name: string;
    status: string;
    financials?: PropertyFinancials;
}

export function calculatePortfolioHealth(properties: PropertyMinimal[]) {
    // Filter to active/relevant properties for health calculations
    const activeProperties = properties.filter(p => !["Lead / Prospect", "Under Analysis"].includes(p.status));

    if (activeProperties.length === 0) return { score: 100, status: "N/A", color: "text-slate-400" };

    // Calculate Portfolio Metrics
    const totalValue = activeProperties.reduce((sum, p) => sum + (p.financials?.currentValue || 0), 0);
    const totalDebt = activeProperties.reduce((sum, p) => sum + (p.financials?.debt || 0), 0);
    const ltv = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;

    // Monthly Cashflow & Debt Coverage
    const monthlyIncome = activeProperties.reduce((sum, p) => sum + (p.financials?.monthlyRent || 0), 0);
    const monthlyExpenses = activeProperties.reduce((sum, p) => sum + (p.financials?.monthlyExpenses || 0), 0);
    const monthlyDebtService = activeProperties.reduce((sum, p) => sum + (p.financials?.monthlyDebtService || 0), 0);

    const netCashflow = monthlyIncome - monthlyExpenses - monthlyDebtService;
    const cashflowMargin = monthlyIncome > 0 ? (netCashflow / monthlyIncome) * 100 : 0;

    // Calculate Dynamic Health Score (0-100)
    let score = 100;

    // Penalize high LTV
    if (ltv > 85) score -= 30;
    else if (ltv > 75) score -= 20;
    else if (ltv > 65) score -= 10;

    // Penalize low cashflow
    if (cashflowMargin < 0) score -= 40;
    else if (cashflowMargin < 15) score -= 20;
    else if (cashflowMargin < 30) score -= 10;

    // Debt Structure Penalties
    const variableDebtRatio = activeProperties.filter(p => p.financials?.debtType === "Variable" || p.financials?.debtType === "ARM").reduce((sum, p) => sum + (p.financials?.debt || 0), 0) / (totalDebt || 1);
    if (variableDebtRatio > 0.5) score -= 15;
    else if (variableDebtRatio > 0.25) score -= 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let status = "Excellent";
    let color = "text-emerald-400";
    if (score < 50) {
        status = "At Risk";
        color = "text-rose-400";
    } else if (score < 75) {
        status = "Fair";
        color = "text-amber-400";
    }

    return { score, status, color, ltv, cashflowMargin, netCashflow };
}
