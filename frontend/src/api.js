import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000
});

// Request Interceptor (Token அனுப்புவதற்கு)
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- ✅ சரிசெய்யப்பட்ட பகுதி (Response Interceptor) ---
// இது பிழைகளை கையாளுவதற்காக
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // 401 (Unauthorized) அல்லது 403 (Forbidden) பிழை வந்தால்
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // 1. பயனரின் பழைய டேட்டாவை localStorage-லிருந்து நீக்கவும்
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");

      // 2. 'storage' event-ஐ dispatch செய்யவும் (TopNav போன்ற மற்ற இடங்கள் அப்டேட் ஆக)
      window.dispatchEvent(new Event("storage"));

      // 3. லாகின் பக்கத்திற்கு அனுப்பவும்
      // (ஏற்கனவே லாகின் பக்கத்தில் இல்லை என்றால் மட்டும்)
      if (window.location.pathname !== '/login') {
        console.error("Token expired or invalid. Redirecting to login.");
        window.location.href = '/login'; // கட்டாயமாக லாகின் பக்கத்திற்கு அனுப்பும்
      }
    }
    
    // மற்ற பிழைகளை கையாளுவதற்காக பிழையை திருப்பி அனுப்பவும்
    return Promise.reject(error);
  }
);
// --- ✅ சரிசெய்யப்பட்ட பகுதி முடிந்தது ---

export default api;