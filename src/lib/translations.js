// 1. Static UI Text Dictionary
export const translations = {
  en: {
    nav: {
      title: "Good Website",
      events: "Event List",
      users: "User List",
      logout: "Log Out",
      favorites: "Favorites"
    },
    home: {
      title: "Locations",
      searchPlaceholder: "Search Location",
      distancePlaceholder: "Within (km)",
      sortBy: "Sort by:",
      sortName: "Name",
      sortEvents: "Events",
      sortDistance: "Distance",
      headerName: "Name of Location",
      headerEvents: "No. of Events",
      headerDistance: "Distance",
      headerFavorite: "Add to Favorite",
      mapView: "Map View",
      locationDetails: "Location Details",
      addressUnavailable: "Address details unavailable",
      eventsSection: "Events",
      noEvents: "No events found.",
      presentedBy: "Presented by",
      comments: "Comments",
      writeComment: "Write a comment...",
      showMore: "More details",
      showLess: "Show less",
      viewMoreSessions: "View {count} more session(s)", // {count} is a placeholder
      dateTBA: "Date TBA",
      eventSessions: "Event Sessions:",
      tapDetails: "Tap for details",
      searchPlaceholder: "Search Location",
      unitKm: "km",                        
      addressUnavailable: "Address details unavailable"
    },
    profile: {
      title: "My Favorite Venues",
      subtitle: "Manage your saved cultural venues and locations.",
      emptyTitle: "No favorite venues yet",
      emptyDesc: "Start exploring and add venues to your favorites!",
      upcoming: "Upcoming Events"
    },
    login: {
      title: "Login",
      username: "Username",
      password: "Password",
      btn: "Login",
      noAccount: "Don't have an account?",
      signup: "Sign up"
    }
  },
  zh: {
    nav: {
      title: "優質網站",
      events: "活動列表",
      users: "用戶列表",
      logout: "登出",
      favorites: "我的最愛"
    },
    home: {
      title: "地點列表",
      searchPlaceholder: "搜尋地點",
      distancePlaceholder: "距離 (公里)",
      sortBy: "排序:",
      sortName: "名稱",
      sortEvents: "活動數",
      sortDistance: "距離",
      headerName: "地點名稱",
      headerEvents: "活動數目",
      headerDistance: "距離",
      headerFavorite: "加入最愛",
      mapView: "地圖預覽",
      locationDetails: "地點詳情",
      addressUnavailable: "暫無地址詳情",
      eventsSection: "活動",
      noEvents: "暫無活動",
      presentedBy: "主辦單位：",
      comments: "評論",
      writeComment: "寫下你的評論...",
      showMore: "更多詳情",
      showLess: "顯示較少",
      viewMoreSessions: "查看其餘 {count} 場次",
      dateTBA: "日期待定",
      eventSessions: "活動場次：",
      tapDetails: "點擊查看詳情",
      searchPlaceholder: "搜尋地點",        
      unitKm: "公里",                       
      addressUnavailable: "暫無地址詳情"
    },
    profile: {
      title: "我的最愛地點",
      subtitle: "管理您收藏的文化場地。",
      emptyTitle: "暫無收藏地點",
      emptyDesc: "開始探索並加入您的最愛！",
      upcoming: "即將舉行的活動"
    },
    login: {
      title: "登入",
      username: "用戶名",
      password: "密碼",
      btn: "登入",
      noAccount: "還沒有帳號？",
      signup: "註冊"
    }
  }
};

// 2. Location Mapping (Fixes missing DB data)
export const locationMap = {
  "Sha Tin": "沙田",
  "Sheung Shui": "上水",
  "Tai Po": "大埔",
  "Tsim Sha Tsui": "尖沙咀",
  "Aldrich Bay": "愛秩序灣",
  "Tuen Mun": "屯門",
  "Jordan Valley": "佐敦谷",
  "Kwai Fong": "葵芳",
  "Yuen Long": "元朗",
  "Ngau Chi Wan": "牛池灣",
  "Central": "中環",          
  "Lo Lung Hang": "老龍坑",
  "Sai Wan Ho": "西灣河",
  "Sheung Wan": "上環",
  
  // Areas
  "New Territories": "新界",
  "Kowloon": "九龍",
  "Hong Kong Island": "香港島",

  //"中環": "Central",    // Reverse map if needed, though usually not required for this logic
  //"香港島": "Hong Kong Island"
};