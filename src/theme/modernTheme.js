import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false
};

export const modernTheme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' 
          ? 'linear-gradient(135deg, #0a0e27 0%, #0f172a 50%, #1a1f3a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #e9ecef 100%)',
        minHeight: '100vh',
      },
      "*::selection": {
        bg: props.colorMode === 'dark' ? "purple.600" : "purple.200",
        color: props.colorMode === 'dark' ? "white" : "gray.900"
      },
      "::-webkit-scrollbar": {
        width: "8px",
        height: "8px"
      },
      "::-webkit-scrollbar-track": {
        bg: props.colorMode === 'dark' ? "gray.900" : "gray.100"
      },
      "::-webkit-scrollbar-thumb": {
        bg: props.colorMode === 'dark' ? "purple.600" : "purple.400",
        borderRadius: "full"
      },
      "::-webkit-scrollbar-thumb:hover": {
        bg: props.colorMode === 'dark' ? "purple.500" : "purple.500"
      }
    })
  },
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#cbb2ff',
      200: '#a480ff',
      300: '#7c4dff',
      400: '#651fff',
      500: '#5e00ff',
      600: '#5300e8',
      700: '#4600d0',
      800: '#3800b8',
      900: '#2a00a0'
    },
    neon: {
      blue: '#00d9ff',
      purple: '#a855f7',
      pink: '#ec4899',
      green: '#10b981',
      yellow: '#fbbf24',
      orange: '#fb923c'
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.3)'
    }
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace'
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "lg",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "lg"
        },
        _active: {
          transform: "translateY(0)",
        }
      },
      variants: {
        gradient: (props) => ({
          bg: `linear-gradient(135deg, ${props.colorMode === 'dark' ? '#a855f7' : '#8b5cf6'} 0%, ${props.colorMode === 'dark' ? '#ec4899' : '#d946ef'} 100%)`,
          color: "white",
          _hover: {
            bg: `linear-gradient(135deg, ${props.colorMode === 'dark' ? '#9333ea' : '#7c3aed'} 0%, ${props.colorMode === 'dark' ? '#db2777' : '#c026d3'} 100%)`,
            boxShadow: "0 10px 40px rgba(168, 85, 247, 0.4)"
          },
          _active: {
            bg: `linear-gradient(135deg, ${props.colorMode === 'dark' ? '#7e22ce' : '#6d28d9'} 0%, ${props.colorMode === 'dark' ? '#be185d' : '#a21caf'} 100%)`,
          }
        }),
        glass: (props) => ({
          bg: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          overflow: "hidden",
          position: "relative",
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
            transform: "translateY(0)",
            boxShadow: "none"
          },
          _active: {
            transform: "scale(0.98)"
          }
        }),
        neon: (props) => ({
          bg: "transparent",
          color: props.colorMode === 'dark' ? '#00d9ff' : '#0891b2',
          border: "2px solid",
          borderColor: props.colorMode === 'dark' ? '#00d9ff' : '#0891b2',
          _hover: {
            bg: props.colorMode === 'dark' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(8, 145, 178, 0.1)',
            boxShadow: props.colorMode === 'dark' ? '0 0 20px rgba(0, 217, 255, 0.5)' : '0 0 20px rgba(8, 145, 178, 0.3)',
          }
        })
      }
    },
    Box: {
      variants: {
        glass: (props) => ({
          bg: props.colorMode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid",
          borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          boxShadow: props.colorMode === 'dark' 
            ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
        })
      }
    }
  }
});