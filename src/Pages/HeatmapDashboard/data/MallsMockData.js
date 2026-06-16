// import floorImage from "../../../../public/hm46full.png";
import floorImage from "/hm46full.png";
export const mallsData = [
    {
        mallId: 1,
        mallName: "Nexus Mall - BLR",

        floors: [
            {
                floorId: 1,
                floorName: "Ground Floor",

                visitors: 14067,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 1,
                        zoneName: "Fashion Zone",
                        occupancy: 400,
                        capacity: 1000,
                        points: [
                            { x: 1600, y: 1928 },
                            { x: 1855, y: 1713 },
                            { x: 2110, y: 1703 },
                            { x: 2320, y: 1823 },
                            { x: 2455, y: 2033 },
                            { x: 2470, y: 2268 },
                            { x: 2415, y: 2428 },
                            { x: 2265, y: 2518 },
                            { x: 2145, y: 2568 },
                            { x: 2015, y: 2618 },
                            { x: 1900, y: 2618 },
                            { x: 1705, y: 2518 },
                            { x: 1625, y: 2318 },
                            { x: 1525, y: 2078 },
                        ],
                    },

                    {
                        zoneId: 2,
                        zoneName: "Retail Zone",
                        occupancy: 700,
                        capacity: 2000,
                        points: [
                            { x: 4861, y: 754 },
                            { x: 5313, y: 747 },
                            { x: 5323, y: 917 },
                            { x: 5321, y: 1067 },
                            { x: 5318, y: 1199 },
                            { x: 4868, y: 1201 },
                        ],
                    },

                    {
                        zoneId: 3,
                        zoneName: "Gaming Zone",
                        occupancy: 1500,
                        capacity: 2000,
                        points: [
                            { x: 3430, y: 303 },
                            { x: 3500, y: 285 },
                            { x: 3783, y: 286 },
                            { x: 3876, y: 284 },
                            { x: 4113, y: 273 },
                            { x: 4274, y: 368 },
                            { x: 4118, y: 500 },
                            { x: 3726, y: 465 },
                            { x: 3409, y: 462 },
                            { x: 3423, y: 316 },
                        ],
                    },
                ],
            },

            {
                floorId: 2,
                floorName: "First Floor",

                visitors: 10245,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 4,
                        zoneName: "Food Court",
                        occupancy: 2400,
                        capacity: 5000,
                        points: [
                            { x: 1300, y: 1200 },
                            { x: 1700, y: 1180 },
                            { x: 1800, y: 1500 },
                            { x: 1500, y: 1700 },
                            { x: 1200, y: 1550 },
                        ],
                    },

                    {
                        zoneId: 5,
                        zoneName: "Kids Area",
                        occupancy: 850,
                        capacity: 1000,
                        points: [
                            { x: 4200, y: 900 },
                            { x: 4500, y: 950 },
                            { x: 4600, y: 1200 },
                            { x: 4300, y: 1400 },
                            { x: 4050, y: 1180 },
                        ],
                    },
                ],
            },

            {
                floorId: 3,
                floorName: "Second Floor",

                visitors: 8650,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 6,
                        zoneName: "Cinema Lobby",
                        occupancy: 3200,
                        capacity: 10000,
                        points: [
                            { x: 2400, y: 700 },
                            { x: 2900, y: 720 },
                            { x: 3000, y: 1200 },
                            { x: 2500, y: 1250 },
                        ],
                    },

                    {
                        zoneId: 7,
                        zoneName: "VR Zone",
                        occupancy: 1200,
                        capacity: 3000,
                        points: [
                            { x: 3900, y: 2100 },
                            { x: 4250, y: 2150 },
                            { x: 4350, y: 2450 },
                            { x: 3980, y: 2550 },
                        ],
                    },
                ],
            },
        ],
    },

    {
        mallId: 2,
        mallName: "Phoenix Mall - CHN",

        floors: [
            {
                floorId: 1,
                floorName: "Ground Floor",

                visitors: 18500,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 8,
                        zoneName: "Luxury Zone",
                        occupancy: 5400,
                        capacity: 12000,
                        points: [
                            { x: 1700, y: 900 },
                            { x: 2300, y: 950 },
                            { x: 2400, y: 1500 },
                            { x: 1800, y: 1550 },
                        ],
                    },

                    {
                        zoneId: 9,
                        zoneName: "Entertainment",
                        occupancy: 4100,
                        capacity: 5000,
                        points: [
                            { x: 3500, y: 1700 },
                            { x: 4000, y: 1750 },
                            { x: 4100, y: 2200 },
                            { x: 3600, y: 2250 },
                        ],
                    },
                ],
            },

            {
                floorId: 2,
                floorName: "First Floor",

                visitors: 12600,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 10,
                        zoneName: "Electronics",
                        occupancy: 2900,
                        capacity: 3000,
                        points: [
                            { x: 900, y: 2100 },
                            { x: 1400, y: 2150 },
                            { x: 1450, y: 2600 },
                            { x: 1000, y: 2550 },
                        ],
                    },

                    {
                        zoneId: 11,
                        zoneName: "Dining Zone",
                        occupancy: 3600,
                        capacity: 6000,
                        points: [
                            { x: 4200, y: 700 },
                            { x: 4700, y: 750 },
                            { x: 4750, y: 1200 },
                            { x: 4250, y: 1150 },
                        ],
                    },
                ],
            },
        ],
    },

    {
        mallId: 3,
        mallName: "Forum Mall - HYD",

        floors: [
            {
                floorId: 1,
                floorName: "Ground Floor",

                visitors: 9600,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 12,
                        zoneName: "Sports Zone",
                        occupancy: 1800,
                        capacity: 10000,
                        points: [
                            { x: 2000, y: 1800 },
                            { x: 2600, y: 1820 },
                            { x: 2700, y: 2400 },
                            { x: 2100, y: 2450 },
                        ],
                    },

                    {
                        zoneId: 13,
                        zoneName: "Cafe Street",
                        occupancy: 950,
                        capacity: 4000,
                        points: [
                            { x: 3900, y: 900 },
                            { x: 4300, y: 930 },
                            { x: 4380, y: 1350 },
                            { x: 3980, y: 1300 },
                        ],
                    },
                ],
            },

            {
                floorId: 2,
                floorName: "Second Floor",

                visitors: 7200,

                imageW: 5467,
                imageH: 3164,

                floorImage,

                zones: [
                    {
                        zoneId: 14,
                        zoneName: "Arcade",
                        occupancy: 2700,
                        capacity: 8000,
                        points: [
                            { x: 1200, y: 800 },
                            { x: 1800, y: 850 },
                            { x: 1850, y: 1450 },
                            { x: 1250, y: 1400 },
                        ],
                    },

                    {
                        zoneId: 15,
                        zoneName: "Book Store",
                        occupancy: 600,
                        capacity: 1000,
                        points: [
                            { x: 4500, y: 2100 },
                            { x: 4900, y: 2150 },
                            { x: 4950, y: 2550 },
                            { x: 4550, y: 2500 },
                        ],
                    },
                ],
            },
        ],
    },
];
  
/* =========================================================
   DATA
========================================================= */

// const mallsData = [
//   {
//     mallId: 1,
//     mallName: "Nexus Mall - BLR",

//     floors: [
//       {
//         floorId: 1,
//         floorName: "Ground Floor",

//         visitors: 14067,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 1,
//             zoneName: "Fashion Zone",

//             occupancy: 400,

//             points: [
//               { x: 1600, y: 1928 },
//               { x: 1855, y: 1713 },
//               { x: 2110, y: 1703 },
//               { x: 2320, y: 1823 },
//               { x: 2455, y: 2033 },
//               { x: 2470, y: 2268 },
//               { x: 2415, y: 2428 },
//               { x: 2265, y: 2518 },
//               { x: 2145, y: 2568 },
//               { x: 2015, y: 2618 },
//               { x: 1900, y: 2618 },
//               { x: 1705, y: 2518 },
//               { x: 1625, y: 2318 },
//               { x: 1525, y: 2078 },
//             ],
//           },

//           {
//             zoneId: 2,
//             zoneName: "Retail Zone",

//             occupancy: 700,

//             points: [
//               { x: 4861, y: 754 },
//               { x: 5313, y: 747 },
//               { x: 5323, y: 917 },
//               { x: 5321, y: 1067 },
//               { x: 5318, y: 1199 },
//               { x: 4868, y: 1201 },
//             ],
//           },

//           {
//             zoneId: 3,
//             zoneName: "Gaming Zone",

//             occupancy: 1500,

//             points: [
//               {
//                 "x": 3430,
//                 "y": 303
//               },
//               {
//                 "x": 3500,
//                 "y": 285
//               },
//               {
//                 "x": 3783,
//                 "y": 286
//               },
//               {
//                 "x": 3876,
//                 "y": 284
//               },
//               {
//                 "x": 3868,
//                 "y": 264
//               },
//               {
//                 "x": 4113,
//                 "y": 273
//               },
//               {
//                 "x": 4120,
//                 "y": 289
//               },
//               {
//                 "x": 4261,
//                 "y": 288
//               },
//               {
//                 "x": 4274,
//                 "y": 368
//               },
//               {
//                 "x": 4147,
//                 "y": 399
//               },
//               {
//                 "x": 4122,
//                 "y": 394
//               },
//               {
//                 "x": 4126,
//                 "y": 482
//               },
//               {
//                 "x": 4118,
//                 "y": 500
//               },
//               {
//                 "x": 3878,
//                 "y": 495
//               },
//               {
//                 "x": 3865,
//                 "y": 456
//               },
//               {
//                 "x": 3726,
//                 "y": 465
//               },
//               {
//                 "x": 3504,
//                 "y": 458
//               },
//               {
//                 "x": 3409,
//                 "y": 462
//               },
//               {
//                 "x": 3414,
//                 "y": 387
//               },
//               {
//                 "x": 3423,
//                 "y": 316
//               },
//               {
//                 "x": 3432,
//                 "y": 305
//               },
//               {
//                 "x": 3432,
//                 "y": 305
//               }
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];

//  const mallsData = [
//   {
//     mallId: 1,
//     mallName: "Nexus Mall - BLR",

//     floors: [
//       {
//         floorId: 1,
//         floorName: "Ground Floor",

//         visitors: 14067,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 1,
//             zoneName: "Fashion Zone",
//             occupancy: 400,

//             points: [
//               { x: 1600, y: 1928 },
//               { x: 1855, y: 1713 },
//               { x: 2110, y: 1703 },
//               { x: 2320, y: 1823 },
//               { x: 2455, y: 2033 },
//               { x: 2470, y: 2268 },
//               { x: 2415, y: 2428 },
//               { x: 2265, y: 2518 },
//               { x: 2145, y: 2568 },
//               { x: 2015, y: 2618 },
//               { x: 1900, y: 2618 },
//               { x: 1705, y: 2518 },
//               { x: 1625, y: 2318 },
//               { x: 1525, y: 2078 },
//             ],
//           },

//           {
//             zoneId: 2,
//             zoneName: "Retail Zone",
//             occupancy: 700,

//             points: [
//               { x: 4861, y: 754 },
//               { x: 5313, y: 747 },
//               { x: 5323, y: 917 },
//               { x: 5321, y: 1067 },
//               { x: 5318, y: 1199 },
//               { x: 4868, y: 1201 },
//             ],
//           },

//           {
//             zoneId: 3,
//             zoneName: "Gaming Zone",
//             occupancy: 1500,

//             points: [
//               { x: 3430, y: 303 },
//               { x: 3500, y: 285 },
//               { x: 3783, y: 286 },
//               { x: 3876, y: 284 },
//               { x: 4113, y: 273 },
//               { x: 4274, y: 368 },
//               { x: 4118, y: 500 },
//               { x: 3726, y: 465 },
//               { x: 3409, y: 462 },
//               { x: 3423, y: 316 },
//             ],
//           },
//         ],
//       },

//       {
//         floorId: 2,
//         floorName: "First Floor",

//         visitors: 10245,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 4,
//             zoneName: "Food Court",
//             occupancy: 2400,

//             points: [
//               { x: 1300, y: 1200 },
//               { x: 1700, y: 1180 },
//               { x: 1800, y: 1500 },
//               { x: 1500, y: 1700 },
//               { x: 1200, y: 1550 },
//             ],
//           },

//           {
//             zoneId: 5,
//             zoneName: "Kids Area",
//             occupancy: 850,

//             points: [
//               { x: 4200, y: 900 },
//               { x: 4500, y: 950 },
//               { x: 4600, y: 1200 },
//               { x: 4300, y: 1400 },
//               { x: 4050, y: 1180 },
//             ],
//           },
//         ],
//       },

//       {
//         floorId: 3,
//         floorName: "Second Floor",

//         visitors: 8650,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 6,
//             zoneName: "Cinema Lobby",
//             occupancy: 3200,

//             points: [
//               { x: 2400, y: 700 },
//               { x: 2900, y: 720 },
//               { x: 3000, y: 1200 },
//               { x: 2500, y: 1250 },
//             ],
//           },

//           {
//             zoneId: 7,
//             zoneName: "VR Zone",
//             occupancy: 1200,

//             points: [
//               { x: 3900, y: 2100 },
//               { x: 4250, y: 2150 },
//               { x: 4350, y: 2450 },
//               { x: 3980, y: 2550 },
//             ],
//           },
//         ],
//       },
//     ],
//   },

//   {
//     mallId: 2,
//     mallName: "Phoenix Mall - CHN",

//     floors: [
//       {
//         floorId: 1,
//         floorName: "Ground Floor",

//         visitors: 18500,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 8,
//             zoneName: "Luxury Zone",
//             occupancy: 5400,

//             points: [
//               { x: 1700, y: 900 },
//               { x: 2300, y: 950 },
//               { x: 2400, y: 1500 },
//               { x: 1800, y: 1550 },
//             ],
//           },

//           {
//             zoneId: 9,
//             zoneName: "Entertainment",
//             occupancy: 4100,

//             points: [
//               { x: 3500, y: 1700 },
//               { x: 4000, y: 1750 },
//               { x: 4100, y: 2200 },
//               { x: 3600, y: 2250 },
//             ],
//           },
//         ],
//       },

//       {
//         floorId: 2,
//         floorName: "First Floor",

//         visitors: 12600,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 10,
//             zoneName: "Electronics",
//             occupancy: 2900,

//             points: [
//               { x: 900, y: 2100 },
//               { x: 1400, y: 2150 },
//               { x: 1450, y: 2600 },
//               { x: 1000, y: 2550 },
//             ],
//           },

//           {
//             zoneId: 11,
//             zoneName: "Dining Zone",
//             occupancy: 3600,

//             points: [
//               { x: 4200, y: 700 },
//               { x: 4700, y: 750 },
//               { x: 4750, y: 1200 },
//               { x: 4250, y: 1150 },
//             ],
//           },
//         ],
//       },
//     ],
//   },

//   {
//     mallId: 3,
//     mallName: "Forum Mall - HYD",

//     floors: [
//       {
//         floorId: 1,
//         floorName: "Ground Floor",

//         visitors: 9600,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 12,
//             zoneName: "Sports Zone",
//             occupancy: 1800,

//             points: [
//               { x: 2000, y: 1800 },
//               { x: 2600, y: 1820 },
//               { x: 2700, y: 2400 },
//               { x: 2100, y: 2450 },
//             ],
//           },

//           {
//             zoneId: 13,
//             zoneName: "Cafe Street",
//             occupancy: 950,

//             points: [
//               { x: 3900, y: 900 },
//               { x: 4300, y: 930 },
//               { x: 4380, y: 1350 },
//               { x: 3980, y: 1300 },
//             ],
//           },
//         ],
//       },

//       {
//         floorId: 2,
//         floorName: "Second Floor",

//         visitors: 7200,

//         imageW: 5467,
//         imageH: 3164,

//         floorImage,

//         zones: [
//           {
//             zoneId: 14,
//             zoneName: "Arcade",
//             occupancy: 2700,

//             points: [
//               { x: 1200, y: 800 },
//               { x: 1800, y: 850 },
//               { x: 1850, y: 1450 },
//               { x: 1250, y: 1400 },
//             ],
//           },

//           {
//             zoneId: 15,
//             zoneName: "Book Store",
//             occupancy: 600,

//             points: [
//               { x: 4500, y: 2100 },
//               { x: 4900, y: 2150 },
//               { x: 4950, y: 2550 },
//               { x: 4550, y: 2500 },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];
