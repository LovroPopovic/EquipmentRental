import { useTheme } from '../context/ThemeContext';
import { colors } from '../utils/colors';

export const useColors = () => {
  const { theme } = useTheme();
  return colors[theme];
};