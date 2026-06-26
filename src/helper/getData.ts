import axiosService from "../utils/lib/axiosService";

export const fetchNews = async (page: any, catId: any) => {
  const URL = `?per_page=10&_embed&page=${page}${
    catId ? `&categories=${catId}` : ""
  }`;

  console.log("fetch nrws url ==>>> ", URL);

  try {
    const response = await axiosService.get(URL);
    return response.data;
  } catch (error) {
    throw error; // let the caller's catch block handle it
  }
};

// export const fetchNews = async (page: any, catId: any) => {
//   const URL = `?per_page=10&_embed&page=${page}&${catId}`;
//   try {
//     const response = await axiosService.get(URL);
//     return response.data;
//   } catch (error) {}
// };

// Alert.alert(
//     "Error",
//     "Please check your internet connection and try again",
//     [
//       { text: "Retry", onPress: fetchNews(page, catId) },
//       { text: "Cancel", style: "cancel" },
//     ]
//   );
//   Vibration.vibrate();
