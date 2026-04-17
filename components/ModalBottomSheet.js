import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { View } from "react-native";
import colors from "../constants/colors";

export default function ModalBottomSheet({
  sheetRef,
  enableDynamicSizing = false,
  snapPoints = ["50%"],
  maxDynamicContentSize = 600,
  children,
  footer,
  footerStyle,
  contentContainerStyle,
}) {
  const normalizedSnapPoints = Array.isArray(snapPoints)
    ? snapPoints
    : [snapPoints];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enableDynamicSizing={enableDynamicSizing}
      maxDynamicContentSize={
        enableDynamicSizing ? maxDynamicContentSize : undefined
      }
      enablePanDownToClose
      snapPoints={enableDynamicSizing ? undefined : normalizedSnapPoints}
      backgroundStyle={{ backgroundColor: colors.backgroundLight }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={[{ padding: 20 }, contentContainerStyle]}
      >
        {children}
      </BottomSheetScrollView>

      {footer && (
        <View
          style={[
            { padding: 20, paddingBottom: 40, alignItems: "center" },
            footerStyle,
          ]}
        >
          {footer}
        </View>
      )}
    </BottomSheet>
  );
}
