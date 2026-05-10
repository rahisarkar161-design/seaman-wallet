import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  daysLeft: number;
  small?: boolean;
}

export default function ExpiryBadge({ daysLeft, small }: Props) {
  let bg = "#38A169";
  let label = `${daysLeft}d`;

  if (daysLeft < 0) {
    bg = "#742A2A";
    label = "EXPIRED";
  } else if (daysLeft === 0) {
    bg = "#742A2A";
    label = "Today";
  } else if (daysLeft <= 25) {
    bg = "#C53030";
    label = `${daysLeft}d`;
  } else if (daysLeft <= 90) {
    bg = "#D69E2E";
    label = `${daysLeft}d`;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.text, small && styles.smallText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 10,
  },
});
