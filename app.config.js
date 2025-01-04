module.exports = {
  "expo": {
    "name": "septem",
    "slug": "septem",
    "version": "1.0.0",
    "versionCode": 1,
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.ryzaman.septem",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "c4939041-6eac-4094-b8b4-13ff99aa1beb"
      }
    },
    "owner": "ryzaman",
    "plugins": [
      [
        "expo-updates",
        {
          "username": "ryzaman",
        }
      ]
    ],
    "updates": {
      "url": "https://u.expo.dev/c4939041-6eac-4094-b8b4-13ff99aa1beb"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
