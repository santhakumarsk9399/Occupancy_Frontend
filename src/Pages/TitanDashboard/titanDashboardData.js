 const titanDashboardData = {
    success: true,
    data: {
        topCards: {
            newBuilding: 150,
            oldBuilding: 250,
            cbc: 45,
            warehouse: 25,
        },

        occupancyDistribution: {
            totalOccupants: 470,

            data: [
                {
                    zone: "NB",
                    value: 174,
                    percentage: '37%'
                },
                {
                    zone: "OB",
                    value: 113,
                    percentage: '24%'
                },
                {
                    zone: "Others",
                    value: 113,
                    percentage: '24%'
                },
                {
                    zone: "WH",
                    value: 42,
                    percentage: '9%'
                },
                {
                    zone: "CBC",
                    value: 28,
                    percentage: '6%'
                },
            ],
        },

        occupancyByLocation: [
            {
                zone: "NB",
                gents: 150,
                ladies: 50,
                total: 200,
            },
            {
                zone: "OB",
                gents: 120,
                ladies: 30,
                total: 150,
            },
            {
                zone: "CBC",
                gents: 20,
                ladies: 25,
                total: 45,
            },
            {
                zone: "WH",
                gents: 10,
                ladies: 15,
                total: 25,
            },
        ],

        bottomCards: {
            totalCapacity: 300,
            toatlInCount: 170,
            totalOccupants: 470,
            overallOccupancy: 78,
        },
    },
};
export default titanDashboardData;