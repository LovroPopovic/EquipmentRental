import { useTheme } from '../context/ThemeContext';
import { colors, ColorScheme } from '../utils/colors';

export const useColors = (): ColorScheme => {
  const { theme } = useTheme();
  return colors[theme];
};