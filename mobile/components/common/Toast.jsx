import { useEffect } from 'react';
import { Text, View, Animated } from 'react-native';

export default function Toast({ message, type = 'success', onClose }) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (!message) return;

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onClose?.());
  }, [message]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <Animated.View
      style={{ opacity }}
      className={`absolute bottom-8 left-6 right-6 ${bgColor} rounded-2xl px-5 py-4 z-50 shadow-lg`}
    >
      <Text className="text-white font-semibold text-sm text-center">{message}</Text>
    </Animated.View>
  );
}
