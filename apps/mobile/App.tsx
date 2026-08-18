import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { WebView } from "react-native-webview";

const COLORS = {
  orange: "#ff6b2b",
  teal: "#00d4aa",
  purple: "#a78bfa",
  red: "#ff3b30",
  gold: "#fbbf24",
};

const QUESTS = [
  {
    id: "pizza-run",
    emoji: "⚡",
    title: "Pizza Run",
    distance: 195,
    angle: 185,
    radius: 70,
    color: COLORS.red,
    tag: "FLASH",
    time: "18 min",
    members: 3,
    max: 5,
    place: "Juja City Mall side gate",
    energy: 4,
  },
  {
    id: "coffee",
    emoji: "☕",
    title: "Coffee",
    distance: 210,
    angle: 40,
    radius: 70,
    color: COLORS.orange,
    tag: "2/6",
    time: "Starts 17:20",
    members: 2,
    max: 6,
    place: "Gate C cafes",
    energy: 2,
  },
  {
    id: "football",
    emoji: "⚽",
    title: "Football",
    distance: 490,
    angle: 150,
    radius: 105,
    color: COLORS.orange,
    tag: "4/10",
    time: "Starts 18:00",
    members: 4,
    max: 10,
    place: "JKUAT grounds",
    energy: 3,
  },
  {
    id: "blood-drive",
    emoji: "🩸",
    title: "Blood Drive",
    distance: 860,
    angle: 80,
    radius: 128,
    color: COLORS.teal,
    tag: "COMMUNITY",
    time: "Open now",
    members: 18,
    max: 80,
    place: "Student center",
    energy: 4,
  },
  {
    id: "board-games",
    emoji: "🎲",
    title: "Board Games",
    distance: 1200,
    angle: 230,
    radius: 128,
    color: COLORS.purple,
    tag: "WILD",
    time: "Starts 19:00",
    members: 4,
    max: 8,
    place: "Kahawa Sukari",
    energy: 3,
  },
  {
    id: "evening-run",
    emoji: "🏃",
    title: "Evening Run",
    distance: 760,
    angle: 310,
    radius: 105,
    color: COLORS.orange,
    tag: "3/7",
    time: "Starts 17:45",
    members: 3,
    max: 7,
    place: "Juja Farm Road",
    energy: 2,
  },
  {
    id: "study-sprint",
    emoji: "📚",
    title: "Study Sprint",
    distance: 160,
    angle: 265,
    radius: 58,
    color: COLORS.teal,
    tag: "FOCUS",
    time: "Starts 16:40",
    members: 5,
    max: 12,
    place: "Library quiet wing",
    energy: 2,
  },
  {
    id: "taco-pop",
    emoji: "🌮",
    title: "Taco Pop-up",
    distance: 330,
    angle: 115,
    radius: 88,
    color: COLORS.gold,
    tag: "FOOD",
    time: "Open 20 min",
    members: 7,
    max: 14,
    place: "Main gate stalls",
    energy: 3,
  },
  {
    id: "sunset-photos",
    emoji: "📸",
    title: "Sunset Photos",
    distance: 640,
    angle: 350,
    radius: 112,
    color: COLORS.purple,
    tag: "CREW",
    time: "Starts 18:25",
    members: 3,
    max: 6,
    place: "Rooftop hostel B",
    energy: 3,
  },
  {
    id: "hack-night",
    emoji: "💻",
    title: "Hack Night",
    distance: 980,
    angle: 20,
    radius: 134,
    color: COLORS.teal,
    tag: "BUILD",
    time: "Starts 20:00",
    members: 9,
    max: 18,
    place: "Innovation lab",
    energy: 4,
  },
  {
    id: "karaoke",
    emoji: "🎤",
    title: "Karaoke",
    distance: 1450,
    angle: 205,
    radius: 138,
    color: COLORS.red,
    tag: "LOUD",
    time: "Starts 21:30",
    members: 6,
    max: 20,
    place: "Juja Square lounge",
    energy: 4,
  },
  {
    id: "chess-corner",
    emoji: "♟",
    title: "Chess Corner",
    distance: 520,
    angle: 292,
    radius: 96,
    color: COLORS.gold,
    tag: "1/8",
    time: "Open now",
    members: 1,
    max: 8,
    place: "Student center steps",
    energy: 1,
  },
];

type ThemeName = "dark" | "light";
type Quest = (typeof QUESTS)[number];
type HomeTab = "quests" | "community";
type UserScreen = "radar" | "home" | "detail" | "chat" | "post" | "free" | "profile";

const QUEST_EMOJI_OPTIONS = ["⚡", "☕", "⚽", "📚", "🍕", "🎤", "💻", "📸"];
const QUEST_POST_COOLDOWN_MS = 4 * 60 * 60 * 1000;

function formatCooldown(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

const VIEWER_LOCATION = {
  name: "Your current area",
  latitude: -1.1018,
  longitude: 37.0144,
};

const LOCATION_OPTIONS = [
  { name: "Garden City Mall", detail: "Thika Road, Nairobi", latitude: -1.2322, longitude: 36.8785 },
  { name: "Juja City Mall", detail: "Juja town", latitude: -1.1004, longitude: 37.0132 },
  { name: "JKUAT Main Gate", detail: "Juja campus entrance", latitude: -1.0958, longitude: 37.0128 },
  { name: "Student Center", detail: "JKUAT campus", latitude: -1.0897, longitude: 37.0102 },
  { name: "Kahawa Sukari", detail: "Kahawa Sukari estate", latitude: -1.1928, longitude: 36.9306 },
];

type LocationOption = (typeof LOCATION_OPTIONS)[number];

function getDistanceMeters(from: typeof VIEWER_LOCATION, to: LocationOption) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function getQuestHeadcount(quest: Quest, joined: boolean) {
  return Math.min(quest.members + (joined ? 1 : 0), quest.max);
}

function isQuestPassed(quest: Quest) {
  const normalizedTime = quest.time.toLowerCase();

  if (
    normalizedTime.includes("ended") ||
    normalizedTime.includes("passed") ||
    normalizedTime.includes("closed")
  ) {
    return true;
  }

  const startMatch = normalizedTime.match(/starts\s+(\d{1,2}):(\d{2})/);
  if (!startMatch) {
    return false;
  }

  const startsAt = Number(startMatch[1]) * 60 + Number(startMatch[2]);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes > startsAt;
}

const themeTokens = {
  dark: {
    app: "#03030a",
    screen: "#07070f",
    surface: "#10101a",
    surface2: "#181826",
    surface3: "#22223a",
    text: "#f0f0f8",
    textSoft: "#d8d8e8",
    muted: "#8888a8",
    muted2: "#55557a",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "#22223a",
    cardWash: "rgba(255,255,255,0.045)",
    radarRing: "rgba(0,212,170,0.24)",
    radarAxis: "rgba(255,107,43,0.14)",
    radarLabel: "#8bead8",
    dotCore: "rgba(7,7,15,0.9)",
    ghost: "#0b0b14",
    bottom: "rgba(7,7,15,0.94)",
  },
  light: {
    app: "#e8f0f7",
    screen: "#f8fbff",
    surface: "#ffffff",
    surface2: "#eef4fb",
    surface3: "#dce7f2",
    text: "#151722",
    textSoft: "#283047",
    muted: "#667089",
    muted2: "#7f8aa3",
    border: "rgba(22,34,58,0.12)",
    borderStrong: "#dce7f2",
    cardWash: "rgba(21,28,45,0.045)",
    radarRing: "rgba(26,38,64,0.12)",
    radarAxis: "rgba(26,38,64,0.08)",
    radarLabel: "#909ab3",
    dotCore: "rgba(255,255,255,0.94)",
    ghost: "#eef3f8",
    bottom: "rgba(248,251,255,0.94)",
  },
};

export default function App() {
  const [liveQuests, setLiveQuests] = useState<Quest[]>(() => QUESTS);
  const [selectedId, setSelectedId] = useState("pizza-run");
  const [joined, setJoined] = useState<Set<string>>(() => new Set());
  const [freeActive, setFreeActive] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [nextQuestPostAt, setNextQuestPostAt] = useState(0);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftPlace, setDraftPlace] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [draftTag, setDraftTag] = useState("");
  const [draftDistance, setDraftDistance] = useState("250");
  const [draftLocation, setDraftLocation] = useState<LocationOption | null>(null);
  const [draftMaxPeople, setDraftMaxPeople] = useState("4");
  const [draftEmoji, setDraftEmoji] = useState(QUEST_EMOJI_OPTIONS[0]);
  const [homeTab, setHomeTab] = useState<HomeTab>("quests");
  const [userScreen, setUserScreen] = useState<UserScreen>("home");
  const [theme, setTheme] = useState<ThemeName>("dark");
  const spin = useRef(new Animated.Value(0)).current;
  const nextQuestPostAtRef = useRef(0);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 30000);

    return () => clearInterval(interval);
  }, []);

  const palette = themeTokens[theme];
  const statusTopPadding = Platform.OS === "android" ? 8 : 0;
  const radarPanelHeight = Math.floor(height * 0.4);
  const radarSize = Math.min(width - 44, radarPanelHeight - 16);
  const sortedQuests = useMemo(
    () => [...liveQuests].sort((a, b) => a.distance - b.distance),
    [liveQuests],
  );
  const homeQuests = useMemo(() => {
    if (homeTab === "community") {
      return sortedQuests.filter((quest) =>
        ["COMMUNITY", "FOCUS", "BUILD", "CREW"].includes(quest.tag),
      );
    }

    return sortedQuests;
  }, [homeTab, sortedQuests]);
  const radarQuests = useMemo(
    () =>
      liveQuests.filter((quest) => {
        const full = getQuestHeadcount(quest, joined.has(quest.id)) >= quest.max;
        return !full && !isQuestPassed(quest);
      }),
    [joined, liveQuests],
  );
  const selected = liveQuests.find((quest) => quest.id === selectedId) ?? liveQuests[0];
  const questPostRemainingMs = Math.max(0, nextQuestPostAt - nowMs);
  const questPostOnCooldown = questPostRemainingMs > 0;
  const questPostCooldownLabel = formatCooldown(questPostRemainingMs);
  const spinStyle = {
    transform: [
      {
        rotate: spin.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  function toggleJoin(questId: string) {
    setJoined((current) => {
      const quest = liveQuests.find((item) => item.id === questId);
      const next = new Set(current);

      if (next.has(questId)) {
        next.delete(questId);
      } else {
        if (quest && getQuestHeadcount(quest, false) >= quest.max) {
          return current;
        }
        next.add(questId);
      }
      return next;
    });
  }

  function resetDraft() {
    setDraftTitle("");
    setDraftPlace("");
    setDraftTime("");
    setDraftTag("");
    setDraftDistance("250");
    setDraftLocation(null);
    setDraftMaxPeople("4");
    setDraftEmoji(QUEST_EMOJI_OPTIONS[0]);
  }

  function selectLocation(location: LocationOption) {
    const distance = getDistanceMeters(VIEWER_LOCATION, location);

    setDraftLocation(location);
    setDraftPlace(location.name);
    setDraftDistance(String(distance));
    setLocationPickerOpen(false);
  }

  function createQuest() {
    const createdAt = Date.now();
    const title = draftTitle.trim();
    const place = draftPlace.trim();

    if (nextQuestPostAtRef.current > createdAt || !title || !place) {
      return;
    }

    const nextIndex = liveQuests.length;
    const parsedDistance = Number.parseInt(draftDistance.replace(/\D/g, ""), 10);
    const distance = Number.isFinite(parsedDistance)
      ? Math.max(80, Math.min(parsedDistance, 2000))
      : 250;
    const parsedMax = Number.parseInt(draftMaxPeople.replace(/\D/g, ""), 10);
    const maxPeople = Number.isFinite(parsedMax) ? Math.max(1, Math.min(parsedMax, 50)) : 4;
    const radius = Math.max(52, Math.min(138, 48 + distance / 14));
    const newQuest: Quest = {
      id: `user-quest-${createdAt}`,
      emoji: draftEmoji,
      title,
      distance,
      angle: (nextIndex * 47 + 32) % 360,
      radius,
      color: [COLORS.orange, COLORS.teal, COLORS.purple, COLORS.gold, COLORS.red][
        nextIndex % 5
      ],
      tag: draftTag.trim().toUpperCase() || "NEW",
      time: draftTime.trim() || "Open now",
      members: 1,
      max: maxPeople,
      place,
      energy: 3,
    };

    setLiveQuests((current) => [newQuest, ...current]);
    setSelectedId(newQuest.id);
    nextQuestPostAtRef.current = createdAt + QUEST_POST_COOLDOWN_MS;
    setNextQuestPostAt(createdAt + QUEST_POST_COOLDOWN_MS);
    setNowMs(createdAt);
    setComposerOpen(false);
    resetDraft();
  }

  function openQuestDetail(questId: string) {
    setSelectedId(questId);
    setUserScreen("detail");
  }

  function openPostComposer() {
    if (!questPostOnCooldown) {
      setComposerOpen(true);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.screen }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={{ flex: 1, paddingTop: statusTopPadding, backgroundColor: palette.screen }}>
        {userScreen === "radar" && (
          <RadarScreen
            quests={radarQuests}
            sortedQuests={sortedQuests}
            selected={selected}
            joined={joined}
            palette={palette}
            theme={theme}
            freeActive={freeActive}
            questCount={liveQuests.length}
            radarPanelHeight={radarPanelHeight}
            radarSize={radarSize}
            spinStyle={spinStyle}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            onSelectQuest={setSelectedId}
            onOpenDetail={openQuestDetail}
            onJoin={toggleJoin}
          />
        )}

        {userScreen === "home" && (
          <HomeScreen
            quests={homeQuests}
            selectedId={selected.id}
            joined={joined}
            freeActive={freeActive}
            questCount={liveQuests.length}
            homeTab={homeTab}
            theme={theme}
            palette={palette}
            onSetHomeTab={setHomeTab}
            onOpenDetail={openQuestDetail}
            onJoin={toggleJoin}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />
        )}

        {userScreen === "detail" && (
          <QuestDetailScreen
            quest={selected}
            joined={joined.has(selected.id)}
            palette={palette}
            onBack={() => setUserScreen("home")}
            onJoin={() => toggleJoin(selected.id)}
          />
        )}

        {userScreen === "chat" && <ChatScreen quest={selected} palette={palette} />}
        {userScreen === "post" && (
          <PostScreen
            palette={palette}
            cooldownLabel={questPostCooldownLabel}
            onCooldown={questPostOnCooldown}
            onOpenComposer={openPostComposer}
          />
        )}
        {userScreen === "free" && (
          <FreeScreen
            palette={palette}
            active={freeActive}
            onToggle={() => setFreeActive((active) => !active)}
          />
        )}
        {userScreen === "profile" && <ProfileScreen palette={palette} />}

        <BottomMenu
          activeScreen={userScreen}
          palette={palette}
          onSelect={setUserScreen}
        />

        <PostQuestModal
          visible={composerOpen}
          palette={palette}
          title={draftTitle}
          place={draftPlace}
          time={draftTime}
          tag={draftTag}
          distance={draftLocation ? draftDistance : ""}
          maxPeople={draftMaxPeople}
          emoji={draftEmoji}
          onChangeTitle={setDraftTitle}
          onChangeTime={setDraftTime}
          onChangeTag={setDraftTag}
          onChangeMaxPeople={setDraftMaxPeople}
          onChangeEmoji={setDraftEmoji}
          onOpenLocation={() => setLocationPickerOpen(true)}
          onClose={() => setComposerOpen(false)}
          onSubmit={createQuest}
        />
        <LocationPickerModal
          visible={locationPickerOpen}
          palette={palette}
          selectedLocation={draftLocation}
          onSelect={selectLocation}
          onClose={() => setLocationPickerOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

function BottomMenu({
  activeScreen,
  palette,
  onSelect,
}: {
  activeScreen: UserScreen;
  palette: (typeof themeTokens)[ThemeName];
  onSelect: (screen: UserScreen) => void;
}) {
  const items: Array<{ screen: UserScreen; icon: string; label: string; color: string }> = [
    { screen: "radar", icon: "⌖", label: "Radar", color: COLORS.orange },
    { screen: "home", icon: "🔥", label: "Home", color: COLORS.orange },
    { screen: "detail", icon: "◇", label: "Details", color: COLORS.teal },
    { screen: "chat", icon: "💬", label: "Chat", color: COLORS.teal },
    { screen: "post", icon: "+", label: "Post", color: COLORS.orange },
    { screen: "free", icon: "⚡", label: "Free", color: COLORS.purple },
    { screen: "profile", icon: "AT", label: "Profile", color: COLORS.gold },
  ];

  return (
    <View
      style={{
        position: "absolute",
        left: 8,
        right: 8,
        bottom: 8,
        minHeight: 64,
        borderRadius: 18,
        backgroundColor: palette.bottom,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: "hidden",
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 4, paddingHorizontal: 7, paddingVertical: 7 }}
      >
        {items.map((item) => {
          const active = item.screen === activeScreen;

          return (
            <Pressable
              key={item.screen}
              accessibilityRole="button"
              onPress={() => onSelect(item.screen)}
              style={({ pressed }) => ({
                width: 64,
                minHeight: 50,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? `${item.color}22` : "transparent",
                borderWidth: 1,
                borderColor: active ? `${item.color}66` : "transparent",
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <Text style={{ color: active ? item.color : palette.textSoft, fontSize: item.icon === "AT" ? 13 : 18, fontWeight: "900" }}>
                {item.icon}
              </Text>
              <Text style={{ color: active ? item.color : palette.muted, fontSize: 10, fontWeight: "900", marginTop: 2 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function HomeScreen({
  quests,
  selectedId,
  joined,
  freeActive,
  questCount,
  homeTab,
  theme,
  palette,
  onSetHomeTab,
  onOpenDetail,
  onJoin,
  onToggleTheme,
}: {
  quests: Quest[];
  selectedId: string;
  joined: Set<string>;
  freeActive: boolean;
  questCount: number;
  homeTab: HomeTab;
  theme: ThemeName;
  palette: (typeof themeTokens)[ThemeName];
  onSetHomeTab: (tab: HomeTab) => void;
  onOpenDetail: (questId: string) => void;
  onJoin: (questId: string) => void;
  onToggleTheme: () => void;
}) {
  return (
    <>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }}>
            JUJA LIVE
          </Text>
          <Text style={{ color: COLORS.orange, fontSize: 39, fontWeight: "900", letterSpacing: -2 }}>
            SideQuest
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <CircleButton
            label={theme === "dark" ? "☀" : "☾"}
            color={COLORS.gold}
            palette={palette}
            onPress={onToggleTheme}
          />
          <CircleButton label="♢" color={palette.text} palette={palette} />
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.purple,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>AT</Text>
          </View>
        </View>
      </View>

      <FlashTicker palette={palette} />
      <PulseBar freeActive={freeActive} questCount={questCount} palette={palette} />

      <View style={{ flexDirection: "row", paddingHorizontal: 14, borderBottomWidth: 1, borderColor: palette.borderStrong }}>
        <HomeTabButton
          active={homeTab === "quests"}
          label="🔥 Quests"
          color={COLORS.orange}
          palette={palette}
          onPress={() => onSetHomeTab("quests")}
        />
        <HomeTabButton
          active={homeTab === "community"}
          label="🤝 Community"
          color={COLORS.teal}
          palette={palette}
          onPress={() => onSetHomeTab("community")}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator
        indicatorStyle={theme === "dark" ? "white" : "black"}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: 9, paddingHorizontal: 9, paddingTop: 8, paddingBottom: 88 }}
      >
        {quests.map((quest) => (
          <HomeQuestCard
            key={quest.id}
            quest={quest}
            selected={quest.id === selectedId}
            joined={joined.has(quest.id)}
            palette={palette}
            onPress={() => onOpenDetail(quest.id)}
            onJoin={() => onJoin(quest.id)}
          />
        ))}

        <GhostQuestCard palette={palette} />
      </ScrollView>
    </>
  );
}

function PulseBar({
  freeActive,
  questCount,
  palette,
}: {
  freeActive: boolean;
  questCount: number;
  palette: (typeof themeTokens)[ThemeName];
}) {
  return (
    <View
      style={{
        minHeight: 38,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderColor: palette.borderStrong,
        backgroundColor: palette.surface,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange, opacity: 0.9 }} />
      <Text style={{ color: COLORS.orange, fontSize: 15, fontWeight: "900" }}>
        {freeActive ? 24 : 23} people
      </Text>
      <Text style={{ color: palette.muted, fontSize: 15, fontWeight: "800" }}>active</Text>
      <Text style={{ color: palette.muted, fontSize: 18, fontWeight: "900" }}>·</Text>
      <Text style={{ color: COLORS.teal, fontSize: 15, fontWeight: "900" }}>{questCount} quests</Text>
      <Text style={{ marginLeft: "auto", color: palette.muted, fontSize: 15, fontWeight: "900" }}>⌖ Juja</Text>
    </View>
  );
}

function RadarScreen({
  quests,
  sortedQuests,
  selected,
  joined,
  palette,
  theme,
  freeActive,
  questCount,
  radarPanelHeight,
  radarSize,
  spinStyle,
  onToggleTheme,
  onSelectQuest,
  onOpenDetail,
  onJoin,
}: {
  quests: Quest[];
  sortedQuests: Quest[];
  selected: Quest;
  joined: Set<string>;
  palette: (typeof themeTokens)[ThemeName];
  theme: ThemeName;
  freeActive: boolean;
  questCount: number;
  radarPanelHeight: number;
  radarSize: number;
  spinStyle: object;
  onToggleTheme: () => void;
  onSelectQuest: (questId: string) => void;
  onOpenDetail: (questId: string) => void;
  onJoin: (questId: string) => void;
}) {
  return (
    <View style={{ flex: 1, paddingBottom: 74 }}>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 }}>
            JUJA LIVE
          </Text>
          <Text style={{ color: COLORS.orange, fontSize: 39, fontWeight: "900", letterSpacing: -2 }}>
            SideQuest
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <CircleButton
            label={theme === "dark" ? "☀" : "☾"}
            color={COLORS.gold}
            palette={palette}
            onPress={onToggleTheme}
          />
          <CircleButton label="♢" color={palette.text} palette={palette} />
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.purple,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>AT</Text>
          </View>
        </View>
      </View>

      <PulseBar freeActive={freeActive} questCount={questCount} palette={palette} />

      <View
        style={{
          height: radarPanelHeight,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 8,
        }}
      >
        <Radar
          quests={quests}
          selectedId={selected.id}
          onSelect={onSelectQuest}
          palette={palette}
          size={radarSize}
          spinStyle={spinStyle}
        />
      </View>

      <SelectedQuest
        quest={selected}
        joined={joined.has(selected.id)}
        palette={palette}
        onJoin={() => onJoin(selected.id)}
      />

      <View style={{ flex: 1, minHeight: 96, paddingHorizontal: 14, paddingTop: 10 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator
        indicatorStyle={theme === "dark" ? "white" : "black"}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
      >
        {sortedQuests.map((quest) => (
          <QuestRow
            key={quest.id}
            quest={quest}
            selected={quest.id === selected.id}
            joined={joined.has(quest.id)}
            palette={palette}
            onPress={() => {
              onSelectQuest(quest.id);
              onOpenDetail(quest.id);
            }}
            onJoin={() => onJoin(quest.id)}
          />
        ))}
        <GhostQuestCard palette={palette} />
      </ScrollView>
      </View>
    </View>
  );
}

function RadarQuestRow({
  quest,
  selected,
  joined,
  palette,
  onPress,
  onJoin,
}: {
  quest: Quest;
  selected: boolean;
  joined: boolean;
  palette: (typeof themeTokens)[ThemeName];
  onPress: () => void;
  onJoin: () => void;
}) {
  const headcount = getQuestHeadcount(quest, joined);
  const full = headcount >= quest.max && !joined;
  const tag = quest.tag === "FLASH" ? `FLASH ${quest.time}` : `${headcount}/${quest.max}`;

  return (
    <View
      style={{
        minHeight: 54,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: selected ? `${quest.color}55` : `${quest.color}26`,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Text style={{ fontSize: 19 }}>{quest.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: palette.text, fontSize: 13, fontWeight: "900" }}>
            {quest.title}
          </Text>
          <Text style={{ color: quest.color, fontSize: 10, fontWeight: "900" }}>{tag}</Text>
        </View>
      </Pressable>
      <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800", marginRight: 4 }}>
        {quest.distance}m
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={full}
        onPress={onJoin}
        style={({ pressed }) => ({
          minHeight: 30,
          borderRadius: 8,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: joined ? COLORS.teal : full ? palette.surface3 : quest.color,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text style={{ color: "white", fontSize: 11, fontWeight: "900" }}>
          {joined ? "In" : full ? "Full" : "Join"}
        </Text>
      </Pressable>
    </View>
  );
}

function QuestDetailScreen({
  quest,
  joined,
  palette,
  onBack,
  onJoin,
}: {
  quest: Quest;
  joined: boolean;
  palette: (typeof themeTokens)[ThemeName];
  onBack: () => void;
  onJoin: () => void;
}) {
  const headcount = getQuestHeadcount(quest, joined);
  const full = headcount >= quest.max && !joined;
  const passed = isQuestPassed(quest);
  const chatOpen = headcount >= 3 || joined;
  const neededForChat = Math.max(0, 3 - headcount);
  const startsLabel = quest.time.replace("Starts ", "");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.screen }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 96 }}
    >
      <View
        style={{
          position: "relative",
          paddingHorizontal: 14,
          paddingTop: 18,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderColor: palette.borderStrong,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: quest.color,
            opacity: 0.72,
          }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            minHeight: 32,
            justifyContent: "center",
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text style={{ color: palette.muted, fontSize: 13, fontWeight: "900" }}>← Back</Text>
        </Pressable>

        <Text style={{ fontSize: 44, marginTop: 6, marginBottom: 8 }}>{quest.emoji}</Text>
        <Text style={{ color: palette.text, fontSize: 30, fontWeight: "900", letterSpacing: -1 }}>
          {quest.title}
        </Text>
        <Text style={{ color: palette.muted, fontSize: 13, fontWeight: "800", marginTop: 4 }}>
          📍 {quest.place} area
        </Text>
        <Text style={{ color: palette.muted2, fontSize: 11, fontStyle: "italic", fontWeight: "700", marginTop: 3 }}>
          {joined ? "Exact location unlocked for joined members" : "Exact location unlocks when you join"}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 13, paddingTop: 12 }}>
        <View style={{ flexDirection: "row", gap: 7, marginBottom: 10 }}>
          <DetailStat label="Squad" value={`${headcount}/${quest.max}`} color={quest.color} palette={palette} />
          <DetailStat label="Expires" value={passed ? "Past" : "18h"} color={passed ? palette.muted : palette.text} palette={palette} />
          <DetailStat label="Starts" value={startsLabel} color={COLORS.teal} palette={palette} />
        </View>

        <View
          style={{
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: palette.muted, fontSize: 13, lineHeight: 21, fontWeight: "700" }}>
            {getQuestDescription(quest)}
          </Text>
        </View>

        <Text
          style={{
            color: palette.muted,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: "900",
            marginBottom: 6,
          }}
        >
          Hype — last 2h
        </Text>
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 10 }}>
          <HypeTile emoji="🔥" current={Math.max(quest.energy, 1)} total={7} color={COLORS.orange} fill={80} palette={palette} />
          <HypeTile emoji="👀" current={Math.min(quest.members + 2, 11)} total={11} color={COLORS.teal} fill={100} palette={palette} />
          <HypeTile emoji="🙌" current={joined ? 2 : 1} total={5} color={COLORS.purple} fill={joined ? 45 : 30} palette={palette} />
        </View>

        <View style={{ marginBottom: 10 }}>
          <Energy level={quest.energy} color={quest.color} palette={palette} />
        </View>

        <View
          style={{
            borderRadius: 13,
            padding: 12,
            alignItems: "center",
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 22, marginBottom: 4 }}>{chatOpen ? "💬" : "🔒"}</Text>
          <Text style={{ color: palette.text, fontSize: 14, fontWeight: "900", marginBottom: 5 }}>
            {chatOpen ? "Chat preview unlocked" : "Chat unlocks at 3 members"}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginBottom: 4 }}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: index < Math.min(headcount, 3) ? quest.color : palette.surface3,
                  borderWidth: 1.5,
                  borderColor: index < Math.min(headcount, 3) ? quest.color : palette.border,
                }}
              />
            ))}
          </View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800" }}>
            {chatOpen ? "Specifics will be discussed in the chatroom" : `${neededForChat} more needed`}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={full || passed}
          onPress={onJoin}
          style={({ pressed }) => ({
            minHeight: 54,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: joined ? COLORS.teal : full || passed ? palette.surface3 : COLORS.orange,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>
            {joined ? "Joined" : passed ? "Quest passed" : full ? "Quest full" : "⚡ Join Quest"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DetailStat({
  label,
  value,
  color,
  palette,
}: {
  label: string;
  value: string;
  color: string;
  palette: (typeof themeTokens)[ThemeName];
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 11,
        paddingHorizontal: 8,
        paddingVertical: 9,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Text style={{ color: palette.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Text>
      <Text numberOfLines={1} style={{ color, fontSize: 16, fontWeight: "900", marginTop: 3 }}>
        {value}
      </Text>
    </View>
  );
}

function HypeTile({
  emoji,
  current,
  total,
  color,
  fill,
  palette,
}: {
  emoji: string;
  current: number;
  total: number;
  color: string;
  fill: number;
  palette: (typeof themeTokens)[ThemeName];
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 70,
        borderRadius: 10,
        paddingVertical: 7,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: palette.surface2,
        borderWidth: 1,
        borderColor: `${color}33`,
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${fill}%`,
          height: 3,
          backgroundColor: color,
        }}
      />
      <Text style={{ fontSize: 18, marginBottom: 3 }}>{emoji}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 1 }}>
        <Text style={{ color, fontSize: 14, fontWeight: "900" }}>{current}</Text>
        <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "800" }}>/{total}</Text>
      </View>
    </View>
  );
}

function getQuestDescription(quest: Quest) {
  const lowerTitle = quest.title.toLowerCase();

  if (lowerTitle.includes("bike")) {
    return "Casual evening ride through Juja Farm. Any bike works.";
  }
  if (quest.tag === "COMMUNITY") {
    return "Community quest with open slots for anyone nearby. Join first, then coordinate specifics in chat.";
  }
  if (lowerTitle.includes("study") || quest.tag === "FOCUS") {
    return "Short focused session with nearby people. Bring what you are working on and sync in the chatroom.";
  }
  if (lowerTitle.includes("food") || lowerTitle.includes("pizza") || lowerTitle.includes("taco")) {
    return "Quick food run with people nearby. Exact meetup point unlocks after joining.";
  }

  return `${quest.title} around ${quest.place}. Join to unlock the exact location and chat with the squad.`;
}

function ChatScreen({
  quest,
  palette,
}: {
  quest: Quest;
  palette: (typeof themeTokens)[ThemeName];
}) {
  const messages = [
    { user: "Alex M.", text: "Main stage at 5pm?" },
    { user: "Joy K.", text: "Works. Which route?" },
    { user: "Alex M.", text: "Farm loop then bypass 🚴" },
    { user: "You", text: "On my way. 10 mins 🔥" },
  ];

  return (
    <View style={{ flex: 1, paddingBottom: 74, backgroundColor: palette.screen }}>
      <View style={{ paddingHorizontal: 13, paddingTop: 18, paddingBottom: 10, borderBottomWidth: 1, borderColor: palette.borderStrong }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Text style={{ fontSize: 24 }}>{quest.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: palette.text, fontSize: 15, fontWeight: "900" }}>{quest.title} · dissolves in 1h 44m</Text>
            <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800", marginTop: 2 }}>📍 {quest.place} · {quest.members}/{quest.max}</Text>
          </View>
          <Text style={{ color: COLORS.orange, fontSize: 10, fontWeight: "900", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: "rgba(255,107,43,0.1)" }}>Live</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingHorizontal: 9, paddingVertical: 7 }}>
        {[
          { name: "Alex M.", status: "Already there 📍", color: COLORS.orange },
          { name: "Joy K.", status: "On my way 🚀", color: COLORS.teal },
          { name: "You", status: "On my way 🚀", color: COLORS.purple },
        ].map((member) => (
          <View key={member.name} style={{ flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: palette.surface2 }}>
            <Avatar label={member.name} size={22} color={member.color} />
            <View>
              <Text style={{ color: palette.textSoft, fontSize: 9, fontWeight: "900" }}>{member.name === "You" ? "You" : member.name.split(" ")[0]}</Text>
              <Text style={{ color: member.color, fontSize: 8, fontWeight: "800" }}>{member.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8, padding: 10 }}>
        {messages.map((message, index) => {
          const mine = message.user === "You";
          return (
            <View key={`${message.user}-${index}`} style={{ flexDirection: mine ? "row-reverse" : "row", alignItems: "flex-end", gap: 6 }}>
              {!mine && <Avatar label={message.user} size={24} color={COLORS.teal} />}
              <View style={{ maxWidth: "76%" }}>
                {!mine && <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "800", marginBottom: 2 }}>{message.user}</Text>}
                <View style={{ borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: mine ? COLORS.orange : palette.surface2 }}>
                  <Text style={{ color: mine ? "white" : palette.text, fontSize: 13, lineHeight: 19, fontWeight: "700" }}>{message.text}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ marginHorizontal: 9, marginBottom: 6, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(167,139,250,0.1)", borderWidth: 1, borderColor: "rgba(167,139,250,0.26)" }}>
        <Text style={{ fontSize: 16 }}>🤝</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.purple, fontSize: 11, fontWeight: "900" }}>Share contact before chat closes</Text>
          <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "800" }}>28 min · Chat dissolves when squad disbands</Text>
        </View>
        <Text style={{ color: COLORS.purple, fontSize: 11, fontWeight: "900" }}>Share</Text>
      </View>
    </View>
  );
}

function PostScreen({
  palette,
  cooldownLabel,
  onCooldown,
  onOpenComposer,
}: {
  palette: (typeof themeTokens)[ThemeName];
  cooldownLabel: string;
  onCooldown: boolean;
  onOpenComposer: () => void;
}) {
  const starters = ["☕ Coffee", "⚽ Football", "🎲 Games", "🚶 Walk", "🏃 Run", "🍕 Food", "🎮 Gaming", "🏊 Swim"];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 18, paddingBottom: 92 }}>
      <Text style={{ color: palette.text, fontSize: 25, fontWeight: "900" }}>Post a <Text style={{ color: COLORS.orange }}>Quest</Text></Text>
      <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginTop: 3, marginBottom: 14 }}>Visible to people near you in 30 seconds.</Text>
      <SectionLabel label="Quick start" palette={palette} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {starters.map((item, index) => {
          const [emoji, ...labelParts] = item.split(" ");
          const active = index === 1;
          return (
            <View key={item} style={{ width: "23.5%", minHeight: 62, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: active ? "rgba(255,107,43,0.14)" : palette.surface, borderWidth: 1.5, borderColor: active ? COLORS.orange : palette.border }}>
              <Text style={{ fontSize: 19 }}>{emoji}</Text>
              <Text style={{ color: active ? COLORS.orange : palette.muted, fontSize: 9, fontWeight: "900", marginTop: 2 }}>{labelParts.join(" ")}</Text>
            </View>
          );
        })}
      </View>
      <PreviewField label="Activity" value="Football" color={palette.text} palette={palette} active />
      <PreviewField label="Location" value="JKUAT Main Gate…" color={palette.muted} palette={palette} />
      <PreviewField label="Start time" value="▶ 18:00" color={COLORS.teal} palette={palette} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <StepperButton label="−" palette={palette} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: COLORS.orange, fontSize: 31, fontWeight: "900" }}>10</Text>
          <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "800" }}>people max</Text>
        </View>
        <StepperButton label="+" palette={palette} />
      </View>
      <Pressable accessibilityRole="button" disabled={onCooldown} onPress={onOpenComposer} style={({ pressed }) => ({ minHeight: 54, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: onCooldown ? palette.surface3 : COLORS.orange, opacity: onCooldown ? 0.68 : pressed ? 0.76 : 1 })}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "900" }}>{onCooldown ? `Available in ${cooldownLabel}` : "🚀 Post Quest"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function FreeScreen({ palette, active, onToggle }: { palette: (typeof themeTokens)[ThemeName]; active: boolean; onToggle: () => void }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 13, paddingTop: 18, paddingBottom: 92 }}>
      <View style={{ alignItems: "center", paddingHorizontal: 10, paddingVertical: 18, borderRadius: 16, backgroundColor: "rgba(167,139,250,0.09)", borderWidth: 1, borderColor: "rgba(167,139,250,0.22)", marginBottom: 11 }}>
        <Text style={{ fontSize: 40, marginBottom: 8 }}>⚡</Text>
        <Text style={{ color: palette.text, fontSize: 23, fontWeight: "900" }}>I'm Free Mode</Text>
        <Text style={{ color: palette.muted, textAlign: "center", fontSize: 12, lineHeight: 19, fontWeight: "800", marginTop: 5 }}>No plan. No activity. People within 1km see you're free.</Text>
      </View>
      <View style={{ borderRadius: 12, padding: 11, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, marginBottom: 10 }}>
        <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginBottom: 6 }}>Next broadcast in <Text style={{ color: COLORS.purple }}>4h 22m</Text></Text>
        <View style={{ height: 5, borderRadius: 3, backgroundColor: palette.surface3, overflow: "hidden" }}><View style={{ width: "27%", height: "100%", backgroundColor: COLORS.purple }} /></View>
      </View>
      <View style={{ borderRadius: 14, padding: 12, backgroundColor: "rgba(167,139,250,0.1)", borderWidth: 1.5, borderColor: "rgba(167,139,250,0.28)", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: "900" }}>{active ? "Broadcasting ⚡" : "Ready to broadcast"}</Text>
          <Text style={{ color: COLORS.purple, fontSize: 10, fontWeight: "900" }}>{active ? "LIVE" : "IDLE"}</Text>
        </View>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800", marginBottom: 8 }}>📍 1km · Expires 1h 54m · 2 replies</Text>
        {[
          { name: "Ciku N.", text: "☕ Coffee sounds good?" },
          { name: "Brian T.", text: "Football? Also free!" },
        ].map((reply) => (
          <View key={reply.name} style={{ flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: palette.surface2, marginBottom: 5 }}>
            <Avatar label={reply.name} size={24} color={COLORS.purple} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontSize: 12, fontWeight: "900" }}>{reply.name}</Text>
              <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800" }}>{reply.text}</Text>
            </View>
            <Text style={{ color: COLORS.purple, fontSize: 10, fontWeight: "900" }}>Reply</Text>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={onToggle} style={({ pressed }) => ({ minHeight: 52, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: active ? palette.surface3 : COLORS.purple, opacity: pressed ? 0.76 : 1 })}>
        <Text style={{ color: "white", fontSize: 15, fontWeight: "900" }}>{active ? "⏱ Available in 4h 22m" : "⚡ Broadcast I'm Free"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreen({ palette }: { palette: (typeof themeTokens)[ThemeName] }) {
  const cards = [
    { emoji: "🚴", title: "Bike Ride", vibe: "🔥", gold: true, shared: true },
    { emoji: "🎲", title: "Games", vibe: "🔥", gold: false, shared: true },
    { emoji: "⚽", title: "Football", vibe: "😐", gold: false, shared: false },
    { emoji: "🩸", title: "Blood Drive", vibe: "🙌", gold: false, shared: false },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 92 }}>
      <View style={{ alignItems: "center", paddingHorizontal: 13, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: palette.borderStrong }}>
        <View style={{ position: "relative", marginBottom: 8 }}>
          <Avatar label="AT" size={54} color={COLORS.purple} />
          <View style={{ position: "absolute", right: -2, bottom: -2, width: 19, height: 19, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.gold, borderWidth: 2, borderColor: palette.screen }}><Text style={{ color: "#08080f", fontSize: 9, fontWeight: "900" }}>7</Text></View>
        </View>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: "900" }}>Atacama</Text>
        <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800", marginTop: 2, marginBottom: 8 }}>Juja · Urban Explorer</Text>
        <View style={{ flexDirection: "row", gap: 6 }}><Badge label="🔥 7-day streak" color={COLORS.gold} palette={palette} /><Badge label="⚡ Fast Joiner" color={COLORS.purple} palette={palette} /></View>
      </View>
      <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          <ProfileStat value="14" label="Quests" color={COLORS.orange} palette={palette} />
          <ProfileStat value="🔥 4" label="Vibe" color={COLORS.gold} palette={palette} />
          <ProfileStat value="88" label="Energy" color={COLORS.teal} palette={palette} />
        </View>
        <SectionLabel label="Badges" palette={palette} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {["🚀 First", "🔥 7-Day", "🃏 Wild", "⚡ Fast", "💥 Starter", "🤝 Civic", "🌟 Vibe", "🔮 ?"].map((badge, index) => (
            <View key={badge} style={{ width: 50, minHeight: 48, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface, borderWidth: 1, borderColor: "rgba(251,191,36,0.16)", opacity: index >= 6 ? 0.35 : 1 }}>
              <Text style={{ fontSize: 16 }}>{badge.split(" ")[0]}</Text>
              <Text style={{ color: palette.muted, fontSize: 8, fontWeight: "800" }}>{badge.split(" ").slice(1).join(" ")}</Text>
            </View>
          ))}
        </View>
        <SectionLabel label="Story Cards" palette={palette} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {cards.map((card) => (
            <View key={card.title} style={{ width: "48.8%", minHeight: 90, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: card.gold ? "rgba(251,191,36,0.08)" : palette.surface, borderWidth: 1, borderColor: card.gold ? "rgba(251,191,36,0.24)" : palette.border, overflow: "hidden" }}>
              {!card.shared && <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7,7,15,0.86)", paddingHorizontal: 10 }}><Text style={{ fontSize: 13 }}>🔒</Text><Text style={{ color: "#aaaac4", fontSize: 9, textAlign: "center", fontWeight: "800" }}>Join a quest together first</Text></View>}
              <Text style={{ fontSize: 23 }}>{card.emoji}</Text>
              <Text style={{ color: palette.text, fontSize: 12, fontWeight: "900", marginTop: 3 }}>{card.title}</Text>
              <Text style={{ fontSize: 14, marginTop: 2 }}>{card.vibe}</Text>
              {card.gold && <Text style={{ color: COLORS.gold, fontSize: 9, fontWeight: "800" }}>Share 📸</Text>}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function PreviewField({ label, value, color, palette, active }: { label: string; value: string; color: string; palette: (typeof themeTokens)[ThemeName]; active?: boolean }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 5 }}>{label}</Text>
      <View style={{ borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: active ? "rgba(255,107,43,0.1)" : palette.surface, borderWidth: 1.5, borderColor: active ? COLORS.orange : palette.border }}><Text style={{ color, fontSize: 13, fontWeight: "900" }}>{value}</Text></View>
    </View>
  );
}

function StepperButton({ label, palette }: { label: string; palette: (typeof themeTokens)[ThemeName] }) {
  return <View style={{ width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.border }}><Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>{label}</Text></View>;
}

function Avatar({ label, size, color }: { label: string; size: number; color: string }) {
  const initials = label.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: color }}><Text style={{ color: "white", fontSize: Math.max(8, size * 0.34), fontWeight: "900" }}>{initials}</Text></View>;
}

function Badge({ label, color }: { label: string; color: string; palette: (typeof themeTokens)[ThemeName] }) {
  return <View style={{ borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: `${color}18`, borderWidth: 1, borderColor: `${color}44` }}><Text style={{ color, fontSize: 10, fontWeight: "900" }}>{label}</Text></View>;
}

function ProfileStat({ value, label, color, palette }: { value: string; label: string; color: string; palette: (typeof themeTokens)[ThemeName] }) {
  return <View style={{ flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: "center", backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}><Text style={{ color, fontSize: 15, fontWeight: "900" }}>{value}</Text><Text style={{ color: palette.muted, fontSize: 9, fontWeight: "800", marginTop: 2 }}>{label}</Text></View>;
}

function SectionLabel({ label, palette }: { label: string; palette: (typeof themeTokens)[ThemeName] }) {
  return <Text style={{ color: palette.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: "900", marginBottom: 6 }}>{label}</Text>;
}

function FlashTicker({ palette }: { palette: (typeof themeTokens)[ThemeName] }) {
  return (
    <View
      style={{
        minHeight: 30,
        overflow: "hidden",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,59,48,0.18)",
        backgroundColor: "rgba(255,59,48,0.08)",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text style={{ width: 34, textAlign: "center", color: COLORS.red, fontSize: 15, fontWeight: "900" }}>
        ⚡
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", gap: 28, paddingRight: 24 }}
      >
        {["Pizza Run · 195m · 18 min", "Taco Pop-up · 330m · Open 20 min", "Coffee · 210m · Starts 17:20"].map(
          (item) => (
            <Text key={item} style={{ color: COLORS.red, fontSize: 12, fontWeight: "900" }}>
              {item}
            </Text>
          ),
        )}
      </ScrollView>
      <View style={{ width: 10, backgroundColor: palette.screen }} />
    </View>
  );
}

function HomeTabButton({
  active,
  label,
  color,
  palette,
  onPress,
}: {
  active: boolean;
  label: string;
  color: string;
  palette: (typeof themeTokens)[ThemeName];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderColor: active ? color : "transparent",
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text style={{ color: active ? color : palette.muted, fontSize: 13, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function HomeQuestCard({
  quest,
  selected,
  joined,
  palette,
  onPress,
  onJoin,
}: {
  quest: Quest;
  selected: boolean;
  joined: boolean;
  palette: (typeof themeTokens)[ThemeName];
  onPress: () => void;
  onJoin: () => void;
}) {
  const headcount = getQuestHeadcount(quest, joined);
  const full = headcount >= quest.max && !joined;
  const passed = isQuestPassed(quest);
  const dimmed = full || passed;
  const accent = full ? palette.muted : quest.color;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 142,
        borderRadius: 16,
        padding: 12,
        overflow: "hidden",
        backgroundColor: dimmed ? palette.ghost : palette.surface,
        borderWidth: 1,
        borderColor: selected ? quest.color : dimmed ? "rgba(255,255,255,0.05)" : palette.border,
        opacity: pressed ? 0.82 : dimmed ? 0.78 : 1,
      })}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 3,
          backgroundColor: accent,
          opacity: dimmed ? 0.42 : 1,
        }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 29 }}>{quest.emoji}</Text>
        {full || passed ? (
          <View
            style={{
              borderRadius: 8,
              paddingHorizontal: 9,
              paddingVertical: 4,
              backgroundColor: palette.surface2,
              borderWidth: 1,
              borderColor: palette.border,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }}>
              {passed ? "PASSED" : "FULL"}
            </Text>
          </View>
        ) : (
          <View
            style={{
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: "rgba(0,212,170,0.1)",
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: COLORS.teal, fontSize: 10, fontWeight: "900" }}>▶ {quest.time}</Text>
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={{ color: dimmed ? palette.muted : palette.text, fontSize: 18, fontWeight: "900" }}
      >
        {quest.title}
      </Text>
      <Text
        numberOfLines={1}
        style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginTop: 2, marginBottom: 9 }}
      >
        📍 {quest.place} · {quest.distance}m
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: dimmed ? 0 : 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {Array.from({ length: Math.min(quest.max, 5) }).map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index < Math.min(headcount, 5) ? COLORS.orange : palette.surface3,
                borderWidth: 1,
                borderColor: index < Math.min(headcount, 5) ? COLORS.orange : palette.border,
              }}
            />
          ))}
          <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "900", marginLeft: 4 }}>
            {headcount}/{quest.max}
          </Text>
        </View>

        {full || passed ? (
          <View
            style={{
              minHeight: 31,
              borderRadius: 9,
              paddingHorizontal: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.surface2,
            }}
          >
            <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "900" }}>
              Create similar
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onJoin}
            style={({ pressed }) => ({
              minHeight: 31,
              borderRadius: 9,
              paddingHorizontal: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: joined ? COLORS.teal : COLORS.orange,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "900" }}>{joined ? "Joined" : "Join"}</Text>
          </Pressable>
        )}
      </View>

      {!dimmed && <Energy level={quest.energy} color={quest.color} palette={palette} />}
    </Pressable>
  );
}

function GhostQuestCard({ palette }: { palette: (typeof themeTokens)[ThemeName] }) {
  return (
    <View
      style={{
        minHeight: 64,
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 9,
        opacity: 0.62,
        backgroundColor: palette.ghost,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 20, opacity: 0.42 }}>🚴</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.muted, fontSize: 13, fontWeight: "900" }}>
            Bike Ride ended 25 min ago
          </Text>
          <Text style={{ color: palette.muted2, fontSize: 11, fontWeight: "800", marginTop: 2 }}>
            5 people · 🔥 · Morning Run 7am →
          </Text>
        </View>
        <View
          style={{
            minWidth: 28,
            minHeight: 25,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.surface2,
          }}
        >
          <Text style={{ color: palette.muted, fontSize: 13 }}>👻</Text>
        </View>
      </View>
    </View>
  );
}

function PostQuestModal({
  visible,
  palette,
  title,
  place,
  time,
  tag,
  distance,
  maxPeople,
  emoji,
  onChangeTitle,
  onChangeTime,
  onChangeTag,
  onChangeMaxPeople,
  onChangeEmoji,
  onOpenLocation,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  palette: (typeof themeTokens)[ThemeName];
  title: string;
  place: string;
  time: string;
  tag: string;
  distance: string;
  maxPeople: string;
  emoji: string;
  onChangeTitle: (value: string) => void;
  onChangeTime: (value: string) => void;
  onChangeTag: (value: string) => void;
  onChangeMaxPeople: (value: string) => void;
  onChangeEmoji: (value: string) => void;
  onOpenLocation: () => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = title.trim().length > 0 && place.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close post quest"
          onPress={onClose}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.52)",
          }}
        />

        <View
          style={{
            maxHeight: "88%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: palette.surface3,
              marginBottom: 8,
            }}
          />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 18 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.orange, fontSize: 12, fontWeight: "900" }}>
                  POST QUEST
                </Text>
                <Text style={{ color: palette.text, fontSize: 26, fontWeight: "900" }}>
                  Create a quest
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.surface2,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: palette.text, fontSize: 22, fontWeight: "900" }}>×</Text>
              </Pressable>
            </View>

            <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "900", marginBottom: 8 }}>
              Icon
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {QUEST_EMOJI_OPTIONS.map((option) => {
                const selected = option === emoji;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => onChangeEmoji(option)}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? COLORS.orange : palette.surface2,
                      borderWidth: 1,
                      borderColor: selected ? COLORS.orange : palette.border,
                      opacity: pressed ? 0.72 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 24 }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            <FormField
              label="Quest name"
              value={title}
              onChangeText={onChangeTitle}
              placeholder="Evening snacks"
              palette={palette}
            />
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "900", marginBottom: 7 }}>
                Location
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onOpenLocation}
                style={({ pressed }) => ({
                  minHeight: 58,
                  borderRadius: 15,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  justifyContent: "center",
                  backgroundColor: palette.surface2,
                  borderWidth: 1,
                  borderColor: place ? COLORS.teal : palette.border,
                  opacity: pressed ? 0.76 : 1,
                })}
              >
                <Text style={{ color: place ? palette.text : palette.muted2, fontSize: 16, fontWeight: "900" }}>
                  {place || "Choose on map"}
                </Text>
                <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginTop: 3 }}>
                  {distance ? `${distance}m from you` : "Distance will be calculated automatically"}
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Time"
                  value={time}
                  onChangeText={onChangeTime}
                  placeholder="Open now"
                  palette={palette}
                />
              </View>
              <View style={{ flex: 0.75 }}>
                <FormField
                  label="Max people"
                  value={maxPeople}
                  onChangeText={onChangeMaxPeople}
                  placeholder="4"
                  keyboardType="number-pad"
                  palette={palette}
                />
              </View>
            </View>
            <FormField
              label="Tag"
              value={tag}
              onChangeText={onChangeTag}
              placeholder="FOOD"
              autoCapitalize="characters"
              maxLength={12}
              palette={palette}
            />

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={onSubmit}
              style={({ pressed }) => ({
                minHeight: 52,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 6,
                backgroundColor: canSubmit ? COLORS.orange : palette.surface3,
                opacity: pressed ? 0.76 : 1,
              })}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>
                Create Quest
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function LocationPickerModal({
  visible,
  palette,
  selectedLocation,
  onSelect,
  onClose,
}: {
  visible: boolean;
  palette: (typeof themeTokens)[ThemeName];
  selectedLocation: LocationOption | null;
  onSelect: (location: LocationOption) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(selectedLocation?.name ?? "");
  const [previewLocation, setPreviewLocation] = useState<LocationOption>(
    selectedLocation ?? LOCATION_OPTIONS[0],
  );

  useEffect(() => {
    if (visible) {
      setQuery(selectedLocation?.name ?? "");
      setPreviewLocation(selectedLocation ?? LOCATION_OPTIONS[0]);
    }
  }, [selectedLocation, visible]);

  const filteredLocations = LOCATION_OPTIONS.filter((location) => {
    const search = `${location.name} ${location.detail}`.toLowerCase();
    return search.includes(query.trim().toLowerCase());
  });
  const visibleLocations = filteredLocations.length > 0 ? filteredLocations : LOCATION_OPTIONS;
  const distance = getDistanceMeters(VIEWER_LOCATION, previewLocation);
  const mapQuery = encodeURIComponent(`${previewLocation.name}, ${previewLocation.detail}`);
  const mapHtml = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body, iframe { margin: 0; width: 100%; height: 100%; border: 0; background: #07070f; }
        </style>
      </head>
      <body>
        <iframe src="https://www.google.com/maps?q=${mapQuery}&output=embed"></iframe>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.52)" }}>
        <View
          style={{
            maxHeight: "90%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: palette.surface3,
              marginBottom: 8,
            }}
          />

          <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.teal, fontSize: 12, fontWeight: "900" }}>
                  LOCATION
                </Text>
                <Text style={{ color: palette.text, fontSize: 25, fontWeight: "900" }}>
                  Pick a place
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.surface2,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: palette.text, fontSize: 22, fontWeight: "900" }}>×</Text>
              </Pressable>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search Google Maps"
              placeholderTextColor={palette.muted2}
              style={{
                minHeight: 48,
                borderRadius: 15,
                paddingHorizontal: 13,
                color: palette.text,
                backgroundColor: palette.surface2,
                borderWidth: 1,
                borderColor: palette.border,
                fontSize: 16,
                fontWeight: "800",
              }}
            />
          </View>

          <View style={{ height: 230, backgroundColor: palette.surface2 }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              style={{ backgroundColor: palette.surface2 }}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}
          >
            {visibleLocations.map((location) => {
              const selected = location.name === previewLocation.name;
              const optionDistance = getDistanceMeters(VIEWER_LOCATION, location);

              return (
                <Pressable
                  key={location.name}
                  accessibilityRole="button"
                  onPress={() => {
                    setPreviewLocation(location);
                    setQuery(location.name);
                  }}
                  style={({ pressed }) => ({
                    width: 178,
                    borderRadius: 16,
                    padding: 11,
                    backgroundColor: selected ? "rgba(0,212,170,0.16)" : palette.surface2,
                    borderWidth: 1,
                    borderColor: selected ? COLORS.teal : palette.border,
                    opacity: pressed ? 0.76 : 1,
                  })}
                >
                  <Text numberOfLines={1} style={{ color: palette.text, fontSize: 15, fontWeight: "900" }}>
                    {location.name}
                  </Text>
                  <Text numberOfLines={1} style={{ color: palette.muted, fontSize: 12, fontWeight: "800" }}>
                    {location.detail}
                  </Text>
                  <Text style={{ color: COLORS.teal, fontSize: 12, fontWeight: "900", marginTop: 7 }}>
                    {optionDistance}m away
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(previewLocation)}
              style={({ pressed }) => ({
                minHeight: 52,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.orange,
                opacity: pressed ? 0.76 : 1,
              })}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "900" }}>
                Use {previewLocation.name} · {distance}m
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FormField({
  label,
  value,
  placeholder,
  palette,
  keyboardType,
  autoCapitalize,
  maxLength,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  palette: (typeof themeTokens)[ThemeName];
  keyboardType?: "default" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "900", marginBottom: 7 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.muted2}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={{
          minHeight: 48,
          borderRadius: 15,
          paddingHorizontal: 13,
          color: palette.text,
          backgroundColor: palette.surface2,
          borderWidth: 1,
          borderColor: palette.border,
          fontSize: 16,
          fontWeight: "800",
        }}
      />
    </View>
  );
}

function CircleButton({
  label,
  color,
  palette,
  onPress,
}: {
  label: string;
  color: string;
  palette: (typeof themeTokens)[ThemeName];
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text style={{ color, fontSize: 22, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function Radar({
  quests,
  selectedId,
  onSelect,
  palette,
  size,
  spinStyle,
}: {
  quests: Quest[];
  selectedId: string;
  onSelect: (id: string) => void;
  palette: (typeof themeTokens)[ThemeName];
  size: number;
  spinStyle: object;
}) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 280 280">
        <Defs>
          <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.orange} stopOpacity="0.23" />
            <Stop offset="44%" stopColor={COLORS.orange} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={palette.screen} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="140" cy="140" r="132" fill="url(#radarGlow)" />
        {[43, 78, 112, 136].map((radius, index) => (
          <Circle
            key={radius}
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={index === 0 ? "rgba(255,107,43,0.26)" : palette.radarRing}
            strokeWidth={index === 0 ? 1.5 : 1}
            strokeDasharray={index === 0 ? undefined : "5 7"}
          />
        ))}
        <Line x1="140" y1="10" x2="140" y2="270" stroke={palette.radarAxis} strokeWidth="1" />
        <Line x1="10" y1="140" x2="270" y2="140" stroke={palette.radarAxis} strokeWidth="1" />
        {["100m", "500m", "1km", "2km"].map((label, index) => (
          <SvgText
            key={label}
            x="145"
            y={140 - [43, 78, 112, 136][index] + 12}
            fill={palette.radarLabel}
            fontSize="11"
            fontWeight="900"
          >
            {label}
          </SvgText>
        ))}
        {quests.map((quest) => {
          const radians = (quest.angle * Math.PI) / 180;
          const x = 140 + quest.radius * Math.sin(radians);
          const y = 140 - quest.radius * Math.cos(radians);
          const selected = quest.id === selectedId;

          return (
            <G key={quest.id}>
              <Circle
                onPress={() => onSelect(quest.id)}
                cx={x}
                cy={y}
                r={selected ? 21 : 18}
                fill={quest.color}
                fillOpacity={selected ? 0.18 : 0.11}
                stroke={quest.color}
                strokeOpacity={0.45}
                strokeWidth={selected ? 2 : 1.4}
              />
              <Circle
                onPress={() => onSelect(quest.id)}
                cx={x}
                cy={y}
                r={selected ? 12 : 10}
                fill={palette.dotCore}
                stroke={quest.color}
                strokeWidth="2"
              />
              <SvgText
                onPress={() => onSelect(quest.id)}
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="14"
              >
                {quest.emoji}
              </SvgText>
            </G>
          );
        })}
        <Circle cx="140" cy="140" r="6" fill={COLORS.orange} />
        <Circle cx="140" cy="140" r="18" fill={COLORS.orange} fillOpacity="0.15" />
        <Circle cx="140" cy="140" r="12" fill="none" stroke={palette.muted} strokeOpacity="0.55" strokeWidth="2" />
      </Svg>

      {quests.map((quest) => {
        const radians = (quest.angle * Math.PI) / 180;
        const x = ((140 + quest.radius * Math.sin(radians)) / 280) * size;
        const y = ((140 - quest.radius * Math.cos(radians)) / 280) * size;

        return (
          <Pressable
            key={`${quest.id}-touch`}
            accessibilityRole="button"
            accessibilityLabel={`Select ${quest.title}`}
            onPress={() => onSelect(quest.id)}
            style={({ pressed }) => ({
              position: "absolute",
              left: x - 24,
              top: y - 24,
              width: 48,
              height: 48,
              borderRadius: 24,
              zIndex: 2,
              backgroundColor: pressed ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.001)",
            })}
          />
        );
      })}

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size,
          },
          spinStyle,
        ]}
      >
        <View
          style={{
            position: "absolute",
            left: size / 2 - 1,
            top: 14,
            width: 2,
            height: size / 2 - 14,
            backgroundColor: "rgba(255,107,43,0.36)",
          }}
        />
      </Animated.View>
    </View>
  );
}

function SelectedQuest({
  quest,
  joined,
  palette,
  onJoin,
}: {
  quest: Quest;
  joined: boolean;
  palette: (typeof themeTokens)[ThemeName];
  onJoin: () => void;
}) {
  const headcount = getQuestHeadcount(quest, joined);
  const full = headcount >= quest.max && !joined;

  return (
    <View
      style={{
        marginHorizontal: 14,
        padding: 14,
        borderRadius: 22,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: quest.color,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.surface2,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text style={{ fontSize: 28 }}>{quest.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: quest.color, fontSize: 12, fontWeight: "900" }}>{quest.tag}</Text>
          <Text style={{ color: palette.text, fontSize: 27, fontWeight: "900", letterSpacing: -1 }}>
            {quest.title}
          </Text>
          <Text style={{ color: palette.muted, fontSize: 14, fontWeight: "800" }}>
            ⌖ {quest.place}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
        <Stat label={`${quest.distance}m`} icon="↗" palette={palette} />
        <Stat label={`${headcount}/${quest.max}`} icon="♙" palette={palette} />
        <Stat label={quest.time} icon="◷" palette={palette} />
      </View>

      <View style={{ marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Energy level={quest.energy} color={quest.color} palette={palette} />
        <Pressable
          accessibilityRole="button"
          disabled={full}
          onPress={onJoin}
          style={({ pressed }) => ({
            minWidth: 104,
            minHeight: 50,
            borderRadius: 17,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: joined ? COLORS.teal : full ? palette.surface3 : quest.color,
            opacity: pressed ? 0.76 : 1,
          })}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
            {joined ? "Joined" : full ? "Full" : "Join"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuestRow({
  quest,
  selected,
  joined,
  palette,
  onPress,
  onJoin,
}: {
  quest: Quest;
  selected: boolean;
  joined: boolean;
  palette: (typeof themeTokens)[ThemeName];
  onPress: () => void;
  onJoin: () => void;
}) {
  const headcount = getQuestHeadcount(quest, joined);
  const full = headcount >= quest.max && !joined;

  return (
    <View
      style={{
        minHeight: 72,
        borderRadius: 19,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: selected ? quest.color : palette.border,
        borderLeftWidth: selected ? 4 : 1,
      }}
    >
      <Pressable onPress={onPress} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.surface2,
          }}
        >
          <Text style={{ fontSize: 25 }}>{quest.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: palette.text, fontSize: 18, fontWeight: "900" }}>
            {quest.title}
          </Text>
          <Text style={{ color: quest.color, fontSize: 13, fontWeight: "900" }}>{quest.tag}</Text>
        </View>
      </Pressable>

      <Text style={{ color: palette.muted, fontSize: 15, fontWeight: "900" }}>{quest.distance}m</Text>
      <Pressable
        accessibilityRole="button"
        disabled={full}
        onPress={onJoin}
        style={({ pressed }) => ({
          minWidth: 66,
          minHeight: 42,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: joined ? COLORS.teal : full ? palette.surface3 : quest.color,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text style={{ color: "white", fontWeight: "900" }}>{joined ? "In" : full ? "Full" : "Join"}</Text>
      </Pressable>
    </View>
  );
}

function Stat({
  label,
  icon,
  palette,
}: {
  label: string;
  icon: string;
  palette: (typeof themeTokens)[ThemeName];
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 38,
        borderRadius: 13,
        backgroundColor: palette.cardWash,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 5,
      }}
    >
      <Text style={{ color: palette.textSoft, fontSize: 18, fontWeight: "900" }}>{icon}</Text>
      <Text style={{ color: palette.textSoft, fontSize: 15, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function Energy({
  level,
  color,
  palette,
}: {
  level: number;
  color: string;
  palette: (typeof themeTokens)[ThemeName];
}) {
  const label = level >= 4 ? "Hot" : level >= 3 ? "High" : level >= 2 ? "Med" : "Low";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={{
            width: 18,
            height: 5,
            borderRadius: 3,
            backgroundColor: step <= level ? color : palette.surface3,
          }}
        />
      ))}
      <Text style={{ marginLeft: 5, color: palette.muted, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  color,
  disabled,
  onPress,
}: {
  label: string;
  icon: string;
  color: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 48,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 7,
        backgroundColor: color,
        opacity: disabled ? 0.68 : pressed ? 0.76 : 1,
      })}
    >
      <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>{icon}</Text>
      <Text style={{ color: "white", fontSize: 15, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}
