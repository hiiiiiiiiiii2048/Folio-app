export type PropertyStatus = "Lead / Prospect" | "Under Analysis" | "Offer Submitted" | "Under Contract" | "Incoming Asset" | "Secured Asset" | "Active" | "Renovation" | "Incoming" | "On Market" | "Sold";

export interface PropertyEvent {
    id: string;
    date: string;
    type: "note" | "call" | "email" | "meeting" | "status_change" | "task";
    title: string;
    content: string;
}

export interface Property {
    id: string;
    name: string;
    address: string;
    status: PropertyStatus;
    type: string;
    image: string;
    units?: number;
    lat?: number;
    lng?: number;
    financials: {
        purchasePrice: number;
        currentValue: number;
        renovationCost: number;
        debt: number;
        monthlyRent: number;
        monthlyExpenses: number;
        monthlyDebtService: number; // Total P+I payment
        principalPayment: number; // Amount of principal paid per month
        // Advanced Debt Parameters
        debtType?: string; // e.g., "Fixed", "Variable", "Interest Only"
        interestRate?: number; // e.g., 5.5 (%)
        loanDurationMonths?: number; // e.g., 360 (30 years)
        fixedTermRemainingMonths?: number; // e.g., 60 (for 5/1 ARM or balloon)
        reserviceDate?: string; // Date when the loan needs to be refinanced/reserviced
    };
    acquisitionDate?: string;
    events?: PropertyEvent[];
    isDemo?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    lotSize?: string;
    description?: string;
}

export const MOCK_PROPERTIES: Property[] = [];

export function getPortfolioStats(properties: Property[]) {
    let totalValue = 0;
    let totalDebt = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    let projectedTotalValue = 0;
    let projectedTotalDebt = 0;
    let projectedMonthlyIncome = 0;
    let projectedMonthlyExpenses = 0;

    for (const prop of properties) {
        // Exclude properties that are just in the pipeline/not actually owned yet, or already sold
        const excludedStatuses = ["Lead / Prospect", "Under Analysis", "Offer Submitted", "On Market", "Sold"];

        // Projected includes everything except Sold and On Market (if it's on market to be sold, maybe maintain it or exclude. Let's include everything that could enter or is in portfolio)
        const excludedFromProjected = ["Sold"];

        if (!excludedStatuses.includes(prop.status)) {
            totalValue += Number(prop.financials?.currentValue) || Number(prop.financials?.purchasePrice) || 0;
            totalDebt += Number(prop.financials?.debt) || 0;
            monthlyIncome += Number(prop.financials?.monthlyRent) || 0;
            monthlyExpenses += Number(prop.financials?.monthlyExpenses) || 0;
        }

        if (!excludedFromProjected.includes(prop.status)) {
            projectedTotalValue += Number(prop.financials?.currentValue) || Number(prop.financials?.purchasePrice) || 0;
            projectedTotalDebt += Number(prop.financials?.debt) || 0;
            projectedMonthlyIncome += Number(prop.financials?.monthlyRent) || 0;
            projectedMonthlyExpenses += Number(prop.financials?.monthlyExpenses) || 0;
        }
    }

    const equity = totalValue - totalDebt;
    const monthlyCashflow = monthlyIncome - monthlyExpenses - (properties.reduce((acc, p) => acc + (Number(p.financials?.monthlyDebtService) || 0), 0));

    const projectedEquity = projectedTotalValue - projectedTotalDebt;
    const projectedMonthlyCashflow = projectedMonthlyIncome - projectedMonthlyExpenses - (properties.reduce((acc, p) => acc + (Number(p.financials?.monthlyDebtService) || 0), 0));

    return {
        totalValue,
        totalDebt,
        equity,
        monthlyIncome,
        monthlyExpenses,
        monthlyCashflow,
        totalMonthlyDebtService: properties.reduce((acc, p) => acc + (Number(p.financials?.monthlyDebtService) || 0), 0),
        totalMonthlyPrincipal: properties.reduce((acc, p) => acc + (Number(p.financials?.principalPayment) || 0), 0),
        projectedTotalValue,
        projectedTotalDebt,
        projectedEquity,
        projectedMonthlyCashflow,
    };
}
