import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

const FILTERS = [
  "📍 près de vous",
  "⭐ mieux notés",
  "poulet",
  "agneau",
  "veau",
  "mixte",
  "veggie",
  "fait-maison",
  "ouvert-tard",
  "best-seller",
  "petit-prix",
];

export default function FilterTags({ selected, onToggle }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={{ flexGrow: 0 }}
    >
      {FILTERS.map((tag) => {
        const isActive = selected.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, isActive && styles.tagActive]}
            onPress={() => onToggle(tag)}
          >
            <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8,
    marginTop: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textDark,
  },
  tagTextActive: {
    fontFamily: fonts.family.bold,
    color: colors.textWhite,
  },
});
