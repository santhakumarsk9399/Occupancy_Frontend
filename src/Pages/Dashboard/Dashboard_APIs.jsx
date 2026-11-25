import axios from "axios";

const token = sessionStorage.getItem("token"); // token
const vid = sessionStorage.getItem("vid"); // vendor id
const MainUsername = sessionStorage.getItem("username"); // username

const filters = async () => {
  try {
    let payload = {
      vid: vid,
      username: MainUsername,
      country: "",
      city: "",
      zone: "",
    };
    let response = await axios.post(
      `${API_URL}/dashboard/dashboard1filter/filters`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
// // Fetch all countries
// export async function getCountries() {
//   const res = await api.get("/master/countries");
//   return (res.data?.data || []).map((c) => ({
//     value: String(c.id),
//     label: c.name,
//   }));
// }

// // Fetch all cities
// export async function getCities() {
//   const res = await api.get("/master/cities");
//   return (res.data?.data || []).map((ci) => ({
//     value: String(ci.id),
//     label: ci.name,
//     countryId: String(ci.countryId),
//   }));
// }

// // Fetch all zones
// export async function getZones() {
//   const res = await api.get("/master/zones");
//   return (res.data?.data || []).map((z) => ({
//     value: String(z.id),
//     label: z.name,
//     cityId: String(z.cityId),
//   }));
// }

export {filters}