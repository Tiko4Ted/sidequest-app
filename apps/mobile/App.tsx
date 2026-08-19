import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as ExpoLocation from "expo-location";
import * as Clipboard from "expo-clipboard";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Syne_700Bold, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

const OR = "#ff6b2b";
const TL = "#00d4aa";
const PU = "#a78bfa";
const YL = "#fbbf24";
const RD = "#ff3b30";
const BG = "#07070f";
const S1 = "#10101a";
const S2 = "#181826";
const S3 = "#22223a";
const TX = "#f0f0f8";
const MT = "#55557a";
const MT2 = "#8888a8";
const NAV_HEIGHT = 76;
const NAV_ICON_SIZE = 24;
const NAV_LABEL_SIZE = 12;
const NAV_ITEM_MIN_WIDTH = 58;
const NAV_HOME_INDICATOR_WIDTH = 128;
const RADAR_LIST_SIDE_PADDING = 20;
const RADAR_LIST_ITEM_HEIGHT = 64;
const RADAR_LIST_GAP = 11;
const RADAR_LIST_THUMB_SIZE = 43;

type Screen = "Radar" | "Home" | "Detail" | "Chat" | "Post" | "I'm Free" | "Profile";
type ThemeName = "dark" | "light";
type QuestLocation = {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
};
type Coordinates = {
  latitude: number;
  longitude: number;
};
type PostedQuest = {
  id: string;
  emoji: string;
  title: string;
  place: string;
  location: QuestLocation;
  members: number;
  max: number;
  energy: number;
  start: string;
  full: boolean;
  distance: string;
  color: string;
  tag: string;
  angle: number;
  radius: number;
};

const DEFAULT_DEMO_LOCATION: QuestLocation = { name: "JKUAT Main Gate", area: "Juja", latitude: -1.0896, longitude: 37.0104 };
const STATIC_QUEST_LOCATIONS: Record<string, QuestLocation> = {
  "Bike Ride": { name: "Juja Farm Rd", area: "Juja Farm Road", latitude: -1.0962, longitude: 37.0155 },
  "Board Games": { name: "Kahawa Sukari", area: "Kahawa Sukari", latitude: -1.1922, longitude: 36.9314 },
  "Evening Football": { name: "JKUAT Grounds", area: "JKUAT", latitude: -1.094, longitude: 37.0129 },
  "Football": { name: "JKUAT Grounds", area: "JKUAT", latitude: -1.094, longitude: 37.0129 },
  "Pizza Run": { name: "Juja City Mall", area: "Juja", latitude: -1.1015, longitude: 37.0143 },
  "Coffee": { name: "Juja Coffee House", area: "Juja", latitude: -1.101, longitude: 37.0137 },
};

const MAX_QUEST_LOCATION_DISTANCE_METERS = 2000;

function metersBetween(a: Coordinates, b: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  return `${(meters / 1000).toFixed(1)}km`;
}

function fallbackLocationName(coords: Coordinates) {
  return `Pinned location ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

function questSlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "quest";
}

function questShareLink(title: string, questId?: string) {
  return `https://sidequest.app/q/${encodeURIComponent(questId ?? questSlug(title))}`;
}

function bearingDegrees(from: Coordinates, to: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const toDegrees = (value: number) => (value * 180) / Math.PI;
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function radarPositionFromCoordinates(origin: Coordinates, target: Coordinates) {
  const distance = metersBetween(origin, target);
  return {
    angle: bearingDegrees(origin, target),
    radius: Math.max(35, Math.min(132, 35 + (distance / MAX_QUEST_LOCATION_DISTANCE_METERS) * 97)),
  };
}

function mapPickerHtml(userCoords: Coordinates, selectedLocation: QuestLocation, maxDistanceMeters: number) {
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <style>
    html,body,#map{height:100%;margin:0;background:#07070f;font-family:Arial,sans-serif}
    .hint{position:absolute;left:12px;right:12px;top:12px;z-index:500;background:rgba(7,7,15,.88);color:#f0f0f8;border:1px solid rgba(255,107,43,.35);border-radius:12px;padding:10px 12px;font-size:13px;font-weight:700}
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="hint">Tap inside the orange 2km radius to set the quest pin.</div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const userLat = ${userCoords.latitude};
    const userLng = ${userCoords.longitude};
    const selectedLat = ${selectedLocation.latitude};
    const selectedLng = ${selectedLocation.longitude};
    const map = L.map('map', { zoomControl: true }).setView([selectedLat, selectedLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    L.circle([userLat, userLng], {
      radius: ${maxDistanceMeters},
      color: '#ff6b2b',
      weight: 2,
      fillColor: '#ff6b2b',
      fillOpacity: 0.08
    }).addTo(map);
    L.marker([userLat, userLng]).addTo(map).bindTooltip('You');
    let marker = L.marker([selectedLat, selectedLng]).addTo(map).bindTooltip('Quest pin');
    map.on('click', function(event) {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      marker.setLatLng([lat, lng]);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pick', latitude: lat, longitude: lng }));
    });
  </script>
</body>
</html>`;
}

function mapsPinUrl(location: QuestLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

function mapsDirectionsUrl(location: QuestLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=walking`;
}

const RADAR_THEMES = {
  dark: {
    bg: BG,
    surface: S1,
    surface2: S2,
    surface3: S3,
    text: TX,
    muted: MT,
    muted2: MT2,
    border: S3,
    softBorder: "#ffffff08",
    ghost: "#0b0b14",
    ring: "#ffffff08",
    ringActive: "#ff6b2b22",
    label: "#30304a",
    nav: "#09090fee",
    navBorder: "rgba(255,255,255,0.08)",
  },
  light: {
    bg: "#f6f7fb",
    surface: "#ffffff",
    surface2: "#edf0f7",
    surface3: "#dce2ee",
    text: "#161623",
    muted: "#6d7286",
    muted2: "#454b61",
    border: "#dce2ee",
    softBorder: "#d9deea",
    ghost: "#e9edf5",
    ring: "#1b223014",
    ringActive: "#ff6b2b35",
    label: "#7f879a",
    nav: "#fffffff2",
    navBorder: "rgba(22,22,35,0.1)",
  },
};

const USER_TABS: Array<{ id: Screen; icon: string; label: string; fab?: boolean }> = [
  { id: "Radar", icon: "⌖", label: "Radar" },
  { id: "Home", icon: "⌂", label: "Home" },
  { id: "Post", icon: "+", label: "Post", fab: true },
  { id: "I'm Free", icon: "⚡", label: "Free" },
  { id: "Profile", icon: "◉", label: "Me" },
];

const SUB_SCREENS: Screen[] = ["Detail", "Chat"];

const displayFont = "Syne_800ExtraBold";
const displayFontAlt = "Syne_700Bold";
const bodyFont = "Nunito_600SemiBold";
const bodyBold = "Nunito_800ExtraBold";
const ThemeContext = createContext<(typeof RADAR_THEMES)[ThemeName]>(RADAR_THEMES.dark);

function useAppPalette() {
  return useContext(ThemeContext);
}

function themeOverlayColor(palette: (typeof RADAR_THEMES)[ThemeName]) {
  return palette.bg === RADAR_THEMES.light.bg ? "rgba(246,247,251,0.92)" : "rgba(7,7,15,0.93)";
}

function androidFontSize(size?: number) {
  if (!size) {
    return size;
  }

  if (size < 10) {
    return 10;
  }
  if (size <= 12) {
    return size;
  }
  if (size < 16) {
    return 14;
  }
  if (size <= 22) {
    return size;
  }
  if (size < 24) {
    return 24;
  }

  return size;
}

function androidTextStyle(style?: object) {
  if (!style || !("fontSize" in style)) {
    return style;
  }

  return {
    ...style,
    fontSize: androidFontSize((style as { fontSize?: number }).fontSize),
  };
}

function AppText({
  children,
  style,
  display,
  numberOfLines,
}: {
  children: React.ReactNode;
  style?: object;
  display?: boolean;
  numberOfLines?: number;
}) {
  const palette = useAppPalette();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: display ? displayFont : bodyFont, color: palette.text }, androidTextStyle(style)]}
    >
      {children}
    </Text>
  );
}

function InAppMapSheet({
  visible,
  mode,
  location,
  userCoords,
  selectionError,
  onClose,
  onPickCoordinates,
}: {
  visible: boolean;
  mode: "pick" | "directions";
  location: QuestLocation;
  userCoords?: Coordinates;
  selectionError?: string;
  onClose: () => void;
  onPickCoordinates?: (coords: Coordinates) => void;
}) {
  const palette = useAppPalette();
  const mapUrl = mode === "directions" ? mapsDirectionsUrl(location) : mapsPinUrl(location);
  const pickerHtml = userCoords ? mapPickerHtml(userCoords, location, MAX_QUEST_LOCATION_DISTANCE_METERS) : "";
  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { type?: string; latitude?: number; longitude?: number };
      if (payload.type === "pick" && typeof payload.latitude === "number" && typeof payload.longitude === "number") {
        onPickCoordinates?.({ latitude: payload.latitude, longitude: payload.longitude });
      }
    } catch {
      // Ignore non-JSON map messages.
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <View style={{ paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={onClose} style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 }}>
            <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 14, lineHeight: 18 }}>Close</AppText>
          </Pressable>
          <View style={{ flex: 1 }}>
            <AppText display numberOfLines={1} style={{ color: palette.text, fontSize: 18, lineHeight: 23 }}>
              {mode === "directions" ? "Directions" : "Pick quest location"}
            </AppText>
            <AppText numberOfLines={1} style={{ color: palette.muted, fontSize: 12, lineHeight: 16 }}>
              {location.name} - {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </AppText>
          </View>
        </View>
        <WebView
          key={`${mode}-${location.latitude}-${location.longitude}`}
          source={mode === "pick" && userCoords ? { html: pickerHtml, baseUrl: "https://localhost" } : { uri: mapUrl }}
          onMessage={mode === "pick" ? handleMapMessage : undefined}
          startInLoadingState
          style={{ flex: 1, backgroundColor: palette.bg }}
        />
        {mode === "pick" ? (
          <View style={{ borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.bg, padding: 14 }}>
            {!!selectionError && (
              <View style={{ backgroundColor: "#ff3b3014", borderWidth: 1, borderColor: "#ff3b3040", borderRadius: 11, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 10 }}>
                <AppText style={{ color: RD, fontFamily: bodyBold, fontSize: 13, lineHeight: 18 }}>{selectionError}</AppText>
              </View>
            )}
            <AppText numberOfLines={1} style={{ color: palette.text, fontFamily: bodyBold, fontSize: 14, lineHeight: 18 }}>
              {location.name}
            </AppText>
            <AppText style={{ color: palette.muted, fontSize: 12, lineHeight: 16, marginBottom: 10 }}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </AppText>
            <Pressable onPress={onClose} style={{ marginHorizontal: 14, marginTop: 10, minHeight: 50, backgroundColor: OR, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
              <AppText display style={{ color: "white", fontSize: 15, lineHeight: 20 }}>Use this location</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={{ borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.bg, padding: 14 }}>
            <Pressable onPress={onClose} style={{ minHeight: 50, backgroundColor: TL, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
              <AppText display style={{ color: "#07110f", fontSize: 15, lineHeight: 20 }}>Done</AppText>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function getAvatar(name: string) {
  if (name === "You" || name === "AT" || name === "Atacama") {
    return { colors: ["#7c3aed", "#a78bfa"] as const, init: "AT" };
  }
  if (name.toLowerCase().includes("red") || name.toLowerCase().includes("rc")) {
    return { colors: ["#00d4aa", "#009977"] as const, init: name.slice(0, 2).toUpperCase() };
  }

  const palettes = [
    ["#3b82f6", "#818cf8"],
    ["#ec4899", "#f472b6"],
    ["#10b981", "#34d399"],
    ["#f59e0b", "#fbbf24"],
  ] as const;
  const picked = palettes[name.charCodeAt(0) % palettes.length];
  const init = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { colors: picked, init };
}

function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const avatar = getAvatar(name);

  return (
    <LinearGradient
      colors={avatar.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <AppText
        style={{
          color: "white",
          fontFamily: bodyBold,
          fontSize: Math.floor(size * 0.33),
          lineHeight: Math.floor(size * 0.42),
        }}
      >
        {avatar.init}
      </AppText>
    </LinearGradient>
  );
}

function Logo() {
  return (
    <AppText
      display
      style={{
        color: OR,
        fontSize: 22,
        letterSpacing: -1,
        lineHeight: 28,
        paddingVertical: 5,
      }}
    >
      SideQuest
    </AppText>
  );
}

function EnergyBar({ level, color = OR }: { level: number; color?: string }) {
  const palette = useAppPalette();
  const label = ["", "Low", "Med", "High", ""][level] || "High";

  return (
    <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={{
            width: 12,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: step <= level ? color : S3,
          }}
        />
      ))}
      <AppText
        style={{
          color: level >= 3 ? color : MT,
          fontFamily: bodyBold,
          fontSize: 8,
          marginLeft: 2,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

function Header({ action }: { action?: React.ReactNode }) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Logo />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {action}
        <Avatar name="AT" size={26} />
      </View>
    </View>
  );
}

function ThemeToggle({
  theme,
  onPress,
}: {
  theme: ThemeName;
  onPress: () => void;
}) {
  const light = theme === "light";

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: light }}
      accessibilityLabel="Toggle theme"
      onPress={onPress}
      style={({ pressed }) => ({
        width: 46,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: "center",
        backgroundColor: light ? "#e9edf5" : S2,
        borderWidth: 1,
        borderColor: light ? "#d2d8e6" : S3,
        opacity: pressed ? 0.78 : 1,
      })}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: light ? "flex-end" : "flex-start",
          backgroundColor: light ? OR : "#292943",
        }}
      >
        <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 10, lineHeight: 12 }}>
          {light ? "☀" : "☾"}
        </AppText>
      </View>
    </Pressable>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf: "flex-start",
        minHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#ff6b2b18",
        borderWidth: 1,
        borderColor: "#ff6b2b35",
        justifyContent: "center",
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 16, lineHeight: 20 }}>
        ← Back
      </AppText>
    </Pressable>
  );
}

function LiveStrip({
  compact = false,
  theme,
}: {
  compact?: boolean;
  theme?: (typeof RADAR_THEMES)[ThemeName];
}) {
  const appTheme = useAppPalette();
  const activeTheme = theme ?? appTheme;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: compact ? 3 : 4,
        paddingHorizontal: 14,
        backgroundColor: activeTheme.surface,
        borderBottomWidth: 1,
        borderBottomColor: activeTheme.border,
      }}
    >
      <View style={{ width: compact ? 4 : 5, height: compact ? 4 : 5, borderRadius: 3, backgroundColor: OR }} />
      <AppText style={{ color: activeTheme.muted2, fontFamily: bodyBold, fontSize: compact ? 8.5 : 9 }}>
        <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: compact ? 8.5 : 9 }}>
          23 people
        </AppText>{" "}
        active {compact ? "in Juja" : "· "}
        {!compact && (
          <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 9 }}>6 quests</AppText>
        )}
      </AppText>
      {!compact && (
        <AppText style={{ marginLeft: "auto", color: activeTheme.muted, fontFamily: bodyBold, fontSize: 8 }}>
          Juja
        </AppText>
      )}
    </View>
  );
}

function ScreenFrame({
  children,
  scroll = false,
  backgroundColor,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}) {
  const palette = useAppPalette();
  const resolvedBackground = backgroundColor ?? palette.bg;

  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: resolvedBackground }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 26, paddingHorizontal: 12, paddingBottom: 10 }}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={{ flex: 1, backgroundColor: resolvedBackground, paddingTop: 26 }}>{children}</View>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("Radar");
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [postedQuests, setPostedQuests] = useState<PostedQuest[]>([]);
  const [inQuest, setInQuest] = useState(false);
  const [joinedQuestKeys, setJoinedQuestKeys] = useState<Set<string>>(() => new Set());
  const [selectedQuestTitle, setSelectedQuestTitle] = useState("Bike Ride");
  const [postNotice, setPostNotice] = useState("");
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: BG }} />;
  }

  const activeTheme = RADAR_THEMES[theme];
  const selectedPostedQuest = postedQuests.find((quest) => quest.title === selectedQuestTitle);
  const openQuestDetail = (title: string) => {
    setSelectedQuestTitle(title);
    setScreen("Detail");
  };
  const joinQuest = (title: string) => {
    setInQuest(true);
    setJoinedQuestKeys((current) => new Set(current).add(title));
  };

  return (
    <ThemeContext.Provider value={activeTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: activeTheme.bg }}>
        <StatusBar style={theme === "light" ? "dark" : "light"} />
        <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: NAV_HEIGHT }}>
            {screen === "Radar" && (
              <RadarScreen
                nav={setScreen}
                theme={theme}
                postedQuests={postedQuests}
                joinedQuestKeys={joinedQuestKeys}
                onOpenDetail={openQuestDetail}
                onJoinQuest={joinQuest}
                onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              />
            )}
            {screen === "Home" && <HomeScreen nav={setScreen} postedQuests={postedQuests} postNotice={postNotice} joinedQuestKeys={joinedQuestKeys} onOpenDetail={openQuestDetail} onJoinQuest={joinQuest} />}
            {screen === "Detail" && <DetailScreen nav={setScreen} selectedQuestTitle={selectedQuestTitle} selectedQuest={selectedPostedQuest} joined={joinedQuestKeys.has(selectedQuestTitle)} onJoinQuest={() => joinQuest(selectedQuestTitle)} />}
            {screen === "Chat" && <ChatScreen nav={setScreen} selectedQuestTitle={selectedQuestTitle} selectedQuest={selectedPostedQuest} />}
            {screen === "Post" && (
              <PostScreen
                nav={setScreen}
                inQuest={inQuest}
                onPost={(quest, notifyFree) => {
                  setPostedQuests((current) => [quest, ...current]);
                  setInQuest(true);
                  setJoinedQuestKeys((current) => new Set(current).add(quest.title));
                  setPostNotice(
                    notifyFree
                      ? `Notified free/idle people about ${quest.title}.`
                      : `${quest.title} posted without notifying free/idle people.`,
                  );
                }}
                nextIndex={postedQuests.length}
              />
            )}
            {screen === "I'm Free" && <FreeScreen nav={setScreen} inQuest={inQuest} />}
            {screen === "Profile" && <ProfileScreen />}
          </View>
          <BottomNav screen={screen} nav={setScreen} />
        </View>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

function BottomNav({ screen, nav }: { screen: Screen; nav: (screen: Screen) => void }) {
  const palette = useAppPalette();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        backgroundColor: palette.nav,
        borderTopWidth: 1,
        borderTopColor: palette.navBorder,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-around",
        paddingTop: 13,
        paddingBottom: 18,
        zIndex: 40,
      }}
    >
      {USER_TABS.map((tab) => {
        const isActive =
          screen === tab.id || (tab.id === "Home" && SUB_SCREENS.includes(screen));

        if (tab.fab) {
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              onPress={() => nav(tab.id)}
              style={({ pressed }) => ({
                width: 46,
                height: 46,
                borderRadius: 15,
                marginTop: -4,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: OR,
                transform: [{ scale: screen === tab.id || pressed ? 0.94 : 1 }],
                shadowColor: OR,
                shadowOpacity: 0.5,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              })}
            >
              <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: NAV_ICON_SIZE, lineHeight: 28 }}>
                +
              </AppText>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            onPress={() => nav(tab.id)}
            style={({ pressed }) => ({
              minWidth: NAV_ITEM_MIN_WIDTH,
              paddingVertical: 0,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: "center",
              gap: 4,
              opacity: isActive ? 1 : pressed ? 0.65 : 0.45,
              transform: [{ scale: isActive ? 1.05 : 1 }],
            })}
          >
            <AppText style={{ color: isActive ? OR : MT2, fontFamily: bodyBold, fontSize: NAV_ICON_SIZE, lineHeight: NAV_ICON_SIZE }}>
              {tab.icon}
            </AppText>
            <AppText
              style={{
                color: isActive ? OR : MT,
                fontFamily: bodyBold,
                fontSize: NAV_LABEL_SIZE,
                lineHeight: 16,
                letterSpacing: 0.3,
              }}
            >
              {tab.label}
            </AppText>
            {isActive && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: OR, marginTop: 1 }} />}
          </Pressable>
        );
      })}
      <View
        style={{
          position: "absolute",
          bottom: 7,
          left: "50%",
          width: NAV_HOME_INDICATOR_WIDTH,
          height: 4,
          marginLeft: -(NAV_HOME_INDICATOR_WIDTH / 2),
          borderRadius: 2,
          backgroundColor: palette.surface3,
        }}
      />
    </View>
  );
}

function RadarScreen({
  nav,
  theme,
  postedQuests,
  joinedQuestKeys,
  onOpenDetail,
  onJoinQuest,
  onToggleTheme,
}: {
  nav: (screen: Screen) => void;
  theme: ThemeName;
  postedQuests: PostedQuest[];
  joinedQuestKeys: Set<string>;
  onOpenDetail: (title: string) => void;
  onJoinQuest: (title: string) => void;
  onToggleTheme: () => void;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(0)).current;
  const palette = RADAR_THEMES[theme];
  const radarSize = 420;
  const radarViewBoxSize = 270;
  const radarViewBoxInset = 25;
  const radarScale = radarSize / radarViewBoxSize;
  const dots = [
    { angle: 40, radius: 70, emoji: "☕", color: OR },
    { angle: 150, radius: 105, emoji: "⚽", color: OR },
    { angle: 230, radius: 128, emoji: "🎲", color: PU },
    { angle: 310, radius: 105, emoji: "🏃", color: OR },
    { angle: 80, radius: 128, emoji: "🩸", color: TL },
    { angle: 185, radius: 70, emoji: "⚡", color: RD },
    { angle: 18, radius: 96, emoji: "ðŸ“š", color: TL },
    { angle: 112, radius: 82, emoji: "ðŸ•", color: YL },
    { angle: 265, radius: 60, emoji: "ðŸŽ®", color: PU },
    { angle: 338, radius: 132, emoji: "ðŸ“¸", color: PU },
    { angle: 205, radius: 124, emoji: "ðŸŽ¤", color: RD },
    ...postedQuests.map((quest) => ({
      angle: quest.angle,
      radius: quest.radius,
      emoji: quest.emoji,
      color: quest.color,
    })),
  ];
  const pulseValues = useRef(dots.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    const animations = pulseValues.map((value, index) =>
      Animated.sequence([
        Animated.delay(index * 240),
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 1350,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(900),
          ]),
        ),
      ]),
    );

    animations.forEach((animation) => animation.start());

    return () => animations.forEach((animation) => animation.stop());
  }, [pulseValues]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(520),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [centerPulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const visibleEndedQuests = [
    {
      emoji: "🚲",
      label: "Bike Ride",
      endedMinutesAgo: 22,
      people: 5,
      participated: false,
    },
  ].filter((quest) => quest.endedMinutesAgo < 24 * 60);

  return (
    <ScreenFrame backgroundColor={palette.bg}>
      <Header action={<ThemeToggle theme={theme} onPress={onToggleTheme} />} />
      <LiveStrip theme={palette} />
      <View style={{ height: radarSize + 15, paddingTop: 10, paddingBottom: 5, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: radarSize, height: radarSize }}>
          <Svg width={radarSize} height={radarSize} viewBox="-25 -25 270 270">
            {[35, 63, 90, 112].map((radius, index) => (
              <Circle
                key={radius}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={index === 0 ? palette.ringActive : palette.ring}
                strokeWidth={index === 0 ? 1.5 : 1}
                strokeDasharray={index > 0 ? "4 5" : undefined}
              />
            ))}
            {dots.map((dot, index) => {
              const radians = (dot.angle * Math.PI) / 180;
              const x = 110 + dot.radius * 0.9 * Math.sin(radians);
              const y = 110 - dot.radius * 0.9 * Math.cos(radians);

              return (
                <React.Fragment key={`${dot.emoji}-${index}`}>
                  <Circle cx={x} cy={y} r={11} fill={dot.color} fillOpacity={0.12} stroke={dot.color} strokeWidth={1.5} />
                  <Circle cx={x} cy={y} r={14} fill="none" stroke={dot.color} strokeWidth={7} strokeOpacity={0.05} />
                  <SvgText x={x} y={y + 4} textAnchor="middle" fontSize="9">
                    {dot.emoji}
                  </SvgText>
                </React.Fragment>
              );
            })}
            <Circle cx="110" cy="110" r={5} fill={OR} />
            <Circle cx="110" cy="110" r={13} fill={OR} fillOpacity={0.12} />
            {["100m", "500m", "1km"].map((label, index) => (
              <SvgText
                key={label}
                x="112"
                y={110 - [35, 63, 90][index] + 8}
                fontSize="5.5"
                fill={palette.label}
                fontWeight="700"
              >
                {label}
              </SvgText>
            ))}
          </Svg>
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: (110 + radarViewBoxInset) * radarScale - 10,
              top: (110 + radarViewBoxInset) * radarScale - 10,
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: OR,
              opacity: centerPulse.interpolate({
                inputRange: [0, 0.18, 1],
                outputRange: [0, 0.62, 0],
              }),
              transform: [
                {
                  scale: centerPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.45, 3.5],
                  }),
                },
              ],
            }}
          />
          {dots.map((dot, index) => {
            const radians = (dot.angle * Math.PI) / 180;
            const x = 110 + dot.radius * 0.9 * Math.sin(radians);
            const y = 110 - dot.radius * 0.9 * Math.cos(radians);
            const pulse = pulseValues[index];
            const pulseSize = 24;

            return (
              <Animated.View
                key={`${dot.emoji}-${index}-pulse`}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: (x + radarViewBoxInset) * radarScale - pulseSize / 2,
                  top: (y + radarViewBoxInset) * radarScale - pulseSize / 2,
                  width: pulseSize,
                  height: pulseSize,
                  borderRadius: pulseSize / 2,
                  borderWidth: 1.5,
                  borderColor: dot.color,
                  opacity: pulse.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.55, 0],
                  }),
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 2.35],
                      }),
                    },
                  ],
                }}
              />
            );
          })}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: radarSize,
              height: radarSize,
              transform: [{ rotate }],
            }}
          >
            <View
              style={{
                position: "absolute",
                left: (109 + radarViewBoxInset) * radarScale,
                top: (16 + radarViewBoxInset) * radarScale,
                width: 1.5,
                height: 94 * radarScale,
                backgroundColor: "#ff6b2b38",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: (109 + radarViewBoxInset) * radarScale,
                top: (16 + radarViewBoxInset) * radarScale - 16,
                width: 1.5,
                height: 16,
                backgroundColor: "#ff6b2b38",
              }}
            />
          </Animated.View>
          {dots.map((dot, index) => {
            const radians = (dot.angle * Math.PI) / 180;
            const x = 110 + dot.radius * 0.9 * Math.sin(radians);
            const y = 110 - dot.radius * 0.9 * Math.cos(radians);

            return (
              <Pressable
                key={`${dot.emoji}-${index}-touch`}
                onPress={() => onOpenDetail(dot.emoji === "⚽" ? "Evening Football" : "Bike Ride")}
                style={{
                  position: "absolute",
                  left: (x + radarViewBoxInset) * radarScale - 22,
                  top: (y + radarViewBoxInset) * radarScale - 22,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                }}
              />
            );
          })}
        </View>
      </View>
      <View style={{ height: 10 }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: RADAR_LIST_SIDE_PADDING, paddingBottom: 12, gap: RADAR_LIST_GAP }}
        style={{ flex: 1 }}
      >
        {[
          ...postedQuests.map((quest) => ({
            id: quest.id,
            emoji: quest.emoji,
            label: quest.title,
            distance: quest.distance,
            color: quest.color,
            tag: quest.tag,
            joined: true,
          })),
          { id: "static-pizza-run", emoji: "⚡", label: "Pizza Run", distance: "195m", color: RD, tag: "FLASH 18min" },
          { id: "static-coffee", emoji: "☕", label: "Coffee", distance: "210m", color: OR, tag: "2/6" },
          { id: "static-football", emoji: "⚽", label: "Football", distance: "490m", color: OR, tag: "4/10" },
          { id: "static-gaming", emoji: "ðŸŽ®", label: "Gaming", distance: "260m", color: PU, tag: "3/8" },
          { id: "static-food-run", emoji: "ðŸ•", label: "Food Run", distance: "330m", color: YL, tag: "5/12" },
          { id: "static-study-sprint", emoji: "ðŸ“š", label: "Study Sprint", distance: "620m", color: TL, tag: "FOCUS" },
          { id: "static-sunset-photos", emoji: "ðŸ“¸", label: "Sunset Photos", distance: "880m", color: PU, tag: "CREW" },
        ].map((quest) => {
          const full = quest.label === "Football" || quest.label === "Evening Football" || quest.tag.includes("10/10");
          const joined = ("joined" in quest && quest.joined) || joinedQuestKeys.has(quest.label);

          return (
          <Pressable
            key={quest.id}
            onPress={() => onOpenDetail(quest.label)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              minHeight: RADAR_LIST_ITEM_HEIGHT,
              backgroundColor: full ? palette.ghost : palette.surface,
              borderWidth: 1,
              borderColor: full ? palette.softBorder : palette.border,
              borderRadius: 15,
              paddingVertical: 10,
              paddingHorizontal: 13,
              opacity: full ? 0.8 : pressed ? 0.78 : 1,
            })}
          >
            <View
              style={{
                width: RADAR_LIST_THUMB_SIZE,
                height: RADAR_LIST_THUMB_SIZE,
                borderRadius: 10,
                backgroundColor: `${quest.color}24`,
                borderWidth: 1,
                borderColor: `${quest.color}32`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText style={{ fontSize: 22, lineHeight: 26 }}>{quest.emoji}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: full ? palette.muted : palette.text, fontFamily: bodyBold, fontSize: 16, lineHeight: 21 }}>
                {quest.label}
              </AppText>
              <AppText style={{ color: full ? palette.muted : palette.muted2, fontFamily: bodyFont, fontSize: 13, lineHeight: 18 }}>
                {full ? "Quest full - create similar" : joined ? `${quest.distance} - in squad` : `${quest.distance} - ${quest.tag}`}
              </AppText>
            </View>
            <Pressable
              onPress={() => {
                if (full) {
                  nav("Post");
                  return;
                }
                onJoinQuest(quest.label);
              }}
              style={{
                minWidth: full ? 88 : 46,
                borderRadius: 8,
                borderWidth: full ? 1 : 0,
                borderColor: full ? palette.border : "transparent",
                backgroundColor: full ? palette.surface2 : joined ? TL : quest.color,
                paddingVertical: 6,
                paddingHorizontal: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText style={{ color: full ? palette.muted : "white", fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>
                {full ? "Create similar" : joined ? "In" : "Join"}
              </AppText>
            </Pressable>
          </Pressable>
          );
        })}
        {visibleEndedQuests.map((endedQuest) => (
        <View
          key={endedQuest.label}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            minHeight: RADAR_LIST_ITEM_HEIGHT,
            backgroundColor: palette.ghost,
            borderWidth: 1,
            borderColor: palette.softBorder,
            borderRadius: 15,
            paddingVertical: 10,
            paddingHorizontal: 13,
            opacity: 0.55,
          }}
        >
          <View
            style={{
              width: RADAR_LIST_THUMB_SIZE,
              height: RADAR_LIST_THUMB_SIZE,
              borderRadius: 10,
              backgroundColor: palette.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText style={{ fontSize: 20, opacity: 0.45 }}>🚲</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 16, lineHeight: 21 }}>{endedQuest.label}</AppText>
            <AppText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
              Ended {endedQuest.endedMinutesAgo} min ago - {endedQuest.people} people - visible 24h
            </AppText>
          </View>
          <View style={{ backgroundColor: palette.surface2, borderRadius: 8, borderWidth: 1, borderColor: palette.border, paddingVertical: 6, paddingHorizontal: 10 }}>
            <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>
              {endedQuest.participated ? "Memory" : "Ghost"}
            </AppText>
          </View>
        </View>
        ))}
        {false && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            minHeight: RADAR_LIST_ITEM_HEIGHT,
            backgroundColor: palette.ghost,
            borderWidth: 1,
            borderColor: palette.softBorder,
            borderRadius: 15,
            paddingVertical: 10,
            paddingHorizontal: 13,
            opacity: 0.55,
          }}
        >
          <AppText style={{ fontSize: 16, opacity: 0.4 }}>🚲</AppText>
          <View style={{ flex: 1 }}>
            <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 10 }}>Bike Ride · ended 22 min ago</AppText>
            <AppText style={{ color: palette.muted, fontSize: 8 }}>5 people · dissolved</AppText>
          </View>
          <View style={{ backgroundColor: palette.surface2, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
            <AppText style={{ color: palette.muted, fontSize: 8 }}>ghost</AppText>
          </View>
        </View>
        )}
      </ScrollView>
    </ScreenFrame>
  );
}

function HomeScreen({
  nav,
  postedQuests,
  postNotice,
  joinedQuestKeys,
  onOpenDetail,
  onJoinQuest,
}: {
  nav: (screen: Screen) => void;
  postedQuests: PostedQuest[];
  postNotice: string;
  joinedQuestKeys: Set<string>;
  onOpenDetail: (title: string) => void;
  onJoinQuest: (title: string) => void;
}) {
  const palette = useAppPalette();
  const ticker = useRef(new Animated.Value(0)).current;
  const latestPostedQuest = postedQuests[0];
  const latestPostLink = latestPostedQuest ? questShareLink(latestPostedQuest.title, latestPostedQuest.id) : "";
  const [copiedPostLink, setCopiedPostLink] = useState(false);

  const copyLatestPostLink = async () => {
    if (!latestPostLink) {
      return;
    }

    await Clipboard.setStringAsync(latestPostLink);
    setCopiedPostLink(true);
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ticker, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [ticker]);

  useEffect(() => {
    setCopiedPostLink(false);
  }, [latestPostLink]);

  const translateX = ticker.interpolate({ inputRange: [0, 1], outputRange: [0, -230] });
  const quests = [
    ...postedQuests,
    { id: "static-bike-ride", emoji: "🚲", title: "Bike Ride", place: "Juja Farm Rd", members: 3, max: 6, energy: 4, start: "17:30", full: false },
    { id: "static-board-games", emoji: "🎲", title: "Board Games", place: "Kahawa Sukari", members: 4, max: 8, energy: 3, start: "19:00", full: false },
    { id: "static-evening-football", emoji: "⚽", title: "Evening Football", place: "JKUAT Grounds", members: 10, max: 10, energy: 2, start: "18:00", full: true },
  ];

  return (
    <ScreenFrame>
      <Header />
      <View
        style={{
          backgroundColor: "#ff3b3014",
          borderBottomWidth: 1,
          borderBottomColor: "#ff3b3025",
          paddingVertical: 3,
          flexDirection: "row",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <AppText style={{ color: RD, fontFamily: bodyBold, fontSize: 8.5, paddingHorizontal: 8 }}>⚡</AppText>
        <View style={{ flex: 1, overflow: "hidden" }}>
          <Animated.View style={{ flexDirection: "row", gap: 28, transform: [{ translateX }] }}>
            {["Pizza Run · 300m · 14 min", "Taco Hunt · 600m · 22 min", "Pizza Run · 300m · 14 min", "Taco Hunt · 600m · 22 min"].map((item, index) => (
              <AppText key={`${item}-${index}`} style={{ color: "#ff8080", fontFamily: bodyBold, fontSize: 8.5 }}>
                {item}
              </AppText>
            ))}
          </Animated.View>
        </View>
      </View>
      <LiveStrip compact />
      {!!postNotice && (
        <View style={{ marginHorizontal: 9, marginTop: 6, marginBottom: 2, backgroundColor: `${TL}14`, borderWidth: 1, borderColor: `${TL}35`, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10 }}>
          <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>{postNotice}</AppText>
          {!!latestPostedQuest && (
            <View style={{ marginTop: 7, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <AppText numberOfLines={1} style={{ flex: 1, color: palette.muted2, fontSize: 11, lineHeight: 15 }}>
                {latestPostLink}
              </AppText>
              <Pressable
                onPress={copyLatestPostLink}
                style={({ pressed }) => ({
                  backgroundColor: `${PU}18`,
                  borderWidth: 1,
                  borderColor: `${PU}40`,
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  opacity: pressed ? 0.78 : 1,
                })}
              >
                <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>{copiedPostLink ? "Copied" : "Copy link"}</AppText>
              </Pressable>
            </View>
          )}
        </View>
      )}
      <View style={{ flexDirection: "row", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ paddingVertical: 5, paddingHorizontal: 9, borderBottomWidth: 2, borderBottomColor: OR }}>
          <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 10 }}>Quests</AppText>
        </View>
        <View style={{ paddingVertical: 5, paddingHorizontal: 9 }}>
          <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 10 }}>Community</AppText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 9, gap: 6, paddingBottom: 8 }}
      >
        {quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            joined={joinedQuestKeys.has(quest.title)}
            onPress={() => onOpenDetail(quest.title)}
            onJoin={() => onJoinQuest(quest.title)}
            onCreateSimilar={() => nav("Post")}
          />
        ))}
        <View
          style={{
            backgroundColor: palette.ghost,
            borderWidth: 1,
            borderColor: palette.softBorder,
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 10,
            opacity: 0.55,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AppText style={{ fontSize: 16, opacity: 0.35 }}>🚲</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 10 }}>Bike Ride ended 25 min ago</AppText>
              <AppText style={{ color: palette.muted, fontSize: 8 }}>5 people · dissolved</AppText>
            </View>
            <View style={{ backgroundColor: palette.surface2, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
              <AppText style={{ color: palette.muted, fontSize: 8 }}>ghost</AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

function QuestCard({
  quest,
  joined,
  onPress,
  onJoin,
  onCreateSimilar,
}: {
  quest: {
    emoji: string;
    title: string;
    place: string;
    members: number;
    max: number;
    energy: number;
    start: string;
    full: boolean;
  };
  joined: boolean;
  onPress: () => void;
  onJoin: () => void;
  onCreateSimilar: () => void;
}) {
  const palette = useAppPalette();
  const full = quest.full || quest.members >= quest.max;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: full ? palette.ghost : palette.surface,
        borderWidth: 1,
        borderColor: full ? palette.softBorder : palette.border,
        borderRadius: 14,
        padding: 10,
        overflow: "hidden",
        opacity: full ? 0.8 : pressed ? 0.78 : 1,
      })}
    >
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: full ? palette.muted : OR }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <AppText style={{ fontSize: 24, lineHeight: 27 }}>{quest.emoji}</AppText>
        {full ? (
          <View style={{ backgroundColor: palette.surface2, borderColor: palette.border, borderWidth: 1, borderRadius: 7, paddingVertical: 2, paddingHorizontal: 7 }}>
            <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 8.5 }}>QUEST FULL</AppText>
          </View>
        ) : (
          <View style={{ backgroundColor: `${TL}18`, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
            <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 7.5 }}>▶ {quest.start}</AppText>
          </View>
        )}
      </View>
      <AppText display style={{ color: full ? palette.muted : palette.text, fontFamily: displayFontAlt, fontSize: 12, marginBottom: 1 }}>
        {quest.title}
      </AppText>
      <AppText style={{ color: palette.muted, fontSize: 8.5, marginBottom: 6 }}>⌖ {quest.place}</AppText>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: full ? 0 : 5 }}>
        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
          {Array.from({ length: Math.min(quest.max, 5) }).map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index < quest.members ? OR : palette.surface3,
                borderWidth: 1,
                borderColor: index < quest.members ? OR : "#ffffff12",
              }}
            />
          ))}
          <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 12, lineHeight: 15.5, marginLeft: 2 }}>
            {quest.members}/{quest.max}
          </AppText>
        </View>
        {full ? (
          <Pressable onPress={onCreateSimilar} style={{ backgroundColor: palette.surface2, borderRadius: 7, paddingVertical: 3, paddingHorizontal: 9 }}>
            <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 8.5 }}>Create similar</AppText>
          </Pressable>
        ) : (
          <Pressable onPress={onJoin} style={{ backgroundColor: joined ? TL : OR, borderRadius: 7, paddingVertical: 4, paddingHorizontal: 10 }}>
            <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 8.5 }}>{joined ? "In" : "Join"}</AppText>
          </Pressable>
        )}
      </View>
      {!full && <EnergyBar level={quest.energy} />}
    </Pressable>
  );
}

function DetailScreen({
  nav,
  selectedQuestTitle,
  selectedQuest,
  joined,
  onJoinQuest,
}: {
  nav: (screen: Screen) => void;
  selectedQuestTitle: string;
  selectedQuest?: PostedQuest;
  joined: boolean;
  onJoinQuest: () => void;
}) {
  const palette = useAppPalette();
  const full = selectedQuestTitle === "Football" || selectedQuestTitle === "Evening Football";
  const questLocation = selectedQuest?.location ?? STATIC_QUEST_LOCATIONS[selectedQuestTitle] ?? DEFAULT_DEMO_LOCATION;
  const detailStart = selectedQuest?.start ?? "17:30";
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const shareLink = questShareLink(selectedQuestTitle, selectedQuest?.id);
  const copyQuestLink = async () => {
    await Clipboard.setStringAsync(shareLink);
    setCopiedLink(true);
  };

  useEffect(() => {
    setCopiedLink(false);
  }, [shareLink]);

  return (
    <ScreenFrame scroll>
      <View style={{ marginHorizontal: -12, marginTop: -26, paddingTop: 32, paddingHorizontal: 13, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: S3 }}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, backgroundColor: OR }} />
        <View style={{ marginBottom: 8 }}>
          <BackButton onPress={() => nav("Home")} />
        </View>
        <AppText style={{ fontSize: 38, lineHeight: 42, marginBottom: 6 }}>🚲</AppText>
        <AppText display style={{ color: palette.text, fontSize: 20, marginBottom: 2 }}>{selectedQuestTitle}</AppText>
        <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 9.5 }}>⌖ {questLocation.area} area</AppText>
        <AppText style={{ color: palette.muted2, fontFamily: "Nunito_400Regular", fontSize: 8, marginTop: 1, fontStyle: "italic" }}>
          {joined ? `${questLocation.latitude.toFixed(4)}, ${questLocation.longitude.toFixed(4)}` : "Exact location unlocks when you join"}
        </AppText>
      </View>
      <View style={{ paddingTop: 10 }}>
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 9 }}>
          {[
            { label: "Squad", value: full ? "10/10" : joined ? "3/6" : "2/6", color: OR },
            { label: "Expires", value: "18h", color: palette.text },
            { label: "Starts", value: detailStart, color: TL },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 6 }}>
              <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</AppText>
              <AppText display style={{ color: item.color, fontFamily: displayFontAlt, fontSize: 14 }}>{item.value}</AppText>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 }}>
          <AppText style={{ color: palette.muted2, fontSize: 9, lineHeight: 15 }}>Casual evening ride through Juja Farm. Any bike works.</AppText>
        </View>
        <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Hype — last 2h</AppText>
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
          {[
            { emoji: "🔥", recent: 3, total: 7, color: OR, pct: "80%" },
            { emoji: "👀", recent: 6, total: 11, color: TL, pct: "100%" },
            { emoji: "🚀", recent: 1, total: 5, color: PU, pct: "30%" },
          ].map((hype) => (
            <View key={hype.emoji} style={{ flex: 1, backgroundColor: palette.surface2, borderWidth: 1, borderColor: `${hype.color}30`, borderRadius: 9, paddingVertical: 5, alignItems: "center", overflow: "hidden" }}>
              <View style={{ position: "absolute", bottom: 0, left: 0, width: hype.pct as "80%" | "100%" | "30%", height: 2, backgroundColor: hype.color }} />
              <AppText style={{ fontSize: 14, marginBottom: 1 }}>{hype.emoji}</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 1 }}>
                <AppText style={{ color: hype.color, fontFamily: bodyBold, fontSize: 11 }}>{hype.recent}</AppText>
                <AppText style={{ color: palette.muted, fontSize: 7.5 }}>/{hype.total}</AppText>
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginBottom: 8 }}>
          <EnergyBar level={3} />
        </View>
        <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 11, padding: 9, marginBottom: 8 }}>
          <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 14, lineHeight: 18, marginBottom: 2 }}>{questLocation.name}</AppText>
          <AppText style={{ color: palette.muted, fontSize: 12, lineHeight: 16, marginBottom: 8 }}>
            {joined ? "Exact pin is unlocked for directions." : "Join to unlock directions to the exact pin."}
          </AppText>
          <Pressable
            disabled={!joined}
            onPress={() => setDirectionsOpen(true)}
            style={({ pressed }) => ({
              backgroundColor: joined ? `${TL}18` : palette.surface2,
              borderWidth: 1,
              borderColor: joined ? `${TL}40` : palette.border,
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: "center",
              opacity: !joined ? 0.55 : pressed ? 0.78 : 1,
            })}
          >
            <AppText style={{ color: joined ? TL : palette.muted, fontFamily: bodyBold, fontSize: 13, lineHeight: 18 }}>Open directions in Google Maps</AppText>
          </Pressable>
          {joined ? (
            <AppText numberOfLines={1} style={{ color: palette.muted2, fontSize: 11, lineHeight: 15, marginTop: 8 }}>
              {shareLink}
            </AppText>
          ) : null}
          <Pressable
            disabled={!joined}
            onPress={copyQuestLink}
            style={({ pressed }) => ({
              marginTop: 8,
              backgroundColor: joined ? `${PU}18` : palette.surface2,
              borderWidth: 1,
              borderColor: joined ? `${PU}40` : palette.border,
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: "center",
              opacity: !joined ? 0.55 : pressed ? 0.78 : 1,
            })}
          >
            <AppText style={{ color: joined ? PU : palette.muted, fontFamily: bodyBold, fontSize: 13, lineHeight: 18 }}>
              {copiedLink ? "Quest link copied" : "Copy quest link"}
            </AppText>
          </Pressable>
        </View>
        <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 11, padding: 9, alignItems: "center", marginBottom: 8 }}>
          <AppText style={{ fontSize: 18, marginBottom: 2 }}>💬</AppText>
          <AppText display style={{ color: palette.text, fontSize: 10, marginBottom: 3 }}>Chat unlocks at 3 members</AppText>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginBottom: 2 }}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: index < 2 ? OR : S3, borderWidth: 1.5, borderColor: index < 2 ? OR : "#ffffff16" }} />
            ))}
          </View>
          <AppText style={{ color: palette.muted, fontSize: 7.5 }}>1 more needed</AppText>
        </View>
        {full ? (
          <Pressable onPress={() => nav("Post")} style={({ pressed }) => ({ backgroundColor: palette.surface2, borderWidth: 1, borderColor: palette.border, borderRadius: 12, padding: 11, alignItems: "center", opacity: pressed ? 0.8 : 1 })}>
            <AppText display style={{ color: palette.muted, fontSize: 13 }}>Quest full - Create similar</AppText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              if (!joined) {
                onJoinQuest();
              }
              nav("Chat");
            }}
            style={({ pressed }) => ({ backgroundColor: joined ? TL : OR, borderRadius: 12, padding: 11, alignItems: "center", opacity: pressed ? 0.8 : 1 })}
          >
            <AppText display style={{ color: "white", fontSize: 13 }}>{joined ? "In - Open Chat" : "⚡ Join Quest"}</AppText>
          </Pressable>
        )}
      </View>
      <InAppMapSheet visible={directionsOpen} mode="directions" location={questLocation} onClose={() => setDirectionsOpen(false)} />
    </ScreenFrame>
  );
}

function ChatScreen({
  nav,
  selectedQuestTitle,
  selectedQuest,
}: {
  nav: (screen: Screen) => void;
  selectedQuestTitle: string;
  selectedQuest?: PostedQuest;
}) {
  const palette = useAppPalette();
  const [copiedLink, setCopiedLink] = useState(false);
  const shareLink = questShareLink(selectedQuestTitle, selectedQuest?.id);
  const copyQuestLink = async () => {
    await Clipboard.setStringAsync(shareLink);
    setCopiedLink(true);
  };
  const messages = [
    { user: "Alex M.", text: "Main stage at 5pm?" },
    { user: "Joy K.", text: "Works! Which route?" },
    { user: "Alex M.", text: "Farm loop → bypass" },
    { user: "You", text: "On my way! 10 mins" },
  ];

  useEffect(() => {
    setCopiedLink(false);
  }, [shareLink]);

  return (
    <ScreenFrame>
      <View style={{ paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ marginBottom: 6 }}>
          <BackButton onPress={() => nav("Detail")} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <AppText style={{ fontSize: 20 }}>🚲</AppText>
          <View style={{ flex: 1 }}>
            <AppText numberOfLines={1} style={{ color: palette.text, fontFamily: bodyBold, fontSize: 14, lineHeight: 18, marginBottom: 2 }}>{selectedQuestTitle} · dissolves in 1h 44m</AppText>
            <AppText style={{ color: palette.muted, fontSize: 12, lineHeight: 16 }}>⌖ Main Stage · 3/6</AppText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#ff6b2b14", borderWidth: 1, borderColor: "#ff6b2b25", borderRadius: 7, paddingVertical: 2, paddingHorizontal: 6 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: OR }} />
            <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 12, lineHeight: 14 }}>Live</AppText>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.border }} contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 8, gap: 4 }}>
        {[
          { name: "Alex M.", status: "Already there", color: OR },
          { name: "Joy K.", status: "On my way", color: TL },
          { name: "You", status: "On my way", color: PU },
        ].map((member) => (
          <View key={member.name} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: palette.surface2, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 7 }}>
            <Avatar name={member.name} size={18} />
            <View>
              <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 12, lineHeight: 15 }}>{member.name === "You" ? "You" : member.name.split(" ")[0]}</AppText>
              <AppText style={{ color: member.color, fontFamily: bodyBold, fontSize: 10, lineHeight: 12 }}>{member.status}</AppText>
            </View>
          </View>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10, gap: 9 }} showsVerticalScrollIndicator={false}>
        {messages.map((message, index) => {
          const mine = message.user === "You";

          return (
            <View key={`${message.user}-${index}`} style={{ flexDirection: mine ? "row-reverse" : "row", gap: 4, alignItems: "flex-end" }}>
              {!mine && <Avatar name={message.user} size={24} />}
              <View style={{ maxWidth: "78%" }}>
                {!mine && <AppText style={{ color: palette.muted2, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, marginBottom: 3 }}>{message.user}</AppText>}
                <View style={{ backgroundColor: mine ? OR : palette.surface2, borderRadius: 12, borderBottomRightRadius: mine ? 4 : 12, borderBottomLeftRadius: mine ? 12 : 4, paddingVertical: 8, paddingHorizontal: 11 }}>
                  <AppText style={{ color: mine ? "white" : palette.text, fontSize: 16, lineHeight: 22 }}>{message.text}</AppText>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ marginHorizontal: 8, marginVertical: 3, backgroundColor: "#a78bfa12", borderWidth: 1, borderColor: "#a78bfa30", borderRadius: 9, paddingVertical: 6, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5 }}>
        <AppText style={{ fontSize: 13 }}>🔗</AppText>
        <View style={{ flex: 1 }}>
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>Share quest link</AppText>
          <AppText numberOfLines={1} style={{ color: palette.muted, fontSize: 11, lineHeight: 15 }}>{shareLink}</AppText>
        </View>
        <Pressable onPress={copyQuestLink} style={({ pressed }) => ({ backgroundColor: "#a78bfa18", borderWidth: 1, borderColor: "#a78bfa30", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, opacity: pressed ? 0.78 : 1 })}>
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>{copiedLink ? "Copied" : "Copy"}</AppText>
        </Pressable>
      </View>
      <View style={{ paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: palette.border, flexDirection: "row", gap: 4 }}>
        <View style={{ flex: 1, backgroundColor: palette.surface2, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}>
          <AppText style={{ color: palette.muted, fontSize: 14, lineHeight: 18 }}>Coordinate — where are you meeting?</AppText>
        </View>
        <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: OR, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 11 }}>➤</AppText>
        </View>
      </View>
    </ScreenFrame>
  );
}

function PostScreen({
  nav,
  inQuest,
  onPost,
  nextIndex,
}: {
  nav: (screen: Screen) => void;
  inQuest: boolean;
  onPost: (quest: PostedQuest, notifyFree: boolean) => void;
  nextIndex: number;
}) {
  const palette = useAppPalette();
  const templates = [
    ["☕", "Coffee"],
    ["⚽", "Football"],
    ["🎲", "Games"],
    ["🚶", "Walk"],
    ["🏃", "Run"],
    ["🍕", "Food"],
    ["🎮", "Gaming"],
    ["🏊", "Swim"],
  ];
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [activityTitle, setActivityTitle] = useState("Football");
  const [maxPeople, setMaxPeople] = useState(10);
  const [notifyFree, setNotifyFree] = useState(true);
  const [startTime, setStartTime] = useState("18:00");
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<QuestLocation | null>(null);
  const [locationError, setLocationError] = useState("");
  const selected = templates[selectedTemplate];

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      const permission = await ExpoLocation.requestForegroundPermissionsAsync();
      if (!mounted) {
        return;
      }

      if (permission.status !== "granted") {
        setLocationError("Allow location access to pick a quest point within 2km.");
        return;
      }

      const current = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      if (!mounted) {
        return;
      }

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setUserCoords(coords);
      setSelectedPlace(await nameLocationFromCoordinates(coords));
      setLocationError("");
    }

    loadLocation().catch(() => {
      if (mounted) {
        setLocationError("Could not read your current location.");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function nameLocationFromCoordinates(coords: Coordinates): Promise<QuestLocation> {
    try {
      const [address] = await ExpoLocation.reverseGeocodeAsync(coords);
      const name =
        [address?.name, address?.street]
          .filter(Boolean)
          .join(", ") || fallbackLocationName(coords);
      const area = [address?.district, address?.city, address?.region].filter(Boolean).join(", ") || "Selected pin";

      return { name, area, ...coords };
    } catch {
      return { name: fallbackLocationName(coords), area: "Selected pin", ...coords };
    }
  }

  async function handlePickCoordinates(coords: Coordinates) {
    if (!userCoords) {
      setLocationError("Current location is required before selecting a quest point.");
      return;
    }

    const distanceMeters = metersBetween(userCoords, coords);
    if (distanceMeters > MAX_QUEST_LOCATION_DISTANCE_METERS) {
      setLocationError(`Pick a point within 2km. This pin is ${formatDistance(distanceMeters)} away.`);
      return;
    }

    const namedLocation = await nameLocationFromCoordinates(coords);
    setSelectedPlace(namedLocation);
    setLocationError("");
  }

  function postQuest() {
    if (inQuest) {
      return;
    }

    if (!userCoords || !selectedPlace) {
      setLocationError("Select a quest location within 2km before posting.");
      setMapPickerOpen(true);
      return;
    }

    const color = [OR, TL, PU, YL][nextIndex % 4];
    const distanceMeters = metersBetween(userCoords, selectedPlace);
    if (distanceMeters > MAX_QUEST_LOCATION_DISTANCE_METERS) {
      setLocationError(`Pick a point within 2km. This pin is ${formatDistance(distanceMeters)} away.`);
      setMapPickerOpen(true);
      return;
    }

    const radarPosition = radarPositionFromCoordinates(userCoords, selectedPlace);
    onPost({
      id: `posted-${Date.now()}`,
      emoji: selected[0],
      title: activityTitle.trim() || selected[1],
      place: selectedPlace.name,
      location: selectedPlace,
      members: 1,
      max: Math.min(maxPeople, 10),
      energy: 3,
      start: startTime.trim() || "18:00",
      full: false,
      distance: formatDistance(distanceMeters),
      color,
      tag: "NEW 1/" + Math.min(maxPeople, 10),
      angle: radarPosition.angle,
      radius: radarPosition.radius,
    }, notifyFree);
    nav("Home");
  }

  if (inQuest) {
    return (
      <ScreenFrame scroll>
        <View style={{ height: 18 }} />
        <View
          style={{
            marginHorizontal: 8,
            minHeight: RADAR_LIST_ITEM_HEIGHT,
            backgroundColor: palette.surface,
            borderWidth: 1.5,
            borderColor: `${OR}35`,
            borderRadius: 15,
            paddingVertical: 18,
            paddingHorizontal: 14,
            marginBottom: RADAR_LIST_GAP,
          }}
        >
          <AppText display style={{ color: palette.text, fontSize: 24, lineHeight: 30, marginBottom: 8 }}>
            Quest posting locked
          </AppText>
          <AppText style={{ color: palette.muted2, fontFamily: bodyBold, fontSize: 16, lineHeight: 22 }}>
            You're already inside an active quest. Finish or leave that quest before creating another one.
          </AppText>
        </View>
        <Pressable
          onPress={() => nav("Home")}
          style={({ pressed }) => ({
            marginHorizontal: 8,
            minHeight: RADAR_LIST_ITEM_HEIGHT,
            backgroundColor: OR,
            borderRadius: 15,
            padding: 13,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <AppText display style={{ color: "white", fontSize: 16, lineHeight: 21 }}>
            Back to Home
          </AppText>
        </Pressable>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame scroll>
      <View style={{ height: 18 }} />
      <View style={{ marginHorizontal: 8 }}>
      <AppText display style={{ color: palette.text, fontSize: 24, lineHeight: 30, marginBottom: 4 }}>
        Post a <AppText display style={{ color: OR, fontSize: 24, lineHeight: 30 }}>Quest</AppText>
      </AppText>
      <AppText style={{ color: palette.muted, fontSize: 13, lineHeight: 18, marginBottom: RADAR_LIST_GAP }}>Visible to people near you in 30 seconds.</AppText>
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Quick start</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {templates.map(([emoji, label], index) => (
          <Pressable
            key={label}
            onPress={() => {
              setSelectedTemplate(index);
              setActivityTitle(label);
            }}
            style={{ width: "24%", backgroundColor: index === selectedTemplate ? "#ff6b2b20" : palette.surface, borderWidth: 1.5, borderColor: index === selectedTemplate ? OR : palette.border, borderRadius: 9, paddingVertical: 5, alignItems: "center" }}
          >
            <AppText style={{ fontSize: 15, marginBottom: 1 }}>{emoji}</AppText>
            <AppText style={{ color: index === selectedTemplate ? OR : palette.muted2, fontFamily: bodyBold, fontSize: 7 }}>{label}</AppText>
          </Pressable>
        ))}
      </View>
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Activity</AppText>
      <View style={{ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: palette.surface, borderWidth: 1.5, borderColor: OR, borderRadius: 15, paddingVertical: 10, paddingHorizontal: 13, marginBottom: RADAR_LIST_GAP, justifyContent: "center" }}>
        <TextInput
          value={activityTitle}
          onChangeText={setActivityTitle}
          placeholder="Type any event"
          placeholderTextColor={palette.muted}
          maxLength={40}
          style={{
            color: palette.text,
            fontFamily: bodyBold,
            fontSize: 16,
            lineHeight: 21,
            padding: 0,
            margin: 0,
          }}
        />
        <AppText style={{ color: palette.muted2, fontSize: 13, lineHeight: 18 }}>Quick start only fills this field</AppText>
      </View>
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Location</AppText>
      <View style={{ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.border, borderRadius: 15, paddingVertical: 10, paddingHorizontal: 13, marginBottom: RADAR_LIST_GAP, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ width: RADAR_LIST_THUMB_SIZE, height: RADAR_LIST_THUMB_SIZE, borderRadius: 10, backgroundColor: `${PU}20`, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 18, lineHeight: 22 }}>⌖</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ color: selectedPlace ? palette.text : palette.muted, fontFamily: bodyBold, fontSize: 16, lineHeight: 21 }}>
            {selectedPlace ? selectedPlace.name : "Getting your location"}
          </AppText>
          <AppText style={{ color: palette.muted2, fontSize: 13, lineHeight: 18 }}>
            {selectedPlace
              ? `${selectedPlace.latitude.toFixed(4)}, ${selectedPlace.longitude.toFixed(4)}`
              : "Allow GPS to pick a point within 2km"}
          </AppText>
        </View>
        <Pressable
          onPress={() => {
            if (!userCoords || !selectedPlace) {
              setLocationError("Allow location access before opening the map.");
              return;
            }
            setMapPickerOpen(true);
          }}
          style={{ backgroundColor: `${PU}18`, borderWidth: 1, borderColor: `${PU}40`, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignItems: "center", opacity: userCoords && selectedPlace ? 1 : 0.55 }}
        >
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 12, lineHeight: 16 }}>Map</AppText>
        </Pressable>
      </View>
      {!!locationError && (
        <View style={{ backgroundColor: "#ff3b3014", borderWidth: 1, borderColor: "#ff3b3040", borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, marginBottom: RADAR_LIST_GAP }}>
          <AppText style={{ color: RD, fontFamily: bodyBold, fontSize: 13, lineHeight: 18 }}>{locationError}</AppText>
        </View>
      )}
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Start time</AppText>
      <View style={{ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: `${TL}10`, borderWidth: 1.5, borderColor: `${TL}40`, borderRadius: 15, paddingVertical: 10, paddingHorizontal: 13, marginBottom: RADAR_LIST_GAP, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ width: RADAR_LIST_THUMB_SIZE, height: RADAR_LIST_THUMB_SIZE, borderRadius: 10, backgroundColor: `${TL}20`, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 18, lineHeight: 22 }}>▶</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            value={startTime}
            onChangeText={(value) => setStartTime(value.replace(/[^\d:]/g, "").slice(0, 5))}
            placeholder="18:00"
            placeholderTextColor={palette.muted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={{
              color: palette.text,
              fontFamily: bodyBold,
              fontSize: 16,
              lineHeight: 21,
              padding: 0,
              margin: 0,
            }}
          />
          <AppText style={{ color: TL, fontSize: 13, lineHeight: 18 }}>Tap to edit start time</AppText>
        </View>
      </View>
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Squad size</AppText>
      <View style={{ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.border, borderRadius: 15, paddingVertical: 8, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: RADAR_LIST_GAP }}>
        <Pressable onPress={() => setMaxPeople((current) => Math.max(3, current - 1))}>
          <StepperButton label="−" />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <AppText display style={{ color: OR, fontSize: 28, lineHeight: 34 }}>{maxPeople}</AppText>
          <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 13, lineHeight: 18 }}>max people</AppText>
        </View>
        <Pressable onPress={() => setMaxPeople((current) => Math.min(10, current + 1))}>
          <StepperButton label="+" />
        </Pressable>
      </View>
      <View style={{ backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.border, borderRadius: 15, padding: 13, marginBottom: RADAR_LIST_GAP }}>
        <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 16, lineHeight: 21, marginBottom: 10 }}>
          Notify people who are free/idle?
        </AppText>
        <View style={{ flexDirection: "row", gap: RADAR_LIST_GAP }}>
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => (
            <Pressable
              key={option.label}
              onPress={() => setNotifyFree(option.value)}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: notifyFree === option.value ? `${TL}20` : palette.surface2,
                borderWidth: 1,
                borderColor: notifyFree === option.value ? TL : palette.border,
              }}
            >
              <AppText style={{ color: notifyFree === option.value ? TL : palette.muted, fontFamily: bodyBold, fontSize: 16, lineHeight: 21 }}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable onPress={postQuest} style={({ pressed }) => ({ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: OR, borderRadius: 15, padding: 13, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.8 : 1 })}>
        <AppText display style={{ color: "white", fontSize: 16, lineHeight: 21 }}>Post Quest</AppText>
      </Pressable>
      </View>
      {selectedPlace && userCoords && (
        <InAppMapSheet
          visible={mapPickerOpen}
          mode="pick"
          location={selectedPlace}
          userCoords={userCoords}
          selectionError={locationError}
          onClose={() => setMapPickerOpen(false)}
          onPickCoordinates={handlePickCoordinates}
        />
      )}
    </ScreenFrame>
  );
}

function FreeScreen({
  nav,
  inQuest,
}: {
  nav: (screen: Screen) => void;
  inQuest: boolean;
}) {
  const palette = useAppPalette();
  const [broadcasting, setBroadcasting] = useState(false);

  return (
    <ScreenFrame scroll>
      <View style={{ alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, backgroundColor: "#a78bfa0e", borderRadius: 14, borderWidth: 1, borderColor: `${PU}35`, marginTop: 18, marginBottom: 10 }}>
        <AppText style={{ fontSize: 34, marginBottom: 5 }}>⚡</AppText>
        <AppText display style={{ color: palette.text, fontSize: 17, marginBottom: 2 }}>I'm Free Mode</AppText>
        <AppText style={{ color: palette.muted2, fontSize: 9, lineHeight: 14, textAlign: "center" }}>No plan. No activity.{"\n"}People within 1km see you're free.</AppText>
      </View>
      <View style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 8 }}>
        <AppText style={{ color: palette.muted, fontSize: 8.5, marginBottom: 4 }}>
          {inQuest ? "Unavailable while you are in a quest" : broadcasting ? "Broadcast active for " : "Next broadcast in "}
          {!inQuest && <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8.5 }}>{broadcasting ? "1h 54m" : "now"}</AppText>}
        </AppText>
        <View style={{ height: 4, backgroundColor: palette.surface3, borderRadius: 2, overflow: "hidden" }}>
          <View style={{ width: "27%", height: "100%", backgroundColor: PU, borderRadius: 2 }} />
        </View>
      </View>
      {broadcasting && !inQuest && (
      <View style={{ backgroundColor: "#a78bfa10", borderWidth: 1.5, borderColor: `${PU}45`, borderRadius: 12, padding: 10, marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <AppText display style={{ color: palette.text, fontSize: 11 }}>Broadcasting ⚡</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: PU }} />
            <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 7.5 }}>LIVE</AppText>
          </View>
        </View>
        <AppText style={{ color: palette.muted2, fontSize: 8, marginBottom: 6 }}>⌖ 1km · Expires 1h 54m · 2 replies</AppText>
        {[
          { name: "Ciku N.", text: "☕ Coffee sounds good?" },
          { name: "Brian T.", text: "Football? Also free!" },
        ].map((reply) => (
          <View key={reply.name} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: palette.surface2, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 7, marginBottom: 4 }}>
            <Avatar name={reply.name} size={20} />
            <View style={{ flex: 1 }}>
              <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 9 }}>{reply.name}</AppText>
              <AppText style={{ color: palette.muted2, fontSize: 9 }}>{reply.text}</AppText>
            </View>
            <Pressable onPress={() => nav("Post")} style={{ backgroundColor: "#a78bfa12", borderWidth: 1, borderColor: `${PU}40`, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 }}>
              <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8 }}>Reply</AppText>
            </Pressable>
          </View>
        ))}
      </View>
      )}
      <Pressable
        disabled={inQuest}
        onPress={() => setBroadcasting((current) => !current)}
        style={({ pressed }) => ({
          backgroundColor: inQuest ? palette.surface2 : broadcasting ? palette.surface2 : PU,
          borderWidth: broadcasting || inQuest ? 1 : 0,
          borderColor: `${PU}45`,
          borderRadius: 11,
          padding: 12,
          alignItems: "center",
          opacity: inQuest ? 0.55 : pressed ? 0.78 : 1,
        })}
      >
        <AppText display style={{ color: inQuest ? palette.muted : broadcasting ? PU : "white", fontSize: 14 }}>
          {inQuest ? "In a quest - free mode locked" : broadcasting ? "Stop broadcasting" : "⚡ Broadcast I'm Free"}
        </AppText>
      </Pressable>
    </ScreenFrame>
  );
}

function ProfileScreen() {
  const palette = useAppPalette();
  const cards = [
    { emoji: "🚲", title: "Bike Ride", vibe: "🔥", gold: true, shared: true },
    { emoji: "🎲", title: "Games", vibe: "✨", gold: false, shared: true },
    { emoji: "⚽", title: "Football", vibe: "⚡", gold: false, shared: false },
    { emoji: "🩸", title: "Blood Drive", vibe: "💛", gold: false, shared: false },
  ];

  return (
    <ScreenFrame>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}>
        <View style={{ paddingTop: 28, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: palette.border, alignItems: "center", backgroundColor: palette.surface }}>
          <View style={{ position: "relative", marginBottom: 6 }}>
            <Avatar name="AT" size={46} />
            <View style={{ position: "absolute", bottom: -2, right: -2, backgroundColor: YL, borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: BG }}>
              <AppText style={{ color: "#08080f", fontFamily: bodyBold, fontSize: 8 }}>7</AppText>
            </View>
          </View>
          <AppText display style={{ color: palette.text, fontSize: 14 }}>Atacama</AppText>
          <AppText style={{ color: palette.muted, fontSize: 8, marginBottom: 6 }}>Juja · Urban Explorer</AppText>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
            <Badge text="7-day streak" color={YL} emoji="🔥" />
            <Badge text="Fast Joiner" color={PU} emoji="⚡" />
          </View>
        </View>
        <View style={{ paddingVertical: 8, paddingHorizontal: 11 }}>
          <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
            {[
              { value: "14", label: "Quests", color: OR },
              { value: "4", label: "Vibe", color: YL },
              { value: "88", label: "Energy", color: TL },
            ].map((stat) => (
              <View key={stat.label} style={{ flex: 1, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 8, paddingVertical: 6, alignItems: "center" }}>
                <AppText display style={{ color: stat.color, fontSize: 12 }}>{stat.value}</AppText>
                <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 6.5, marginTop: 1 }}>{stat.label}</AppText>
              </View>
            ))}
          </View>
          <SectionLabel>Badges</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
            {[
              ["🚀", "First"],
              ["🔥", "7-Day"],
              ["🎲", "Wild"],
              ["⚡", "Fast"],
              ["☕", "Starter"],
              ["🩸", "Civic"],
              ["✨", "Vibe"],
              ["?", "?"],
            ].map(([emoji, label], index) => (
              <View key={label} style={{ width: 36, alignItems: "center", gap: 1, backgroundColor: palette.surface, borderWidth: 1, borderColor: "#fbbf2430", borderRadius: 8, paddingVertical: 4, opacity: index >= 6 ? 0.3 : 1 }}>
                <AppText style={{ fontSize: 13 }}>{emoji}</AppText>
                <AppText style={{ color: palette.muted2, fontFamily: bodyBold, fontSize: 5.5, textAlign: "center" }}>{label}</AppText>
              </View>
            ))}
          </View>
          <SectionLabel>Story Cards</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {cards.map((card, index) => (
              <View key={`${card.title}-${index}`} style={{ width: "49%", backgroundColor: card.gold ? `${YL}12` : card.shared ? palette.surface : palette.ghost, borderWidth: 1, borderColor: card.gold ? `${YL}40` : card.shared ? palette.border : palette.softBorder, borderRadius: 10, padding: 7, alignItems: "center", overflow: "hidden" }}>
                {!card.shared && (
                  <View style={{ position: "absolute", inset: 0, backgroundColor: themeOverlayColor(palette), zIndex: 2, alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <AppText style={{ fontSize: 10 }}>🔒</AppText>
                    <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 6.5, textAlign: "center", paddingHorizontal: 3 }}>Quest together first</AppText>
                  </View>
                )}
                <AppText style={{ fontSize: 18, marginBottom: 2 }}>{card.emoji}</AppText>
                <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 8.5, marginBottom: 1 }}>{card.title}</AppText>
                <AppText style={{ fontSize: 11 }}>{card.vibe}</AppText>
              </View>
            ))}
          </View>
          <SectionLabel>Squad Memory</SectionLabel>
          {[
            ["Alex M.", "4"],
            ["Joy K.", "3"],
          ].map(([name, count]) => (
            <View key={name} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: palette.border }}>
              <Avatar name={name} size={22} />
              <View style={{ flex: 1 }}>
                <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 9.5 }}>{name}</AppText>
                <AppText style={{ color: palette.muted, fontSize: 7.5 }}>Quested {count}x</AppText>
              </View>
              <View style={{ backgroundColor: "#ff6b2b14", borderWidth: 1, borderColor: "#ff6b2b28", borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 }}>
                <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 7.5 }}>Quest again</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const palette = useAppPalette();

  return (
    <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </AppText>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  const palette = useAppPalette();

  return (
    <View>
      <AppText style={{ color: palette.muted, fontFamily: bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </AppText>
      <View style={{ minHeight: RADAR_LIST_ITEM_HEIGHT, backgroundColor: palette.surface, borderWidth: 1.5, borderColor: color || palette.border, borderRadius: 15, paddingVertical: 10, paddingHorizontal: 13, marginBottom: RADAR_LIST_GAP, justifyContent: "center" }}>
        <AppText style={{ color: color ? palette.text : palette.muted2, fontFamily: bodyBold, fontSize: 16, lineHeight: 21 }}>{value}</AppText>
      </View>
    </View>
  );
}

function StepperButton({ label }: { label: string }) {
  const palette = useAppPalette();

  return (
    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.border, alignItems: "center", justifyContent: "center" }}>
      <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 22, lineHeight: 26 }}>{label}</AppText>
    </View>
  );
}

function Badge({ text, color, emoji }: { text: string; color: string; emoji: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: `${color}18`, borderWidth: 1, borderColor: `${color}40`, borderRadius: 20, paddingVertical: 2, paddingHorizontal: 7 }}>
      <AppText style={{ fontSize: 9 }}>{emoji}</AppText>
      <AppText style={{ color, fontFamily: bodyBold, fontSize: 8 }}>{text}</AppText>
    </View>
  );
}
