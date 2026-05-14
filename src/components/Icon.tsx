import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

type IconName =
  | 'dumbbell'
  | 'home'
  | 'list'
  | 'timer'
  | 'chart'
  | 'calendar'
  | 'sparkles'
  | 'settings'
  | 'plus'
  | 'minus'
  | 'check'
  | 'close'
  | 'play'
  | 'pause'
  | 'flame'
  | 'trash'
  | 'search'
  | 'chevronRight'
  | 'chevronLeft'
  | 'arrowRight'
  | 'arrowLeft'
  | 'logout'
  | 'image'
  | 'camera'
  | 'ruler';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = '#fff', strokeWidth = 2 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'dumbbell':
      return (
        <Svg {...common}>
          <Path d="M6 6v12" />
          <Path d="M18 6v12" />
          <Path d="M2 9v6" />
          <Path d="M22 9v6" />
          <Path d="M6 12h12" />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M3 11.5 12 4l9 7.5" />
          <Path d="M5 10v10h14V10" />
        </Svg>
      );
    case 'list':
      return (
        <Svg {...common}>
          <Path d="M8 6h13" />
          <Path d="M8 12h13" />
          <Path d="M8 18h13" />
          <Circle cx="4" cy="6" r="1" />
          <Circle cx="4" cy="12" r="1" />
          <Circle cx="4" cy="18" r="1" />
        </Svg>
      );
    case 'timer':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="13" r="8" />
          <Path d="M12 9v4l2.5 2.5" />
          <Path d="M9 2h6" />
        </Svg>
      );
    case 'chart':
      return (
        <Svg {...common}>
          <Path d="M3 3v18h18" />
          <Polyline points="7 14 11 10 14 13 20 6" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...common}>
          <Rect x="3" y="5" width="18" height="16" rx="2" />
          <Path d="M3 10h18" />
          <Path d="M8 3v4" />
          <Path d="M16 3v4" />
        </Svg>
      );
    case 'sparkles':
      return (
        <Svg {...common}>
          <Path d="M12 3v4" />
          <Path d="M12 17v4" />
          <Path d="M3 12h4" />
          <Path d="M17 12h4" />
          <Path d="M5.5 5.5 8 8" />
          <Path d="M16 16l2.5 2.5" />
          <Path d="M5.5 18.5 8 16" />
          <Path d="M16 8l2.5-2.5" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.17 16.93l.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.57 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7 4.24l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Path d="M12 5v14" />
          <Path d="M5 12h14" />
        </Svg>
      );
    case 'minus':
      return (
        <Svg {...common}>
          <Path d="M5 12h14" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common}>
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      );
    case 'play':
      return (
        <Svg {...common}>
          <Path d="M6 4l14 8-14 8V4Z" fill={color} />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...common}>
          <Rect x="6" y="5" width="4" height="14" />
          <Rect x="14" y="5" width="4" height="14" />
        </Svg>
      );
    case 'flame':
      return (
        <Svg {...common}>
          <Path d="M12 22c4-1.5 7-5 7-9 0-3-2-5-3-7-1 2-3 3-4 5-1-1-2-3-2-5-3 2-5 5-5 8 0 4 3 7.5 7 8Z" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...common}>
          <Path d="M3 6h18" />
          <Path d="M8 6V4h8v2" />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <Path d="M10 11v6" />
          <Path d="M14 11v6" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="7" />
          <Path d="m20 20-3.5-3.5" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...common}>
          <Path d="m9 6 6 6-6 6" />
        </Svg>
      );
    case 'chevronLeft':
      return (
        <Svg {...common}>
          <Path d="m15 6-6 6 6 6" />
        </Svg>
      );
    case 'arrowRight':
      return (
        <Svg {...common}>
          <Path d="M5 12h14" />
          <Path d="m13 6 6 6-6 6" />
        </Svg>
      );
    case 'arrowLeft':
      return (
        <Svg {...common}>
          <Path d="M19 12H5" />
          <Path d="m11 6-6 6 6 6" />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...common}>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Path d="M21 12H9" />
        </Svg>
      );
    case 'image':
      return (
        <Svg {...common}>
          <Rect x="3" y="3" width="18" height="18" rx="2" />
          <Circle cx="9" cy="9" r="2" />
          <Path d="m21 15-5-5L5 21" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...common}>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );
    case 'ruler':
      return (
        <Svg {...common}>
          <Path d="M3 17 17 3l4 4L7 21Z" />
          <Path d="M7 7l2 2" />
          <Path d="M10 10l2 2" />
          <Path d="M13 13l2 2" />
        </Svg>
      );
    default:
      return null;
  }
}
