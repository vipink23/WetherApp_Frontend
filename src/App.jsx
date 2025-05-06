import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  // const [currentWeather, setCurrentWether] = useState(null);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: null,
    description: null,
  });
  const [latitude, setLatitude] = useState(28.6448); // Default latitude for India
  const [longitude, setLongitude] = useState(77.2269); // Default longitude for India
  const [selectedCity, setSelectedCity] = useState("lat=28.6139&long=77.2090");
  const [recentdata, setRecentData] = useState([]);
  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&timezone=auto`
      );

      const temperature = res?.data?.current_weather?.temperature;
      const weatherCode = res?.data?.current_weather?.weathercode;

      let weatherDescription = "Unknown"; // Default value

      // Mapping weather codes to human-readable descriptions
      if (weatherCode === 0) {
        weatherDescription = "Clear sky";
      } else if (weatherCode === 1 || weatherCode === 2) {
        weatherDescription = "Partly cloudy";
      } else if (weatherCode === 3) {
        weatherDescription = "Cloudy";
      } else if (weatherCode === 45 || weatherCode === 48) {
        weatherDescription = "Fog";
      } else if (weatherCode >= 51 && weatherCode <= 56) {
        weatherDescription = "Light to moderate rain";
      } else if (weatherCode === 61 || weatherCode === 63) {
        weatherDescription = "Heavy rain";
      }
      setCurrentWeather({
        temperature,
        description: weatherDescription,
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const AddWethertoDb = async () => {
    try {
      let country = "Unknown";
      if (latitude && longitude) {
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        country = geoRes.data?.address?.city || "Unknown";
      }
      const addedData = {
        country: country,
        latitude: latitude?.toString() || "",
        longitude: longitude?.toString() || "",
        weather: currentWeather?.description?.toString() || "Unknown",
        date: new Date().toISOString().split("T")[0],
      };
      const res = await axios.post(
        "http://localhost:3000/AddWeather",
        addedData
      );
      console.log("Response:", res.data);
    } catch (error) {
      console.error(error.response?.data || error.message, "err");
    }
  };

  const fetchRecentData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/AllWeather");
      setRecentData(response.data);
    } catch (error) {
      console.log(error, "errr");
    }
  };
  console.log(recentdata);

  useEffect(() => {
    fetchRecentData();
  }, []);

  useEffect(() => {
    fetchWeather();
    AddWethertoDb();
  }, [latitude, longitude]); // Re-fetch weather whenever lat or long changes

  const handleSelect = (e) => {
    const selectedValue = e.target.value;
    setSelectedCity(selectedValue);
    const [lat, long] = selectedValue
      .split("&")
      .map((item) => item.split("=")[1]);
    setLatitude(lat);
    setLongitude(long);
  };

  // search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle the search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter the data based on search query
  const filteredData = recentdata.filter((item) => {
    return (
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex flex-col md:flex-row w-full min-h-screen items-center justify-center bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 p-6 w-full max-w-5xl rounded-3xl">
          {/* Left Panel: Weather Info */}
          <div className="bg-orange-100 text-orange-600 p-8 rounded-3xl w-full md:w-1/3 shadow-lg py-14">
            <div className="text-xl font-semibold mb-4 text-center">
              Today <span className="text-sm">▼</span>
            </div>
            <div className="text-6xl font-bold flex items-center gap-2 mb-2 text-center">
              ☀️ <span>{currentWeather.temperature}</span>
            </div>
            <div className="text-xl mb-3 text-center">
              {currentWeather.description}
            </div>
            <div className="text-sm text-orange-500 text-center mb-2">
              <select onChange={handleSelect} value={selectedCity}>
                {/* <option value="">Choose City</option> */}
                <option value={`lat=28.6448&long=77.2269`}>Delhi</option>
                <option value={`lat=55.7558&long=37.6173`}>Moscow</option>
                <option value={`lat=48.8566&long=2.3522`}>Paris</option>
                <option value={`lat=40.7128&long=-74.0060`}>New York</option>
                <option value={`lat=-33.8688&long=151.2093`}>Sydney</option>
                <option value={`lat=24.7136&long=46.6753`}>Riyadh</option>
              </select>
            </div>
            <div className="text-base text-orange-500 mb-4 text-center mt-3">
              {new Date().toLocaleDateString("en-GB")}
            </div>
            <div className="text-sm text-orange-500 text-center">
              Feels like 30 | Sunset 18:20
            </div>
          </div>

          <div className="flex flex-col w-full md:w-1/2 space-y-4">
            {/* Forecast Section */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl text-gray-800 shadow">
              <div className="grid grid-cols-6 gap-4 text-center text-sm">
                <div>
                  <div>Now</div>
                  <div>☁️ 25°</div>
                </div>
                <div>
                  <div>2 AM</div>
                  <div>☁️ 25°</div>
                </div>
                <div>
                  <div>3 AM</div>
                  <div>☁️ 23°</div>
                </div>
                <div>
                  <div>4 AM</div>
                  <div>☁️ 22°</div>
                </div>
                <div>
                  <div>5 AM</div>
                  <div>☁️ 20°</div>
                </div>
                <div>
                  <div>6 AM</div>
                  <div>☁️ 25°</div>
                </div>
              </div>
              <hr className="mt-5" />
              <div className="grid grid-cols-6 gap-4 text-center text-sm p-4">
                <div>
                  <div>Now</div>
                  <div>☁️ 25°</div>
                </div>
                <div>
                  <div>2 AM</div>
                  <div>☁️ 25°</div>
                </div>
                <div>
                  <div>3 AM</div>
                  <div>☁️ 23°</div>
                </div>
                <div>
                  <div>4 AM</div>
                  <div>☁️ 22°</div>
                </div>
                <div>
                  <div>5 AM</div>
                  <div>☁️ 20°</div>
                </div>
                <div>
                  <div>6 AM</div>
                  <div>☁️ 25°</div>
                </div>
              </div>
            </div>

            {/* Random Text */}
            <div className="text-white drop-shadow mt-8">
              <h2 className="text-xl font-semibold mb-2">Random Text</h2>
              <p className="text-sm leading-relaxed">
                Improve him believe opinion offered met and end cheered forbade.
                Friendly as stronger speedily by recurred. Son interest wandered
                sir addition end say. Manners beloved affixed picture men ask.
              </p>
            </div>

            <div className="mt-6 bg-white/70 w-full rounded-xl p-4 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent table
                </h3>
                <input
                  type="text"
                  placeholder="Search by city or date"
                  className="border p-2"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <table className="w-full table-auto border-collapse">
                <thead className="bg-orange-200 text-orange-800">
                  <tr>
                    <th className="px-4 py-2 text-left">City</th>
                    <th className="px-4 py-2 text-left">latitude</th>
                    <th className="px-4 py-2 text-left">Longitude</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="border-t border-orange-100">
                      <td className="px-4 py-2">{item.country}</td>
                      <td className="px-4 py-2">{item.latitude}</td>
                      <td className="px-4 py-2">{item.longitude}</td>
                      <td className="px-4 py-2">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
