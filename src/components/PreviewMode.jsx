import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  HStack,
  VStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorMode,
  Tooltip,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Select,
  ButtonGroup
} from '@chakra-ui/react';
import {
  FaExpand,
  FaCompress,
  FaDesktop,
  FaExternalLinkAlt,
  FaDownload,
  FaBug,
  FaGlobe,
  FaCode,
  FaPlay
} from 'react-icons/fa';
import { 
  IoMdRefresh,
  IoMdArrowBack,
  IoMdArrowForward
} from 'react-icons/io';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Device presets for responsive testing
const DEVICE_PRESETS = {
  desktop: { width: '100%', height: '100%', name: 'Desktop' },
  laptop: { width: '1024px', height: '768px', name: 'Laptop' },
  tablet: { width: '768px', height: '1024px', name: 'iPad' },
  mobile: { width: '375px', height: '667px', name: 'iPhone SE' },
  iphone12: { width: '390px', height: '844px', name: 'iPhone 12' },
  pixel: { width: '393px', height: '851px', name: 'Pixel 5' },
  galaxyS20: { width: '360px', height: '800px', name: 'Galaxy S20' }
};

export const PreviewMode = ({ fileSystem, isFullscreen, onToggleFullscreen, onToggleConsole }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [viewMode] = useState('preview'); // 'preview' | 'code' | 'split'
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [bundledCode, setBundledCode] = useState('');
  const [previewMode] = useState('devtools'); // 'devtools' | 'localhost'
  const [localhostPort, setLocalhostPort] = useState('3000');

  // Find HTML, CSS, and JS files in the file system
  const findFiles = useMemo(() => {
    if (!fileSystem || !fileSystem.root) return { html: null, css: [], js: [] };
    
    const files = { html: null, css: [], js: [] };
    
    const traverse = (node) => {
      if (node.type === 'file') {
        const ext = node.name.split('.').pop().toLowerCase();
        if (ext === 'html' && !files.html) {
          files.html = node;
        } else if (ext === 'css') {
          files.css.push(node);
        } else if (ext === 'js' || ext === 'jsx') {
          files.js.push(node);
        }
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    fileSystem.root.children.forEach(traverse);
    return files;
  }, [fileSystem]);

  // Bundle HTML, CSS, and JavaScript
  const createBundle = () => {
    const { html, css, js } = findFiles;
    
    // Start with basic HTML template
    let htmlContent = html?.content || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
</head>
<body>
    <div id="root"></div>
    <h1>Welcome to Live Preview</h1>
    <p>Create an index.html file to start building your app!</p>
</body>
</html>`;

    // Inject CSS
    if (css.length > 0) {
      const cssContent = css.map(file => file.content || '').join('\n');
      const styleTag = `<style>${cssContent}</style>`;
      htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
    }

    // Inject JavaScript
    if (js.length > 0) {
      const jsContent = js.map(file => {
        let content = file.content || '';
        // Wrap in try-catch for error handling
        return `
try {
  ${content}
} catch (error) {
  console.error('Error in ${file.name}:', error);
  parent.postMessage({ type: 'error', message: error.toString(), file: '${file.name}' }, '*');
}`;
      }).join('\n');

      // Add console override to capture logs
      const consoleOverride = `
<script>
  (function() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    ['log', 'error', 'warn', 'info'].forEach(method => {
      console[method] = function(...args) {
        originalConsole[method].apply(console, args);
        parent.postMessage({
          type: 'console',
          method: method,
          args: args.map(arg => {
            try {
              return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
              return String(arg);
            }
          })
        }, '*');
      };
    });
    
    window.addEventListener('error', (e) => {
      parent.postMessage({
        type: 'error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      }, '*');
    });
  })();
</script>`;

      const scriptTag = `${consoleOverride}\n<script>${jsContent}</script>`;
      htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
    }

    setBundledCode(htmlContent);
    return htmlContent;
  };

  // Update iframe content
  const updatePreview = () => {
    setIsLoading(true);
    setError(null);
    setConsoleOutput([]);
    
    if (previewMode === 'localhost') {
      // For localhost mode, just set the URL
      const localhostUrl = `http://localhost:${localhostPort}`;
      setUrl(localhostUrl);
      
      // Force iframe refresh by changing key
      setIframeKey(prev => prev + 1);
      
      // Check if localhost is accessible
      fetch(localhostUrl)
        .then(() => {
          setIsLoading(false);
          setError(null);
        })
        .catch(() => {
          setError(`Cannot connect to localhost:${localhostPort}. Make sure your server is running.`);
          setIsLoading(false);
        });
    } else {
      // Developer tools mode - use blob URL
      try {
        const bundle = createBundle();
        const blob = new Blob([bundle], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
        
        // Force iframe refresh by changing key
        setIframeKey(prev => prev + 1);
        
        setTimeout(() => setIsLoading(false), 500);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'console') {
        setConsoleOutput(prev => [...prev, {
          method: event.data.method,
          args: event.data.args,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else if (event.data.type === 'error') {
        setError(`Error in ${event.data.file || 'preview'}: ${event.data.message}`);
        setConsoleOutput(prev => [...prev, {
          method: 'error',
          args: [event.data.message],
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-update preview when files change
  useEffect(() => {
    updatePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem]);

  const handleRefresh = () => {
    updatePreview();
    toast({
      title: "Preview refreshed",
      status: "success",
      duration: 1000,
      position: "top-right"
    });
  };

  const handleOpenInNewTab = () => {
    const bundle = createBundle();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(bundle);
    newWindow.document.close();
  };

  const handleDownloadHTML = () => {
    const bundle = createBundle();
    const blob = new Blob([bundle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConsoleIcon = (method) => {
    const icons = {
      error: { icon: '❌', color: 'red.500' },
      warn: { icon: '⚠️', color: 'yellow.500' },
      info: { icon: 'ℹ️', color: 'blue.500' },
      log: { icon: '📝', color: 'gray.500' }
    };
    return icons[method] || icons.log;
  };

  const devicePreset = DEVICE_PRESETS[activeDevice];

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      h="100%"
      display="flex"
      flexDirection="column"
      bg={colorMode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.95)'}
      borderLeft="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      position={isFullscreen ? "fixed" : "relative"}
      top={isFullscreen ? 0 : "auto"}
      left={isFullscreen ? 0 : "auto"}
      right={isFullscreen ? 0 : "auto"}
      bottom={isFullscreen ? 0 : "auto"}
      zIndex={isFullscreen ? 1000 : 1}
    >
      {/* Browser Header */}
      <VStack spacing={0} borderBottom="1px solid" 
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      >
        {/* URL Bar */}
        <HStack w="100%" px={4} py={2} spacing={2}
          bg={colorMode === 'dark' ? 'rgba(10, 14, 39, 0.5)' : 'rgba(248, 250, 252, 0.9)'}
        >
          <ButtonGroup size="sm" variant="ghost">
            <IconButton icon={<IoMdArrowBack />} aria-label="Back" isDisabled />
            <IconButton icon={<IoMdArrowForward />} aria-label="Forward" isDisabled />
            <IconButton icon={<IoMdRefresh />} aria-label="Refresh" onClick={handleRefresh} />
          </ButtonGroup>
          
          <InputGroup size="sm" flex={1}>
            <InputLeftElement>
              {previewMode === 'localhost' ? <FaGlobe color="green" /> : <FaBug color="purple" />}
            </InputLeftElement>
            <Input
              value={previewMode === 'localhost' ? `localhost:${localhostPort}` : 'devtools://preview'}
              isReadOnly
              bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}
              borderRadius="full"
              fontSize="sm"
            />
          </InputGroup>
          
          <ButtonGroup size="sm" variant="ghost">
            <Tooltip label="Open in new tab">
              <IconButton icon={<FaExternalLinkAlt />} onClick={handleOpenInNewTab} aria-label="Open in new tab" />
            </Tooltip>
            <Tooltip label="Download HTML">
              <IconButton icon={<FaDownload />} onClick={handleDownloadHTML} aria-label="Download" />
            </Tooltip>
            <Tooltip label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton 
                icon={isFullscreen ? <FaCompress /> : <FaExpand />} 
                onClick={onToggleFullscreen}
                aria-label="Toggle fullscreen"
              />
            </Tooltip>
          </ButtonGroup>
        </HStack>

        {/* Toolbar */}
        <HStack w="100%" px={4} py={2} justify="space-between"
          bg={colorMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(250, 250, 250, 0.9)'}
        >
          <HStack spacing={3}>
            {/* Device Selection */}
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium">Device:</Text>
              <Select size="sm" value={activeDevice} onChange={(e) => setActiveDevice(e.target.value)} w="150px">
                {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </Select>
              {activeDevice !== 'desktop' && (
                <Badge colorScheme="purple" variant="subtle">
                  {devicePreset.width} × {devicePreset.height}
                </Badge>
              )}
            </HStack>
          </HStack>

          <HStack spacing={2}>
            {/* Console/Preview Toggle */}
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                leftIcon={<FaCode />}
                onClick={onToggleConsole}
                colorScheme="gray"
              >
                Console
              </Button>
              <Button
                leftIcon={<FaDesktop />}
                colorScheme="purple"
                isDisabled
              >
                Preview
              </Button>
            </ButtonGroup>
            
            {/* Run Code Button */}
            <Button
              size="sm"
              leftIcon={<FaPlay />}
              variant="gradient"
              onClick={() => updatePreview()}
              title="Refresh Preview"
              boxShadow="0 4px 15px rgba(168, 85, 247, 0.3)"
              _hover={{
                boxShadow: "0 6px 20px rgba(168, 85, 247, 0.4)"
              }}
            >
              Run Code
            </Button>
            
            {/* Port input for localhost mode */}
            {previewMode === 'localhost' && (
              <InputGroup size="sm" w="120px">
                <InputLeftElement 
                  pointerEvents="none" 
                  color="gray.400" 
                  fontSize="xs"
                >
                  :
                </InputLeftElement>
                <Input
                  placeholder="3000"
                  value={localhostPort}
                  onChange={(e) => setLocalhostPort(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updatePreview();
                    }
                  }}
                  type="number"
                  pl="20px"
                  size="sm"
                />
              </InputGroup>
            )}
          </HStack>
        </HStack>
      </VStack>

      {/* Main Content Area */}
      <Box flex={1} overflow="hidden" position="relative">
        {isLoading && (
          <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={10}>
            <VStack>
              <Spinner size="xl" color="purple.500" />
              <Text>Loading preview...</Text>
            </VStack>
          </Box>
        )}

        {error && (
          <Alert status="error" position="absolute" top={0} left={0} right={0} zIndex={10}>
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {viewMode === 'preview' && (
          <Box
            w="100%"
            h="100%"
            display="flex"
            justifyContent="center"
            alignItems={activeDevice !== 'desktop' ? 'center' : 'stretch'}
            bg={colorMode === 'dark' ? '#1a202c' : '#f7fafc'}
            p={activeDevice !== 'desktop' ? 4 : 0}
          >
            <Box
              w={devicePreset.width}
              h={devicePreset.height}
              maxW="100%"
              maxH="100%"
              bg="white"
              borderRadius={activeDevice !== 'desktop' ? 'lg' : 0}
              overflow="hidden"
              boxShadow={activeDevice !== 'desktop' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'}
              border={activeDevice !== 'desktop' ? '1px solid' : 'none'}
              borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
            >
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'white'
                }}
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                title="Preview"
                onLoad={() => setIsLoading(false)}
              />
            </Box>
          </Box>
        )}

        {viewMode === 'code' && (
          <Box h="100%" overflow="auto" p={4}>
            <Box
              as="pre"
              p={4}
              bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
              borderRadius="md"
              fontSize="sm"
              fontFamily="mono"
              whiteSpace="pre-wrap"
              wordBreak="break-word"
            >
              <code>{bundledCode}</code>
            </Box>
          </Box>
        )}

        {viewMode === 'console' && (
          <Box h="100%" overflow="auto" p={4} bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}>
            {consoleOutput.length === 0 ? (
              <VStack justify="center" h="100%" opacity={0.5}>
                <FaBug size={48} />
                <Text>Console is empty</Text>
                <Text fontSize="sm">Logs will appear here when code runs</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={2}>
                {consoleOutput.map((log, index) => {
                  const { icon, color } = getConsoleIcon(log.method);
                  return (
                    <HStack
                      key={index}
                      p={2}
                      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                      borderRadius="md"
                      borderLeft="3px solid"
                      borderColor={color}
                      spacing={3}
                    >
                      <Text fontSize="lg">{icon}</Text>
                      <VStack align="start" flex={1} spacing={0}>
                        <Text fontSize="sm" fontFamily="mono">
                          {log.args.join(' ')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {log.timestamp}
                        </Text>
                      </VStack>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </Box>
        )}
      </Box>
    </MotionBox>
  );
};