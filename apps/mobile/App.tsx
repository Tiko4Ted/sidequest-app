import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  const [theme, setTheme] = useState<ThemeName>("dark");
  const spin = useRef(new Animated.Value(0)).current;
  const nextQuestPostAtRef = useRef(0);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
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
  const radarSize = Math.min(width - 44, height < 700 ? 188 : height < 780 ? 224 : 256);
  const sortedQuests = useMemo(
    () => [...liveQuests].sort((a, b) => a.distance - b.distance),
    [liveQuests],
  );
  const radarQuests = useMemo(
    () =>
      liveQuests.filter((quest) => {
        const full = getQuestHeadcount(quest, joined.has(quest.id)) >= quest.max;
        return !full && !isQuestPassed(quest);
      }),
    [joined, liveQuests],
  );
  const selected = liveQuests.find((quest) => quest.id === selectedId) ?? liveQuests[0];
  const hasJoined = joined.has(selected.id);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.screen }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={{ flex: 1, paddingTop: statusTopPadding, backgroundColor: palette.screen }}>
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
            <Text
              style={{
                color: palette.muted,
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 1.5,
              }}
            >
              JUJA LIVE
            </Text>
            <Text
              style={{
                color: COLORS.orange,
                fontSize: 39,
                fontWeight: "900",
                letterSpacing: -2,
              }}
            >
              SideQuest
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CircleButton
              label={theme === "dark" ? "☀" : "☾"}
              color={COLORS.gold}
              palette={palette}
              onPress={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
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

        <View
          style={{
            minHeight: 42,
            paddingHorizontal: 18,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: palette.borderStrong,
            backgroundColor: palette.surface,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: COLORS.orange,
              opacity: 0.9,
            }}
          />
          <Text style={{ color: COLORS.orange, fontSize: 15, fontWeight: "900" }}>
            {freeActive ? 24 : 23} people
          </Text>
          <Text style={{ color: palette.muted, fontSize: 15, fontWeight: "800" }}>active</Text>
          <Text style={{ color: palette.muted, fontSize: 18, fontWeight: "900" }}>·</Text>
          <Text style={{ color: COLORS.teal, fontSize: 15, fontWeight: "900" }}>
            {liveQuests.length} quests
          </Text>
          <Text
            style={{
              marginLeft: "auto",
              color: palette.muted,
              fontSize: 15,
              fontWeight: "900",
            }}
          >
            ⌖ Juja
          </Text>
        </View>

        <View style={{ flex: 1, paddingBottom: 78 }}>
          <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 6 }}>
            <Radar
              quests={radarQuests}
              selectedId={selected.id}
              onSelect={setSelectedId}
              palette={palette}
              size={radarSize}
              spinStyle={spinStyle}
            />
          </View>

          <SelectedQuest
            quest={selected}
            joined={hasJoined}
            palette={palette}
            onJoin={() => toggleJoin(selected.id)}
          />

          <View
            style={{
              flex: 1,
              minHeight: 96,
              paddingHorizontal: 14,
              paddingTop: 10,
            }}
          >
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
                  onPress={() => setSelectedId(quest.id)}
                  onJoin={() => toggleJoin(quest.id)}
                />
              ))}

              <View
                style={{
                  minHeight: 62,
                  opacity: 0.66,
                  borderRadius: 18,
                  padding: 11,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: palette.ghost,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <Text style={{ fontSize: 23, opacity: 0.5 }}>🚴</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.muted, fontWeight: "900" }}>
                    Bike Ride · ended 22 min ago
                  </Text>
                  <Text style={{ color: palette.muted2, fontSize: 12, fontWeight: "800" }}>
                    5 people · 🔥
                  </Text>
                </View>
                <Text
                  style={{
                    color: palette.muted,
                    backgroundColor: palette.surface2,
                    borderRadius: 9,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    fontSize: 11,
                    fontWeight: "900",
                  }}
                >
                  Ghost
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 10,
            flexDirection: "row",
            gap: 8,
            padding: 8,
            borderRadius: 18,
            backgroundColor: palette.bottom,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <ActionButton
            label={freeActive ? "Free now" : "I'm Free"}
            icon="⚡"
            color={freeActive ? COLORS.teal : COLORS.purple}
            onPress={() => setFreeActive((active) => !active)}
          />
          <ActionButton
            label={questPostOnCooldown ? `Wait ${questPostCooldownLabel}` : "Post Quest"}
            icon={questPostOnCooldown ? "◷" : "+"}
            color={questPostOnCooldown ? palette.surface3 : COLORS.orange}
            disabled={questPostOnCooldown}
            onPress={() => setComposerOpen(true)}
          />
        </View>

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
            left: size / 2,
            top: 14,
            width: 2,
            height: size / 2 - 14,
            backgroundColor: "rgba(255,107,43,0.36)",
            transformOrigin: "bottom",
          },
          spinStyle,
        ]}
      />
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
