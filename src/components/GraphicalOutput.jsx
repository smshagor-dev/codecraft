import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorMode,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Flex,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ButtonGroup  // ADD THIS IMPORT
} from "@chakra-ui/react";
import { 
  FaDownload, 
  FaExpand, 
  FaCompress, 
  FaImage, 
  FaCode, 
  FaChartLine, 
  FaPlay, 
  FaSync,
  FaEye,
  FaTimes,
  FaChartBar,
  FaChartArea,
  FaWaveSquare
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

// Enhanced Visualization Detector Class
class EnhancedVisualizationDetector {
  static detectVisualizationCapability(output, language, code = '') {
    if (!output || output.trim().length === 0) {
      return {
        hasVisualization: false,
        confidence: 0,
        type: 'none',
        reason: 'No output data'
      };
    }

    const analysis = {
      hasVisualization: false,
      confidence: 0,
      type: 'unknown',
      reasons: [],
      dataPoints: 0,
      patterns: [],
      suggestedChart: 'line'
    };

    // Convert to lowercase for case-insensitive matching
    const outputLower = output.toLowerCase();
    const codeLower = code.toLowerCase();

    // Data pattern detection
    const dataPatterns = [
      // Array patterns
      { pattern: /\[[\d\s\.,]+\]/g, weight: 8, type: 'numerical_array' },
      { pattern: /x\s*[:=]\s*\[/, weight: 9, type: 'x_data' },
      { pattern: /y\s*[:=]\s*\[/, weight: 9, type: 'y_data' },
      { pattern: /values?\s*[:=]\s*\[/, weight: 7, type: 'values_data' },
      { pattern: /data\s*[:=]\s*\[/, weight: 7, type: 'data_array' },
      
      // CSV-like data
      { pattern: /\d+\.?\d*\s*,\s*\d+\.?\d*/g, weight: 6, type: 'csv_data' },
      { pattern: /\d+\s+\d+/g, weight: 5, type: 'space_separated_data' },
      
      // Table data
      { pattern: /\|\s*\d+\.?\d*\s*\|/g, weight: 5, type: 'table_data' },
      
      // JSON data
      { pattern: /\{"x":\s*\d+/, weight: 8, type: 'json_coordinates' },
      { pattern: /"values":\s*\[/, weight: 7, type: 'json_values' }
    ];

    // Visualization keywords in code
    const visualizationKeywords = [
      { pattern: /\bplot\b/, weight: 6, type: 'plot_function' },
      { pattern: /\bgraph\b/, weight: 6, type: 'graph_function' },
      { pattern: /\bchart\b/, weight: 6, type: 'chart_function' },
      { pattern: /\bvisualize\b/, weight: 7, type: 'visualize_function' },
      { pattern: /\bdraw\b/, weight: 5, type: 'draw_function' },
      { pattern: /\bshow\b/, weight: 5, type: 'show_function' },
      { pattern: /\bdisplay\b/, weight: 5, type: 'display_function' },
      { pattern: /\bfigure\b/, weight: 5, type: 'figure_function' }
    ];

    // Library detection
    const libraryPatterns = [
      { pattern: /matplotlib|plt\./, weight: 9, type: 'matplotlib' },
      { pattern: /seaborn|sns\./, weight: 8, type: 'seaborn' },
      { pattern: /plotly/, weight: 8, type: 'plotly' },
      { pattern: /ggplot/, weight: 7, type: 'ggplot' },
      { pattern: /d3\./, weight: 8, type: 'd3' },
      { pattern: /chart\.js/, weight: 7, type: 'chartjs' }
    ];

    // Mathematical patterns
    const mathPatterns = [
      { pattern: /\bsin\b|\bcos\b|\btan\b/, weight: 4, type: 'trig_function' },
      { pattern: /\blog\b|\bexp\b/, weight: 4, type: 'math_function' },
      { pattern: /\bmath\./, weight: 4, type: 'math_library' },
      { pattern: /\bnumpy\b|\bnp\./, weight: 5, type: 'numpy' },
      { pattern: /\bpandas\b|\bpd\./, weight: 5, type: 'pandas' }
    ];

    // Analyze output for data patterns
    let totalWeight = 0;
    dataPatterns.forEach(({ pattern, weight, type }) => {
      const matches = output.match(pattern);
      if (matches && matches.length > 0) {
        totalWeight += weight * matches.length;
        analysis.patterns.push({ type, matches: matches.length, sample: matches[0] });
        analysis.reasons.push(`Found ${matches.length} ${type} patterns`);
      }
    });

    // Analyze code for visualization intent
    visualizationKeywords.forEach(({ pattern, weight, type }) => {
      if (pattern.test(codeLower)) {
        totalWeight += weight;
        analysis.patterns.push({ type, matches: 1, sample: 'code keyword' });
        analysis.reasons.push(`Code contains ${type}`);
      }
    });

    // Check for visualization libraries
    libraryPatterns.forEach(({ pattern, weight, type }) => {
      if (pattern.test(codeLower)) {
        totalWeight += weight * 2; // Higher weight for libraries
        analysis.patterns.push({ type, matches: 1, sample: 'library' });
        analysis.reasons.push(`Using ${type} library`);
      }
    });

    // Count numerical data points
    const numberMatches = output.match(/\d+\.?\d*/g);
    if (numberMatches) {
      analysis.dataPoints = numberMatches.length;
      if (analysis.dataPoints >= 5) {
        totalWeight += Math.min(10, analysis.dataPoints / 5);
        analysis.reasons.push(`Found ${analysis.dataPoints} numerical values`);
      }
    }

    // Language-specific boosts
    const languageBoosts = {
      'python': 5,
      'r': 5,
      'javascript': 3,
      'matlab': 4
    };
    
    totalWeight += languageBoosts[language] || 0;

    // Determine visualization type
    if (totalWeight >= 10) {
      analysis.hasVisualization = true;
      analysis.confidence = Math.min(100, totalWeight * 3);
      
      // Determine best visualization type
      if (analysis.patterns.some(p => p.type.includes('json') || p.type.includes('coordinates'))) {
        analysis.type = 'interactive_chart';
        analysis.suggestedChart = 'scatter';
      } else if (analysis.patterns.some(p => p.type.includes('array') || p.type.includes('data'))) {
        analysis.type = 'line_chart';
        analysis.suggestedChart = 'line';
      } else if (analysis.dataPoints > 20) {
        analysis.type = 'scatter_plot';
        analysis.suggestedChart = 'scatter';
      } else if (analysis.dataPoints <= 10) {
        analysis.type = 'bar_chart';
        analysis.suggestedChart = 'bar';
      } else {
        analysis.type = 'area_chart';
        analysis.suggestedChart = 'area';
      }
    } else {
      analysis.hasVisualization = false;
      analysis.confidence = Math.min(100, totalWeight * 2);
    }

    console.log('Visualization Analysis:', analysis);
    return analysis;
  }

  static generateSampleData(output, chartType = 'line') {
    // Parse numerical data from output
    const numbers = output.match(/\d+\.?\d*/g);
    
    if (!numbers || numbers.length < 3) {
      // Generate sample data based on chart type
      const dataPoints = 20;
      switch (chartType) {
        case 'bar':
          return Array.from({ length: dataPoints }, (_, i) => ({
            x: `Point ${i + 1}`,
            y: Math.floor(Math.random() * 100) + 10
          }));
        case 'scatter':
          return Array.from({ length: dataPoints }, (_, i) => ({
            x: i + Math.random() * 2,
            y: Math.sin(i * 0.5) * 30 + Math.random() * 20 + 30
          }));
        case 'area':
          return Array.from({ length: dataPoints }, (_, i) => ({
            x: i,
            y: Math.sin(i * 0.3) * 20 + Math.cos(i * 0.2) * 10 + 40
          }));
        default: // line
          return Array.from({ length: dataPoints }, (_, i) => ({
            x: i,
            y: Math.sin(i * 0.3) * 25 + Math.random() * 10 + 25
          }));
      }
    }

    // Use actual numbers from output
    return numbers.slice(0, 20).map((num, i) => ({
      x: chartType === 'bar' ? `Value ${i + 1}` : i,
      y: parseFloat(num) || Math.random() * 50 + 10
    }));
  }
}

// Main Graphical Output Component
export const GraphicalOutput = ({ output, language, isLoading, executionData, code = '' }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVisualizationPopup, setShowVisualizationPopup] = useState(false);
  const [visualizationAnalysis, setVisualizationAnalysis] = useState(null);
  const [userDismissedPopup, setUserDismissedPopup] = useState(false);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [graphQuality, setGraphQuality] = useState(2);
  const [currentChartType, setCurrentChartType] = useState('line');
  
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Analyze output for visualization capability
  useEffect(() => {
    if (output && output.trim().length > 0 && !userDismissedPopup) {
      const analysis = EnhancedVisualizationDetector.detectVisualizationCapability(output, language, code);
      setVisualizationAnalysis(analysis);
      
      // Set initial chart type based on analysis
      if (analysis.hasVisualization) {
        setCurrentChartType(analysis.suggestedChart);
      }
      
      // Show popup if visualization is possible with good confidence
      if (analysis.hasVisualization && analysis.confidence >= 40) {
        setTimeout(() => {
          setShowVisualizationPopup(true);
        }, 1500);
      }

      // Auto-generate graph if we have visualization capability
      if (analysis.hasVisualization && canvasRef.current) {
        setTimeout(() => {
          generateEnhancedGraph(analysis);
        }, 500);
      }
    }
  }, [output, language, code, userDismissedPopup]);

  // Handle visualization popup actions
  const handleViewVisualization = () => {
    setShowVisualizationPopup(false);
    if (visualizationAnalysis?.hasVisualization) {
      generateEnhancedGraph(visualizationAnalysis);
    }
  };

  const handleDismissPopup = () => {
    setShowVisualizationPopup(false);
    setUserDismissedPopup(true);
  };

  const handleDismissTemporarily = () => {
    setShowVisualizationPopup(false);
  };

  // Generate enhanced graph
  const generateEnhancedGraph = (analysis) => {
    if (!canvasRef.current) return;
    
    setIsGeneratingGraph(true);
    
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate or parse data
        const data = EnhancedVisualizationDetector.generateSampleData(output, currentChartType);
        
        console.log('🎨 Generating graph with:', {
          dataPoints: data.length,
          chartType: currentChartType,
          analysis: analysis.type
        });

        // Background with nice gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colorMode === 'dark' ? '#1a202c' : '#f7fafc');
        gradient.addColorStop(1, colorMode === 'dark' ? '#2d3748' : '#edf2f7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Chart area
        const margin = { top: 60, right: 40, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Draw chart background
        ctx.fillStyle = colorMode === 'dark' ? '#2d3748' : '#ffffff';
        ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
        ctx.strokeStyle = colorMode === 'dark' ? '#4a5568' : '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);
        
        // Draw grid
        ctx.strokeStyle = colorMode === 'dark' ? '#2d3748' : '#f1f5f9';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 8; i++) {
          const x = margin.left + (i / 8) * chartWidth;
          const y = margin.top + (i / 8) * chartHeight;
          
          // Vertical grid lines
          ctx.beginPath();
          ctx.moveTo(x, margin.top);
          ctx.lineTo(x, margin.top + chartHeight);
          ctx.stroke();
          
          // Horizontal grid lines
          ctx.beginPath();
          ctx.moveTo(margin.left, y);
          ctx.lineTo(margin.left + chartWidth, y);
          ctx.stroke();
        }
        
        // Scale data to fit chart
        const xValues = data.map(d => typeof d.x === 'string' ? data.indexOf(d) : d.x);
        const yValues = data.map(d => d.y);
        
        const scaleX = (value) => {
          if (currentChartType === 'bar') {
            const index = typeof value === 'string' ? data.findIndex(d => d.x === value) : value;
            return margin.left + (index / data.length) * chartWidth + (chartWidth / data.length) * 0.1;
          }
          return margin.left + (value / Math.max(...xValues)) * chartWidth;
        };
        
        const scaleY = (value) => {
          return margin.top + chartHeight - ((value - Math.min(...yValues)) / (Math.max(...yValues) - Math.min(...yValues))) * chartHeight;
        };
        
        // Draw chart based on type
        switch (currentChartType) {
          case 'bar':
            drawBarChart(ctx, data, scaleX, scaleY, chartWidth, data.length, margin, colorMode);
            break;
          case 'scatter':
            drawScatterChart(ctx, data, scaleX, scaleY, colorMode);
            break;
          case 'area':
            drawAreaChart(ctx, data, scaleX, scaleY, chartHeight, margin, colorMode);
            break;
          default: // line
            drawLineChart(ctx, data, scaleX, scaleY, colorMode);
            break;
        }
        
        // Draw axes
        ctx.strokeStyle = colorMode === 'dark' ? '#cbd5e0' : '#4a5568';
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.stroke();
        
        // Labels and title
        ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${language.toUpperCase()} Data Visualization - ${currentChartType.toUpperCase()} Chart`, width / 2, 15);
        
        ctx.font = '12px Arial';
        ctx.fillText('X Axis', margin.left + chartWidth / 2, margin.top + chartHeight + 20);
        
        ctx.save();
        ctx.translate(margin.left - 30, margin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Y Axis', 0, 0);
        ctx.restore();
        
        // Data info
        ctx.font = '10px Arial';
        ctx.fillStyle = colorMode === 'dark' ? '#a0aec0' : '#718096';
        ctx.textAlign = 'left';
        ctx.fillText(`Data points: ${data.length} | Chart: ${currentChartType} | Confidence: ${analysis.confidence}%`, margin.left, margin.top - 25);
        
        console.log('✅ Graph generated successfully');
        
      } catch (error) {
        console.error('❌ Error generating graph:', error);
        generateFallbackGraph();
      } finally {
        setIsGeneratingGraph(false);
      }
    }, 50);
  };

  // Chart drawing functions
  const drawLineChart = (ctx, data, scaleX, scaleY, colorMode) => {
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
      const pointY = scaleY(d.y);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    ctx.stroke();
    
    // Draw data points
    if (graphQuality >= 2) {
      ctx.fillStyle = '#3182ce';
      data.forEach((d, i) => {
        if (i % 2 === 0) {
          const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
          const pointY = scaleY(d.y);
          ctx.beginPath();
          ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  };

  const drawBarChart = (ctx, data, scaleX, scaleY, chartWidth, dataCount, margin, colorMode) => {
    const barWidth = (chartWidth / dataCount) * 0.8;
    
    data.forEach((d, i) => {
      const x = scaleX(typeof d.x === 'string' ? i : d.x);
      const y = scaleY(d.y);
      const barHeight = margin.top + chartHeight - y;
      
      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, y, 0, margin.top + chartHeight);
      gradient.addColorStop(0, '#4299e1');
      gradient.addColorStop(1, '#3182ce');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Bar border
      ctx.strokeStyle = colorMode === 'dark' ? '#2b6cb0' : '#2c5282';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
      
      // Value labels
      if (graphQuality >= 2 && dataCount <= 15) {
        ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.y.toFixed(1), x + barWidth / 2, y - 5);
      }
    });
  };

  const drawScatterChart = (ctx, data, scaleX, scaleY, colorMode) => {
    ctx.fillStyle = '#e53e3e';
    
    data.forEach((d, i) => {
      const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
      const pointY = scaleY(d.y);
      
      ctx.beginPath();
      ctx.arc(pointX, pointY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow effect for premium quality
      if (graphQuality >= 3) {
        ctx.shadowColor = '#e53e3e';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Add trend line for better quality
    if (graphQuality >= 2) {
      ctx.strokeStyle = 'rgba(66, 153, 225, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      const firstPointX = scaleX(typeof data[0].x === 'string' ? 0 : data[0].x);
      const firstPointY = scaleY(data[0].y);
      const lastPointX = scaleX(typeof data[data.length-1].x === 'string' ? data.length-1 : data[data.length-1].x);
      const lastPointY = scaleY(data[data.length-1].y);
      
      ctx.moveTo(firstPointX, firstPointY);
      ctx.lineTo(lastPointX, lastPointY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawAreaChart = (ctx, data, scaleX, scaleY, chartHeight, margin, colorMode) => {
    // Create gradient for area
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    gradient.addColorStop(0, 'rgba(72, 187, 120, 0.8)');
    gradient.addColorStop(1, 'rgba(72, 187, 120, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
      const pointY = scaleY(d.y);
      
      if (i === 0) {
        ctx.moveTo(pointX, margin.top + chartHeight);
        ctx.lineTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    
    // Close the path
    const lastPointX = scaleX(typeof data[data.length-1].x === 'string' ? data.length-1 : data[data.length-1].x);
    ctx.lineTo(lastPointX, margin.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw line on top
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
      const pointY = scaleY(d.y);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    ctx.stroke();
  };

  const generateFallbackGraph = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);
    
    // Simple fallback message
    ctx.fillStyle = colorMode === 'dark' ? '#2d3748' : '#f7fafc';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Unable to generate visualization', width / 2, height / 2);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = colorMode === 'dark' ? '#a0aec0' : '#718096';
    ctx.fillText('Check console for details', width / 2, height / 2 + 30);
  };

  const regenerateGraph = () => {
    if (visualizationAnalysis) {
      generateEnhancedGraph(visualizationAnalysis);
      
      toast({
        title: `Graph regenerated`,
        description: `Using ${currentChartType} chart type`,
        status: "info",
        duration: 1500,
        position: "top-right"
      });
    }
  };

  const changeChartType = (type) => {
    setCurrentChartType(type);
    if (visualizationAnalysis) {
      setTimeout(() => {
        generateEnhancedGraph(visualizationAnalysis);
      }, 100);
    }
  };

  const downloadImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `graph-${language}-${currentChartType}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Graph downloaded",
        description: "The graph has been saved as PNG",
        status: "success",
        duration: 2000,
        position: "top-right"
      });
    }
  };

  // Visualization Popup Component
  const VisualizationPopup = () => {
    if (!showVisualizationPopup || !visualizationAnalysis) return null;

    return (
      <Modal isOpen={showVisualizationPopup} onClose={handleDismissTemporarily} size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          border="2px solid"
          borderColor="purple.500"
          borderRadius="xl"
          boxShadow="2xl"
        >
          <ModalHeader 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            borderTopLeftRadius="xl"
            borderTopRightRadius="xl"
          >
            <HStack justify="space-between">
              <HStack spacing={3}>
                <FaChartLine size={20} />
                <Text fontSize="lg" fontWeight="bold">Data Visualization Available</Text>
              </HStack>
              <IconButton
                icon={<FaTimes />}
                onClick={handleDismissPopup}
                aria-label="Close"
                variant="ghost"
                color="white"
                _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                size="sm"
              />
            </HStack>
          </ModalHeader>

          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  We detected data in your {language} output that can be visualized.
                </AlertDescription>
              </Alert>

              <Box p={3} bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'} borderRadius="md">
                <VStack spacing={2} align="start">
                  <HStack>
                    <Badge colorScheme="green" fontSize="xs">
                      {visualizationAnalysis.confidence}% CONFIDENCE
                    </Badge>
                    <Badge colorScheme="blue" fontSize="xs">
                      {visualizationAnalysis.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" fontWeight="medium">
                    Detection Details:
                  </Text>
                  <VStack spacing={1} align="start" pl={2}>
                    {visualizationAnalysis.reasons.slice(0, 3).map((reason, index) => (
                      <Text key={index} fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        • {reason}
                      </Text>
                    ))}
                    {visualizationAnalysis.dataPoints > 0 && (
                      <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        • {visualizationAnalysis.dataPoints} data points found
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </Box>

              <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                Would you like to view an automated visualization of your data?
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}>
            <HStack spacing={3} justify="space-between" width="100%">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissPopup}
                color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
              >
                Don't Show Again
              </Button>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismissTemporarily}
                >
                  Later
                </Button>
                <Button
                  size="sm"
                  colorScheme="purple"
                  leftIcon={<FaEye />}
                  onClick={handleViewVisualization}
                >
                  View Visualization
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Chart type selector - FIXED with ButtonGroup import
  const ChartTypeSelector = () => (
    <HStack spacing={2} mb={4} p={3} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} borderRadius="md">
      <Text fontSize="sm" fontWeight="medium">Chart Type:</Text>
      <ButtonGroup size="sm" isAttached variant="outline">
        <IconButton
          icon={<FaWaveSquare />}
          onClick={() => changeChartType('line')}
          colorScheme={currentChartType === 'line' ? 'blue' : 'gray'}
          aria-label="Line Chart"
        />
        <IconButton
          icon={<FaChartBar />}
          onClick={() => changeChartType('bar')}
          colorScheme={currentChartType === 'bar' ? 'blue' : 'gray'}
          aria-label="Bar Chart"
        />
        <IconButton
          icon={<FaChartArea />}
          onClick={() => changeChartType('area')}
          colorScheme={currentChartType === 'area' ? 'blue' : 'gray'}
          aria-label="Area Chart"
        />
        <IconButton
          icon={<FaChartLine />}
          onClick={() => changeChartType('scatter')}
          colorScheme={currentChartType === 'scatter' ? 'blue' : 'gray'}
          aria-label="Scatter Plot"
        />
      </ButtonGroup>
    </HStack>
  );

  // Main graphical content
  const renderGraphicalContent = () => {
    if (!visualizationAnalysis || !output) {
      return (
        <VStack spacing={4} justify="center" h="300px" opacity={0.7}>
          <Spinner size="lg" color="purple.500" />
          <Text>Waiting for code execution...</Text>
          <Text fontSize="sm">Run your code to see graphical output</Text>
        </VStack>
      );
    }

    if (!visualizationAnalysis.hasVisualization) {
      return (
        <VStack spacing={4} justify="center" h="300px" opacity={0.7}>
          <FaChartLine size={48} />
          <Text>No visualization data detected</Text>
          <Text fontSize="sm">The output doesn't contain recognizable data patterns</Text>
          <Badge colorScheme="yellow" fontSize="xs">
            Confidence: {visualizationAnalysis.confidence}%
          </Badge>
        </VStack>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        <Box
          p={4}
          bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
          borderRadius="md"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        >
          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <Badge colorScheme="green" fontSize="sm">
                AUTO-DETECTED
              </Badge>
              <Badge colorScheme="blue" fontSize="sm">
                {language.toUpperCase()}
              </Badge>
              <Badge colorScheme="purple" fontSize="sm">
                {visualizationAnalysis.confidence}% CONFIDENCE
              </Badge>
              <Badge colorScheme="orange" fontSize="sm">
                {currentChartType.toUpperCase()}
              </Badge>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Regenerate Graph">
                <IconButton
                  size="sm"
                  icon={<FaSync />}
                  onClick={regenerateGraph}
                  aria-label="Regenerate graph"
                  colorScheme="blue"
                  isLoading={isGeneratingGraph}
                />
              </Tooltip>
              <Tooltip label="Download Graph">
                <IconButton
                  size="sm"
                  icon={<FaDownload />}
                  onClick={downloadImage}
                  aria-label="Download graph"
                  colorScheme="green"
                />
              </Tooltip>
              <Tooltip label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton
                  size="sm"
                  icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  aria-label="Toggle fullscreen"
                />
              </Tooltip>
            </HStack>
          </HStack>

          {/* Chart Type Selector - MOVED HERE */}
          <ChartTypeSelector />

          {isGeneratingGraph && (
            <Box mb={3}>
              <Progress size="sm" isIndeterminate colorScheme="purple" />
              <Text fontSize="xs" textAlign="center" mt={1}>
                Generating {currentChartType} visualization from {language} output...
              </Text>
            </Box>
          )}

          <Box
            as="canvas"
            ref={canvasRef}
            width="100%"
            height="400px"
            bg={colorMode === 'dark' ? 'gray.900' : 'white'}
            borderRadius="md"
            border="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
          />
        </Box>

        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            <strong>Graphical output auto-generated!</strong> The system detected {language} data patterns and created a {currentChartType} visualization. 
            {visualizationAnalysis.reasons.length > 0 && ` ${visualizationAnalysis.reasons.length} patterns detected.`}
          </AlertDescription>
        </Alert>
      </VStack>
    );
  };

  return (
    <>
      {/* Visualization Popup */}
      <VisualizationPopup />

      {/* Main Graphical Output Component */}
      <Box
        h="100%"
        bg={colorMode === 'dark' ? 'gray.900' : 'white'}
        borderRadius="md"
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        overflow="hidden"
      >
        <Tabs colorScheme="purple" h="100%">
          <TabList px={4} borderBottom="1px solid" borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}>
            <Tab>
              <HStack spacing={2}>
                <FaChartLine />
                <Text>Graphical View</Text>
                {visualizationAnalysis?.hasVisualization && (
                  <Badge colorScheme="green" fontSize="xs" borderRadius="full">
                    ✓
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaCode />
                <Text>Raw Output</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels h="calc(100% - 48px)" overflow="auto">
            <TabPanel p={4}>
              {renderGraphicalContent()}
            </TabPanel>
            
            <TabPanel p={4}>
              <Box
                p={4}
                bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
                maxH="400px"
                overflowY="auto"
              >
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {output || 'No output data available'}
                </pre>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Visualization Status Indicator */}
      {visualizationAnalysis && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          p={3}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="md"
          border="1px solid"
          borderColor={visualizationAnalysis.hasVisualization ? 'green.500' : 'gray.300'}
          boxShadow="lg"
          zIndex={1000}
          maxW="300px"
        >
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="full"
              bg={visualizationAnalysis.hasVisualization ? 'green.500' : 'gray.500'}
              color="white"
            >
              <FaChartLine size={14} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="bold">
                {visualizationAnalysis.hasVisualization ? 'Data Visualizable' : 'No Visual Data'}
              </Text>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                {visualizationAnalysis.hasVisualization 
                  ? `${visualizationAnalysis.confidence}% confidence` 
                  : 'Limited visualization options'
                }
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </>
  );
};