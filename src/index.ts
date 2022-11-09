export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

type ServiceDependency = {
    dependands: ServiceType[],
    main: ServiceType
}

export type ServiceTypePrincing = {
    price: number,
    discount: number;
}

interface ServiceTypesWithCalculator {
    services: Record<ServiceType, Partial<ServiceTypePrincing>>,
    discountCalculator:(selectedServices: ServiceType[], basePrice: number, rows: Record<ServiceType, Partial<ServiceTypePrincing>>) => number;
}

let dependencies: ServiceDependency[] = [
    { main: 'TwoDayEvent', dependands: ["Photography", "VideoRecording"] },
    { main: 'BlurayPackage', dependands: ["VideoRecording"] }
];

export const updateSelectedServices = (previouslySelectedServices: ServiceType[], action: { type: "Select" | "Deselect"; service: ServiceType }) => {
    switch (action.type) 
    {
        case "Select":
        {
            if (!previouslySelectedServices.includes(action.service)) {
                let servicewithDependencies = dependencies.find(x => x.main == action.service)
                if (servicewithDependencies) {
                    if (!previouslySelectedServices.some(s => servicewithDependencies.dependands.includes(s))) {
                        return previouslySelectedServices;
                    }
                }
                return [...previouslySelectedServices, action.service];
            }
            return previouslySelectedServices;
        }
        case "Deselect":
        {
            if (!previouslySelectedServices.includes(action.service))
                return previouslySelectedServices;

            let serviceAndRelated: ServiceType[] = [];
            serviceAndRelated.push(action.service);

            let mainServices: ServiceDependency = dependencies.find(x => x.dependands.includes(action.service));
            if (mainServices) {
                let mainCount = previouslySelectedServices.filter(x => mainServices.dependands.includes(x)).length;
                if (mainCount == 1) {
                    serviceAndRelated.push(mainServices.main);
                }
            }
            return previouslySelectedServices.filter(serviceType => !serviceAndRelated.includes(serviceType));
        }
    }
};


let pricings: { [year: number]: ServiceTypesWithCalculator } = {
    [2020]: {
        services: {
            "Photography": { price: 1700 },
            "VideoRecording": { price: 1700 },
            "TwoDayEvent": { price: 400 },
            "BlurayPackage": { price: 300, },
            "WeddingSession": { price: 600, discount: 300 },
        },
        discountCalculator: (selectedServices: ServiceType[], basePrice: number, rows: Record<ServiceType, Partial<ServiceTypePrincing>>) => {
            if (selectedServices.includes("WeddingSession")) {
                if (selectedServices.includes("Photography") || selectedServices.includes("VideoRecording"))
                    basePrice -= rows.WeddingSession.discount;
            }
            if (selectedServices.includes("Photography") && selectedServices.includes("VideoRecording")) {
                basePrice -= (rows.Photography.price) + (rows.VideoRecording.price);
                basePrice += 2200;
            }

            return basePrice;
        }
    },
    [2021]: {
        services: {
            "Photography": { price: 1800, },
            "VideoRecording": { price: 1800, },
            "TwoDayEvent": { price: 400, },
            "BlurayPackage": { price: 300, },
            "WeddingSession": { price: 600, discount: 300 },
        },
        discountCalculator: (selectedServices: ServiceType[], basePrice: number, rows: Record<ServiceType, Partial<ServiceTypePrincing>>) => {
            if (selectedServices.includes("WeddingSession")) {
                if (selectedServices.includes("Photography") || selectedServices.includes("VideoRecording"))
                    basePrice -= rows.WeddingSession.discount;
            }
            if (selectedServices.includes("Photography") && selectedServices.includes("VideoRecording")) {
                basePrice -= (rows.Photography.price) + (rows.VideoRecording.price);
                basePrice += 2300;
            }

            return basePrice;
        }
    },
    [2022]: {
        services: {
            "Photography": { price: 1900, },
            "VideoRecording": { price: 1900, },
            "TwoDayEvent": { price: 400, },
            "BlurayPackage": { price: 300, },
            "WeddingSession": { price: 600, discount: 300 },
        },
        discountCalculator: (selectedServices: ServiceType[], basePrice: number, rows: Record<ServiceType, Partial<ServiceTypePrincing>>) => {
            if (selectedServices.includes("WeddingSession")) {
                if (selectedServices.includes("Photography")) {
                    basePrice -= rows.WeddingSession.price;
                }
                else if (selectedServices.includes("VideoRecording")) {
                    basePrice -= rows.WeddingSession.discount;
                }
            }
            if (selectedServices.includes("Photography") && selectedServices.includes("VideoRecording")) {
                basePrice -= (rows.Photography.price) + (rows.VideoRecording.price);
                basePrice += 2500;
            }

            return basePrice;
        }
    }
}

function totalCalculator(selectedServices: ServiceType[], pricing: Record<ServiceType, Partial<ServiceTypePrincing>>): number {
    let calculatedServices: ServiceType[] = [];
    let basePrice = 0;

    for (let selectedService of selectedServices) {
        if (calculatedServices.includes(selectedService))
            continue;

        let serviceInfo = pricing[selectedService];
        basePrice += serviceInfo.price;

        calculatedServices.push(selectedService);
    }

    return basePrice;
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear): { basePrice: number, finalPrice: number } => {

    let yearPricing = pricings[selectedYear];

    let basePrice: number = totalCalculator(selectedServices, yearPricing.services);

    let finalPrice: number = yearPricing.discountCalculator(selectedServices, basePrice, yearPricing.services);

    return { basePrice, finalPrice };
}

