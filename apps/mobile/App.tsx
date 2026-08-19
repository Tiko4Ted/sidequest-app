import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Syne_700Bold, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
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
const NAV_HEIGHT = 58;

type Screen = "Radar" | "Home" | "Detail" | "Chat" | "Post" | "I'm Free" | "Profile";
type ThemeName = "dark" | "light";

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

function AppText({
  children,
  style,
  display,
}: {
  children: React.ReactNode;
  style?: object;
  display?: boolean;
}) {
  return (
    <Text style={[{ fontFamily: display ? displayFont : bodyFont, color: TX }, style]}>
      {children}
    </Text>
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
        fontSize: 18,
        letterSpacing: -1,
        lineHeight: 24,
        paddingVertical: 2,
      }}
    >
      SideQuest
    </AppText>
  );
}

function EnergyBar({ level, color = OR }: { level: number; color?: string }) {
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

function LiveStrip({
  compact = false,
  theme = RADAR_THEMES.dark,
}: {
  compact?: boolean;
  theme?: (typeof RADAR_THEMES)[ThemeName];
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: compact ? 3 : 4,
        paddingHorizontal: 14,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <View style={{ width: compact ? 4 : 5, height: compact ? 4 : 5, borderRadius: 3, backgroundColor: OR }} />
      <AppText style={{ color: theme.muted2, fontFamily: bodyBold, fontSize: compact ? 8.5 : 9 }}>
        <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: compact ? 8.5 : 9 }}>
          23 people
        </AppText>{" "}
        active {compact ? "in Juja" : "· "}
        {!compact && (
          <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 9 }}>6 quests</AppText>
        )}
      </AppText>
      {!compact && (
        <AppText style={{ marginLeft: "auto", color: theme.muted, fontFamily: bodyBold, fontSize: 8 }}>
          Juja
        </AppText>
      )}
    </View>
  );
}

function ScreenFrame({
  children,
  scroll = false,
  backgroundColor = BG,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}) {
  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 26, paddingHorizontal: 12, paddingBottom: 10 }}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={{ flex: 1, backgroundColor, paddingTop: 26 }}>{children}</View>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("Radar");
  const [theme, setTheme] = useState<ThemeName>("dark");
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

  const activeTheme = screen === "Radar" ? RADAR_THEMES[theme] : RADAR_THEMES.dark;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      <StatusBar style={screen === "Radar" && theme === "light" ? "dark" : "light"} />
      <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: NAV_HEIGHT }}>
          {screen === "Radar" && (
            <RadarScreen
              nav={setScreen}
              theme={theme}
              onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            />
          )}
          {screen === "Home" && <HomeScreen nav={setScreen} />}
          {screen === "Detail" && <DetailScreen nav={setScreen} />}
          {screen === "Chat" && <ChatScreen nav={setScreen} />}
          {screen === "Post" && <PostScreen nav={setScreen} />}
          {screen === "I'm Free" && <FreeScreen nav={setScreen} />}
          {screen === "Profile" && <ProfileScreen />}
        </View>
        <BottomNav screen={screen} nav={setScreen} />
      </View>
    </SafeAreaView>
  );
}

function BottomNav({ screen, nav }: { screen: Screen; nav: (screen: Screen) => void }) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
        backgroundColor: "#09090fee",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: 4,
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
                width: 44,
                height: 44,
                borderRadius: 14,
                marginTop: -10,
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
              <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 24, lineHeight: 28 }}>
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
              minWidth: 50,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: "center",
              gap: 2,
              opacity: isActive ? 1 : pressed ? 0.65 : 0.45,
              transform: [{ scale: isActive ? 1.05 : 1 }],
            })}
          >
            <AppText style={{ color: isActive ? OR : MT2, fontFamily: bodyBold, fontSize: 24, lineHeight: 24 }}>
              {tab.icon}
            </AppText>
            <AppText
              style={{
                color: isActive ? OR : MT,
                fontFamily: bodyBold,
                fontSize: 8,
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
          width: 90,
          height: 3.5,
          marginLeft: -45,
          borderRadius: 2,
          backgroundColor: "#1e1e32",
        }}
      />
    </View>
  );
}

function RadarScreen({
  nav,
  theme,
  onToggleTheme,
}: {
  nav: (screen: Screen) => void;
  theme: ThemeName;
  onToggleTheme: () => void;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(0)).current;
  const palette = RADAR_THEMES[theme];
  const radarSize = 274;
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

  return (
    <ScreenFrame backgroundColor={palette.bg}>
      <Header action={<ThemeToggle theme={theme} onPress={onToggleTheme} />} />
      <LiveStrip theme={palette} />
      <View style={{ height: radarSize + 60, paddingTop: 55, paddingBottom: 5, alignItems: "center", justifyContent: "center" }}>
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
                onPress={() => nav("Detail")}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 9, paddingTop: 100, paddingBottom: 8, gap: 4 }}
        style={{ flex: 1 }}
      >
        {[
          { emoji: "⚡", label: "Pizza Run", distance: "195m", color: RD, tag: "FLASH 18min" },
          { emoji: "☕", label: "Coffee", distance: "210m", color: OR, tag: "2/6" },
          { emoji: "⚽", label: "Football", distance: "490m", color: OR, tag: "4/10" },
          { emoji: "ðŸŽ®", label: "Gaming", distance: "260m", color: PU, tag: "3/8" },
          { emoji: "ðŸ•", label: "Food Run", distance: "330m", color: YL, tag: "5/12" },
          { emoji: "ðŸ“š", label: "Study Sprint", distance: "620m", color: TL, tag: "FOCUS" },
          { emoji: "ðŸ“¸", label: "Sunset Photos", distance: "880m", color: PU, tag: "CREW" },
        ].map((quest) => (
          <Pressable
            key={quest.label}
            onPress={() => nav("Detail")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: `${quest.color}24`,
              borderRadius: 11,
              paddingVertical: 6,
              paddingHorizontal: 9,
              opacity: pressed ? 0.78 : 1,
            })}
          >
            <AppText style={{ fontSize: 16 }}>{quest.emoji}</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: palette.text, fontFamily: bodyBold, fontSize: 10 }}>{quest.label}</AppText>
              <AppText style={{ color: quest.color, fontFamily: bodyBold, fontSize: 7.5 }}>{quest.tag}</AppText>
            </View>
            <AppText style={{ color: palette.muted, fontSize: 8.5, marginRight: 3 }}>{quest.distance}</AppText>
            <View style={{ paddingVertical: 3, paddingHorizontal: 9, backgroundColor: quest.color, borderRadius: 7 }}>
              <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 8 }}>Join</AppText>
            </View>
          </Pressable>
        ))}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            backgroundColor: palette.ghost,
            borderWidth: 1,
            borderColor: palette.softBorder,
            borderRadius: 11,
            paddingVertical: 6,
            paddingHorizontal: 9,
            opacity: 0.55,
          }}
        >
          <AppText style={{ fontSize: 16, opacity: 0.4 }}>🚲</AppText>
          <View style={{ flex: 1 }}>
            <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 10 }}>Bike Ride · ended 22 min ago</AppText>
            <AppText style={{ color: MT, fontSize: 8 }}>5 people · dissolved</AppText>
          </View>
          <View style={{ backgroundColor: palette.surface2, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
            <AppText style={{ color: MT, fontSize: 8 }}>ghost</AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

function HomeScreen({ nav }: { nav: (screen: Screen) => void }) {
  const ticker = useRef(new Animated.Value(0)).current;

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

  const translateX = ticker.interpolate({ inputRange: [0, 1], outputRange: [0, -230] });
  const quests = [
    { emoji: "🚲", title: "Bike Ride", place: "Juja Farm Rd", members: 3, max: 6, energy: 4, start: "17:30", full: false },
    { emoji: "🎲", title: "Board Games", place: "Kahawa Sukari", members: 4, max: 8, energy: 3, start: "19:00", full: false },
    { emoji: "⚽", title: "Evening Football", place: "JKUAT Grounds", members: 10, max: 10, energy: 2, start: "18:00", full: true },
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
      <View style={{ flexDirection: "row", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: S3 }}>
        <View style={{ paddingVertical: 5, paddingHorizontal: 9, borderBottomWidth: 2, borderBottomColor: OR }}>
          <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 10 }}>Quests</AppText>
        </View>
        <View style={{ paddingVertical: 5, paddingHorizontal: 9 }}>
          <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 10 }}>Community</AppText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 9, gap: 6, paddingBottom: 8 }}
      >
        {quests.map((quest) => (
          <QuestCard key={quest.title} quest={quest} onPress={() => nav("Detail")} />
        ))}
        <View
          style={{
            backgroundColor: "#0b0b12",
            borderWidth: 1,
            borderColor: "#ffffff08",
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 10,
            opacity: 0.55,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AppText style={{ fontSize: 16, opacity: 0.35 }}>🚲</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 10 }}>Bike Ride ended 25 min ago</AppText>
              <AppText style={{ color: MT, fontSize: 8 }}>5 people · dissolved</AppText>
            </View>
            <View style={{ backgroundColor: S2, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
              <AppText style={{ color: MT, fontSize: 8 }}>ghost</AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenFrame>
  );
}

function QuestCard({
  quest,
  onPress,
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
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: quest.full ? "#0e0e18" : S1,
        borderWidth: 1,
        borderColor: quest.full ? "#ffffff12" : "#ffffff10",
        borderRadius: 14,
        padding: 10,
        overflow: "hidden",
        opacity: quest.full ? 0.8 : pressed ? 0.78 : 1,
      })}
    >
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: quest.full ? MT : OR }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <AppText style={{ fontSize: 24, lineHeight: 27 }}>{quest.emoji}</AppText>
        {quest.full ? (
          <View style={{ backgroundColor: "#ffffff12", borderColor: "#ffffff20", borderWidth: 1, borderRadius: 7, paddingVertical: 2, paddingHorizontal: 7 }}>
            <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 8.5 }}>FULL</AppText>
          </View>
        ) : (
          <View style={{ backgroundColor: `${TL}18`, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 }}>
            <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 7.5 }}>▶ {quest.start}</AppText>
          </View>
        )}
      </View>
      <AppText display style={{ color: quest.full ? MT : TX, fontFamily: displayFontAlt, fontSize: 12, marginBottom: 1 }}>
        {quest.title}
      </AppText>
      <AppText style={{ color: MT, fontSize: 8.5, marginBottom: 6 }}>⌖ {quest.place}</AppText>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: quest.full ? 0 : 5 }}>
        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
          {Array.from({ length: Math.min(quest.max, 5) }).map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index < quest.members ? OR : S3,
                borderWidth: 1,
                borderColor: index < quest.members ? OR : "#ffffff12",
              }}
            />
          ))}
          <AppText style={{ color: MT2, fontFamily: bodyBold, fontSize: 7.5, marginLeft: 2 }}>
            {quest.members}/{quest.max}
          </AppText>
        </View>
        {quest.full ? (
          <View style={{ backgroundColor: S2, borderRadius: 7, paddingVertical: 3, paddingHorizontal: 9 }}>
            <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 8.5 }}>Create similar</AppText>
          </View>
        ) : (
          <View style={{ backgroundColor: OR, borderRadius: 7, paddingVertical: 4, paddingHorizontal: 10 }}>
            <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 8.5 }}>Join</AppText>
          </View>
        )}
      </View>
      {!quest.full && <EnergyBar level={quest.energy} />}
    </Pressable>
  );
}

function DetailScreen({ nav }: { nav: (screen: Screen) => void }) {
  return (
    <ScreenFrame scroll>
      <View style={{ marginHorizontal: -12, marginTop: -26, paddingTop: 32, paddingHorizontal: 13, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: S3 }}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, backgroundColor: OR }} />
        <Pressable onPress={() => nav("Home")}>
          <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 9, marginBottom: 8 }}>← Back</AppText>
        </Pressable>
        <AppText style={{ fontSize: 38, lineHeight: 42, marginBottom: 6 }}>🚲</AppText>
        <AppText display style={{ color: TX, fontSize: 20, marginBottom: 2 }}>Bike Ride</AppText>
        <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 9.5 }}>⌖ Juja Farm Road area</AppText>
        <AppText style={{ color: MT2, fontFamily: "Nunito_400Regular", fontSize: 8, marginTop: 1, fontStyle: "italic" }}>
          Exact location unlocks when you join
        </AppText>
      </View>
      <View style={{ paddingTop: 10 }}>
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 9 }}>
          {[
            { label: "Squad", value: "2/6", color: OR },
            { label: "Expires", value: "18h", color: TX },
            { label: "Starts", value: "17:30", color: TL },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, backgroundColor: S1, borderWidth: 1, borderColor: "#ffffff10", borderRadius: 10, paddingVertical: 7, paddingHorizontal: 6 }}>
              <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</AppText>
              <AppText display style={{ color: item.color, fontFamily: displayFontAlt, fontSize: 14 }}>{item.value}</AppText>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: S1, borderWidth: 1, borderColor: "#ffffff10", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 }}>
          <AppText style={{ color: "#9090b0", fontSize: 9, lineHeight: 15 }}>Casual evening ride through Juja Farm. Any bike works.</AppText>
        </View>
        <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Hype — last 2h</AppText>
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
          {[
            { emoji: "🔥", recent: 3, total: 7, color: OR, pct: "80%" },
            { emoji: "👀", recent: 6, total: 11, color: TL, pct: "100%" },
            { emoji: "🚀", recent: 1, total: 5, color: PU, pct: "30%" },
          ].map((hype) => (
            <View key={hype.emoji} style={{ flex: 1, backgroundColor: S2, borderWidth: 1, borderColor: `${hype.color}30`, borderRadius: 9, paddingVertical: 5, alignItems: "center", overflow: "hidden" }}>
              <View style={{ position: "absolute", bottom: 0, left: 0, width: hype.pct as "80%" | "100%" | "30%", height: 2, backgroundColor: hype.color }} />
              <AppText style={{ fontSize: 14, marginBottom: 1 }}>{hype.emoji}</AppText>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 1 }}>
                <AppText style={{ color: hype.color, fontFamily: bodyBold, fontSize: 11 }}>{hype.recent}</AppText>
                <AppText style={{ color: MT, fontSize: 7.5 }}>/{hype.total}</AppText>
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginBottom: 8 }}>
          <EnergyBar level={3} />
        </View>
        <View style={{ backgroundColor: S1, borderWidth: 1, borderColor: "#ffffff10", borderRadius: 11, padding: 9, alignItems: "center", marginBottom: 8 }}>
          <AppText style={{ fontSize: 18, marginBottom: 2 }}>💬</AppText>
          <AppText display style={{ color: TX, fontSize: 10, marginBottom: 3 }}>Chat unlocks at 3 members</AppText>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginBottom: 2 }}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: index < 2 ? OR : S3, borderWidth: 1.5, borderColor: index < 2 ? OR : "#ffffff16" }} />
            ))}
          </View>
          <AppText style={{ color: MT, fontSize: 7.5 }}>1 more needed</AppText>
        </View>
        <Pressable onPress={() => nav("Chat")} style={({ pressed }) => ({ backgroundColor: OR, borderRadius: 12, padding: 11, alignItems: "center", opacity: pressed ? 0.8 : 1 })}>
          <AppText display style={{ color: "white", fontSize: 13 }}>⚡ Join Quest</AppText>
        </Pressable>
      </View>
    </ScreenFrame>
  );
}

function ChatScreen({ nav }: { nav: (screen: Screen) => void }) {
  const messages = [
    { user: "Alex M.", text: "Main stage at 5pm?" },
    { user: "Joy K.", text: "Works! Which route?" },
    { user: "Alex M.", text: "Farm loop → bypass" },
    { user: "You", text: "On my way! 10 mins" },
  ];

  return (
    <ScreenFrame>
      <View style={{ paddingHorizontal: 13, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: S3 }}>
        <Pressable onPress={() => nav("Detail")}>
          <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 9, marginBottom: 6 }}>← Back</AppText>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <AppText style={{ fontSize: 20 }}>🚲</AppText>
          <View style={{ flex: 1 }}>
            <AppText display style={{ color: TX, fontSize: 12 }}>Bike Ride · dissolves in 1h 44m</AppText>
            <AppText style={{ color: MT, fontSize: 8.5 }}>⌖ Main Stage · 3/6</AppText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "#ff6b2b14", borderWidth: 1, borderColor: "#ff6b2b25", borderRadius: 7, paddingVertical: 2, paddingHorizontal: 6 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: OR }} />
            <AppText style={{ color: OR, fontFamily: bodyBold, fontSize: 8.5 }}>Live</AppText>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: S1, borderBottomWidth: 1, borderBottomColor: S3 }} contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 8, gap: 3 }}>
        {[
          { name: "Alex M.", status: "Already there", color: OR },
          { name: "Joy K.", status: "On my way", color: TL },
          { name: "You", status: "On my way", color: PU },
        ].map((member) => (
          <View key={member.name} style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: S2, borderRadius: 7, paddingVertical: 3, paddingHorizontal: 6 }}>
            <Avatar name={member.name} size={13} />
            <View>
              <AppText style={{ color: MT2, fontFamily: bodyBold, fontSize: 7 }}>{member.name === "You" ? "You" : member.name.split(" ")[0]}</AppText>
              <AppText style={{ color: member.color, fontFamily: bodyBold, fontSize: 6.5 }}>{member.status}</AppText>
            </View>
          </View>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 7, paddingHorizontal: 9, gap: 6 }} showsVerticalScrollIndicator={false}>
        {messages.map((message, index) => {
          const mine = message.user === "You";

          return (
            <View key={`${message.user}-${index}`} style={{ flexDirection: mine ? "row-reverse" : "row", gap: 4, alignItems: "flex-end" }}>
              {!mine && <Avatar name={message.user} size={18} />}
              <View style={{ maxWidth: "78%" }}>
                {!mine && <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 7.5, marginBottom: 2 }}>{message.user}</AppText>}
                <View style={{ backgroundColor: mine ? OR : S2, borderRadius: 10, borderBottomRightRadius: mine ? 3 : 10, borderBottomLeftRadius: mine ? 10 : 3, paddingVertical: 5, paddingHorizontal: 8 }}>
                  <AppText style={{ color: "white", fontSize: 10, lineHeight: 15 }}>{message.text}</AppText>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ marginHorizontal: 8, marginVertical: 3, backgroundColor: "#a78bfa12", borderWidth: 1, borderColor: "#a78bfa30", borderRadius: 9, paddingVertical: 6, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5 }}>
        <AppText style={{ fontSize: 13 }}>☎</AppText>
        <View style={{ flex: 1 }}>
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8.5 }}>Share contact before chat closes</AppText>
          <AppText style={{ color: MT, fontSize: 7.5 }}>28 min · Chat dissolves when squad disbands</AppText>
        </View>
        <View style={{ backgroundColor: "#a78bfa18", borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 }}>
          <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8 }}>Share</AppText>
        </View>
      </View>
      <View style={{ paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: S3, flexDirection: "row", gap: 4 }}>
        <View style={{ flex: 1, backgroundColor: S2, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}>
          <AppText style={{ color: MT, fontSize: 9.5 }}>Coordinate — where are you meeting?</AppText>
        </View>
        <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: OR, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: "white", fontFamily: bodyBold, fontSize: 11 }}>➤</AppText>
        </View>
      </View>
    </ScreenFrame>
  );
}

function PostScreen({ nav }: { nav: (screen: Screen) => void }) {
  return (
    <ScreenFrame scroll>
      <AppText display style={{ color: TX, fontSize: 19, marginBottom: 2 }}>
        Post a <AppText display style={{ color: OR, fontSize: 19 }}>Quest</AppText>
      </AppText>
      <AppText style={{ color: MT, fontSize: 8.5, marginBottom: 10 }}>Visible to people near you in 30 seconds.</AppText>
      <SectionLabel>Quick start</SectionLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {[
          ["☕", "Coffee"],
          ["⚽", "Football"],
          ["🎲", "Games"],
          ["🚶", "Walk"],
          ["🏃", "Run"],
          ["🍕", "Food"],
          ["🎮", "Gaming"],
          ["🏊", "Swim"],
        ].map(([emoji, label], index) => (
          <View key={label} style={{ width: "24%", backgroundColor: index === 1 ? "#ff6b2b20" : S1, borderWidth: 1.5, borderColor: index === 1 ? OR : "#ffffff12", borderRadius: 9, paddingVertical: 5, alignItems: "center" }}>
            <AppText style={{ fontSize: 15, marginBottom: 1 }}>{emoji}</AppText>
            <AppText style={{ color: index === 1 ? OR : MT2, fontFamily: bodyBold, fontSize: 7 }}>{label}</AppText>
          </View>
        ))}
      </View>
      <Field label="Activity" value="Football" color={OR} />
      <Field label="Location" value="JKUAT Main Gate…" />
      <SectionLabel>Start time</SectionLabel>
      <View style={{ backgroundColor: `${TL}10`, borderWidth: 1.5, borderColor: `${TL}40`, borderRadius: 9, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 4 }}>
        <AppText style={{ color: TL, fontFamily: bodyBold, fontSize: 10.5 }}>▶ 18:00</AppText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <StepperButton label="−" />
        <View style={{ flex: 1, alignItems: "center" }}>
          <AppText display style={{ color: OR, fontSize: 24 }}>10</AppText>
          <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 7.5 }}>max</AppText>
        </View>
        <StepperButton label="+" />
      </View>
      <Pressable onPress={() => nav("Home")} style={({ pressed }) => ({ backgroundColor: OR, borderRadius: 11, padding: 11, alignItems: "center", opacity: pressed ? 0.8 : 1 })}>
        <AppText display style={{ color: "white", fontSize: 13 }}>Post Quest</AppText>
      </Pressable>
    </ScreenFrame>
  );
}

function FreeScreen({ nav }: { nav: (screen: Screen) => void }) {
  return (
    <ScreenFrame scroll>
      <View style={{ alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, backgroundColor: "#a78bfa0e", borderRadius: 14, borderWidth: 1, borderColor: `${PU}35`, marginBottom: 10 }}>
        <AppText style={{ fontSize: 34, marginBottom: 5 }}>⚡</AppText>
        <AppText display style={{ color: TX, fontSize: 17, marginBottom: 2 }}>I'm Free Mode</AppText>
        <AppText style={{ color: MT2, fontSize: 9, lineHeight: 14, textAlign: "center" }}>No plan. No activity.{"\n"}People within 1km see you're free.</AppText>
      </View>
      <View style={{ backgroundColor: S1, borderWidth: 1, borderColor: "#ffffff12", borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 8 }}>
        <AppText style={{ color: MT, fontSize: 8.5, marginBottom: 4 }}>
          Next broadcast in <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8.5 }}>4h 22m</AppText>
        </AppText>
        <View style={{ height: 4, backgroundColor: S3, borderRadius: 2, overflow: "hidden" }}>
          <View style={{ width: "27%", height: "100%", backgroundColor: PU, borderRadius: 2 }} />
        </View>
      </View>
      <View style={{ backgroundColor: "#a78bfa10", borderWidth: 1.5, borderColor: `${PU}45`, borderRadius: 12, padding: 10, marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <AppText display style={{ color: TX, fontSize: 11 }}>Broadcasting ⚡</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: PU }} />
            <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 7.5 }}>LIVE</AppText>
          </View>
        </View>
        <AppText style={{ color: MT2, fontSize: 8, marginBottom: 6 }}>⌖ 1km · Expires 1h 54m · 2 replies</AppText>
        {[
          { name: "Ciku N.", text: "☕ Coffee sounds good?" },
          { name: "Brian T.", text: "Football? Also free!" },
        ].map((reply) => (
          <View key={reply.name} style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: S2, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 7, marginBottom: 4 }}>
            <Avatar name={reply.name} size={20} />
            <View style={{ flex: 1 }}>
              <AppText style={{ color: TX, fontFamily: bodyBold, fontSize: 9 }}>{reply.name}</AppText>
              <AppText style={{ color: MT2, fontSize: 9 }}>{reply.text}</AppText>
            </View>
            <Pressable onPress={() => nav("Post")} style={{ backgroundColor: "#a78bfa12", borderWidth: 1, borderColor: `${PU}40`, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 }}>
              <AppText style={{ color: PU, fontFamily: bodyBold, fontSize: 8 }}>Reply</AppText>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: S2, borderRadius: 11, padding: 11, alignItems: "center", opacity: 0.6 }}>
        <AppText display style={{ color: MT, fontSize: 11 }}>⏱ Available in 4h 22m</AppText>
      </View>
    </ScreenFrame>
  );
}

function ProfileScreen() {
  const cards = [
    { emoji: "🚲", title: "Bike Ride", vibe: "🔥", gold: true, shared: true },
    { emoji: "🎲", title: "Games", vibe: "✨", gold: false, shared: true },
    { emoji: "⚽", title: "Football", vibe: "⚡", gold: false, shared: false },
    { emoji: "🩸", title: "Blood Drive", vibe: "💛", gold: false, shared: false },
  ];

  return (
    <ScreenFrame>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}>
        <View style={{ paddingTop: 28, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: S3, alignItems: "center", backgroundColor: "#0b0911" }}>
          <View style={{ position: "relative", marginBottom: 6 }}>
            <Avatar name="AT" size={46} />
            <View style={{ position: "absolute", bottom: -2, right: -2, backgroundColor: YL, borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: BG }}>
              <AppText style={{ color: "#08080f", fontFamily: bodyBold, fontSize: 8 }}>7</AppText>
            </View>
          </View>
          <AppText display style={{ color: TX, fontSize: 14 }}>Atacama</AppText>
          <AppText style={{ color: MT, fontSize: 8, marginBottom: 6 }}>Juja · Urban Explorer</AppText>
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
              <View key={stat.label} style={{ flex: 1, backgroundColor: S1, borderWidth: 1, borderColor: "#ffffff10", borderRadius: 8, paddingVertical: 6, alignItems: "center" }}>
                <AppText display style={{ color: stat.color, fontSize: 12 }}>{stat.value}</AppText>
                <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 6.5, marginTop: 1 }}>{stat.label}</AppText>
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
              <View key={label} style={{ width: 36, alignItems: "center", gap: 1, backgroundColor: S1, borderWidth: 1, borderColor: "#fbbf2430", borderRadius: 8, paddingVertical: 4, opacity: index >= 6 ? 0.3 : 1 }}>
                <AppText style={{ fontSize: 13 }}>{emoji}</AppText>
                <AppText style={{ color: MT2, fontFamily: bodyBold, fontSize: 5.5, textAlign: "center" }}>{label}</AppText>
              </View>
            ))}
          </View>
          <SectionLabel>Story Cards</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {cards.map((card) => (
              <View key={card.title} style={{ width: "49%", backgroundColor: card.gold ? `${YL}12` : card.shared ? S1 : "#0a0a12", borderWidth: 1, borderColor: card.gold ? `${YL}40` : card.shared ? S3 : "#ffffff08", borderRadius: 10, padding: 7, alignItems: "center", overflow: "hidden" }}>
                {!card.shared && (
                  <View style={{ position: "absolute", inset: 0, backgroundColor: "#07070fee", zIndex: 2, alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <AppText style={{ fontSize: 10 }}>🔒</AppText>
                    <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 6.5, textAlign: "center", paddingHorizontal: 3 }}>Quest together first</AppText>
                  </View>
                )}
                <AppText style={{ fontSize: 18, marginBottom: 2 }}>{card.emoji}</AppText>
                <AppText style={{ color: TX, fontFamily: bodyBold, fontSize: 8.5, marginBottom: 1 }}>{card.title}</AppText>
                <AppText style={{ fontSize: 11 }}>{card.vibe}</AppText>
              </View>
            ))}
          </View>
          <SectionLabel>Squad Memory</SectionLabel>
          {[
            ["Alex M.", "4"],
            ["Joy K.", "3"],
          ].map(([name, count]) => (
            <View key={name} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: S3 }}>
              <Avatar name={name} size={22} />
              <View style={{ flex: 1 }}>
                <AppText style={{ color: TX, fontFamily: bodyBold, fontSize: 9.5 }}>{name}</AppText>
                <AppText style={{ color: MT, fontSize: 7.5 }}>Quested {count}x</AppText>
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
  return (
    <AppText style={{ color: MT, fontFamily: bodyBold, fontSize: 7.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </AppText>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View>
      <SectionLabel>{label}</SectionLabel>
      <View style={{ backgroundColor: S1, borderWidth: 1.5, borderColor: color || "#ffffff12", borderRadius: 9, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 9 }}>
        <AppText style={{ color: color ? TX : MT, fontSize: 10.5 }}>{value}</AppText>
      </View>
    </View>
  );
}

function StepperButton({ label }: { label: string }) {
  return (
    <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: S1, borderWidth: 1.5, borderColor: "#ffffff12", alignItems: "center", justifyContent: "center" }}>
      <AppText style={{ color: TX, fontFamily: bodyBold, fontSize: 16 }}>{label}</AppText>
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
