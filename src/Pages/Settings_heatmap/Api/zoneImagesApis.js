import api from "../utils/AxiosInstance";
import { getVid, getToken } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";


export const getZones = async () => {
    try {
        console.log(getVid(),"===============> Vid");
        const res = await api.post(
            "/heatmapConfig/grid",
            {
                vid: getVid()
                
            }, // Request body
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );
        // console.log("API Response:", res.data);
        const data = res.data.data || [];

        return data.map((z) => {
            let parsedZoneData = z.zoneData;

            if (typeof z.zoneData === "string") {
                try {
                    parsedZoneData = JSON.parse(z.zoneData);
                    // console.log(parsedZoneData)
                } catch (e) {
                    console.error("Invalid zoneData JSON:", z.zoneData);
                    parsedZoneData = null;
                }
            }

            return {
                ...z,
                id: z._id,
                zoneData: parsedZoneData,
                fullImage: z.fullImage || null,
                cropUrl: z.cropUrl || null,
            };
        });

    } catch (err) {
        handleError(err);
    }
};
export const getMFZ = async () => {
    try {
        const res = await api.post(
            "/heatmapConfig/getMFZ",
            { vid: getVid() },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        // console.log("MFZ API Response:", res.data);
        return res;
    } catch (error) {
        console.error("Error fetching MFZ:", error);
        return {
            malls: [],
            floors: [],
            zones: [],
        };
    }
};

// get the all zones list
export const getZonesList = async () => {
    try {
        // const res = await api.post(
        //     "/settings/zones/getZones",
            const res = await api.post(
                "/heatmapConfig/getHeatmapZoneList",
            { vid: getVid() },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        return res.data?.data || [];
    } catch (error) {
        console.error("Error fetching zones list:", error);
        return [];
    }
};
  // get the particular zone details
export const getZoneDetails = async (zoneName) => {
    try {
        const res = await api.post(
            "/settings/zones/getZone",
            {
                vid: getVid(),
                zonename: zoneName,
            },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        return res.data?.metaData?.[0] || null;
    } catch (error) {
        console.error("Error fetching zone details:", error);
        return null;
    }
};
  

export const getHeatmapZoneDetails = async () => {
    try {
        const res = await api.post(
            "/heatmapConfig/getHeatmapZoneDetails",
            {
                vid: getVid(),
            },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );

        return res.data?.data || [];
    } catch (err) {
        console.error(err);
        return [];
    }
  };

// export const createZone = async (data) => {
//     try {
//         const formData = new FormData();

//         formData.append("mall", data.mall);
//         formData.append("floor", data.floor);
//         formData.append("zoneName", data.zoneName);
//         formData.append("imageW", data.imageW);
//         formData.append("imageH", data.imageH);

//         // ✅ FIX HERE
//         formData.append("zoneData", JSON.stringify(data.zoneData));

//         // If file exists
//         if (data.fullImageFile) {
//             formData.append("fullImage", data.fullImageFile);
//         }

//         if (data.cropFile) {
//             formData.append("cropImage", data.cropFile);
//         }
//         console.log(formData,"addZoneDataItems")
//         const res = await api.post("/Heatmaps/CreateZoneImages", formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//         });

//         return res.data;

//     } catch (err) {
//         throw err;
//     }
//   };

export const createZone = async (data) => {
    try {
        const formData = new FormData();
        // Required fields
        formData.append("heatmapid", "");
        formData.append("vid", getVid());
        formData.append("zoneid", data.zoneid || "");
        formData.append("mallname", data.mall);
        formData.append("floorname", data.floor);
        formData.append("zonename", data.zoneName);
        formData.append("imagewidth", data.imageW);
        formData.append("imageheight", data.imageH);
        formData.append(
            "zoneData",
            JSON.stringify(data.zoneData)
        );


        if (data.fullImageFile) {
            formData.append("imageurl", data.fullImageFile);
        }

        if (data.cropFile) {
            formData.append("thumbnailurl", data.cropFile);
        }

        for (const [key, value] of formData.entries()) {
            // console.log(key, value);
        }

        const res = await api.post(
            "/heatmapConfig/createUpdate",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        // console.log("Create Zone Response:", res.data);

        return res.data;
    } catch (err) {
        console.error("Create Zone Error:", err);
        throw err;
    }
};

export const updateZone = async (data) => {
    try {
        const formData = new FormData();

        formData.append("vid", getVid());
        formData.append("heatmapid", data.heatmapid || "");
        formData.append("zoneid", data.zoneid || "");
        formData.append("mallname", data.mall);
        formData.append("floorname", data.floor);
        formData.append("zonename", data.zoneName);
        formData.append("imagewidth", data.imageW || "");
        formData.append("imageheight", data.imageH || "");

        formData.append(
            "zoneData",
            JSON.stringify(data.zoneData)
        );

        // Upload only if user selected a new full image
        if (data.fullImageFile instanceof File) {
            formData.append(
                "imageurl",
                data.fullImageFile
            );
        }

        // Upload only if crop regenerated
        if (data.cropFile instanceof File) {
            formData.append(
                "thumbnailurl",
                data.cropFile
            );
        }

        console.log("========= UPDATE FORM DATA =========");

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const res = await api.post(
            "/heatmapConfig/createUpdate",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

        if (!res.data.success) {
            throw new Error(
                res.data.message || "Update failed"
            );
        }

        return res.data;

    } catch (err) {
        console.error("Update Zone Error:", err);
        throw err;
    }
};
// export const updateZone = async (id, data) => {
//     try {
//         const formData = new FormData();

//         formData.append("mall", data.mall);
//         formData.append("floor", data.floor);
//         formData.append("zoneName", data.zoneName);
//         formData.append("imageW", data.imageW);
//         formData.append("imageH", data.imageH);

//         // ✅ send zoneData correctly
//         formData.append("zoneData", JSON.stringify(data.zoneData));

//         // ✅ files
//         if (data.fullImageFile) {
//             formData.append("fullImage", data.fullImageFile);
//         }

//         if (data.cropFile) {
//             formData.append("cropImage", data.cropFile);
//         }

//         const res = await api.put(
//             `/Heatmaps/UpdateZoneImages/${id}`,
//             formData,
//             {
//                 headers: { "Content-Type": "multipart/form-data" },
//             }
//         );

//         return res.data;

//     } catch (err) {
//         handleError(err);
//     }
//   };
//  DELETE 
export const deleteZone = async (id) => {
    try {
        const res = await api.post(
            "/heatmapConfig/deleteZone",
            {
                vid: getVid(),
                heatmapid: id
             },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Error DeleteZone:", error);
    }
};

// error handler
const handleError = (err) => {
    console.error(err);

    if (err.response) {
        throw new Error(err.response.data?.message || "API Error");
    } else if (err.request) {
        throw new Error("No response from server");
    } else {
        throw new Error(err.message);
    }
};