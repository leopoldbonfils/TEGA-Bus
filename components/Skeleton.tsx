// import React, { useEffect, useRef } from 'react';
// import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';

// interface SkeletonProps {
//   width?: number | string;
//   height?: number | string;
//   borderRadius?: number;
//   style?: StyleProp<ViewStyle>;
// }

// export default function Skeleton({
//   width = '100%',
//   height = 20,
//   borderRadius = 8,
//   style,
// }: SkeletonProps) {
//   const opacity = useRef(new Animated.Value(0.35)).current;

//   useEffect(() => {
//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(opacity, {
//           toValue: 0.85,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//         Animated.timing(opacity, {
//           toValue: 0.35,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//       ])
//     );

//     animation.start();

//     return () => animation.stop();
//   }, [opacity]);

//   return (
//     <Animated.View
//       style={[
//         styles.skeleton,
//         {
//           width: width as any,
//           height: height as any,
//           borderRadius,
//           opacity,
//         },
//         style,
//       ]}
//     />
//   );
// }

// export function SkeletonCircle({
//   size = 40,
//   style,
// }: {
//   size?: number;
//   style?: StyleProp<ViewStyle>;
// }) {
//   return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
// }

// const styles = StyleSheet.create({
//   skeleton: {
//     backgroundColor: '#E2E8F0',
//   },
// });
