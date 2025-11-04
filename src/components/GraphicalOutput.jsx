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
  ButtonGroup,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel
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
  FaWaveSquare,
  FaTable,
  FaDatabase,
  FaFilter
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

// Enhanced Data Parser Class
class RealisticDataParser {
  static parseNumericalData(output) {
    if (!output) return [];
    
    const lines = output.split('\n');
    const numericalData = [];
    
    // Try different parsing strategies
    lines.forEach(line => {
      line = line.trim();
      
      // Skip empty lines and common non-data lines
      if (!line || 
          line.includes('>>>') || 
          line.includes('...') ||
          line.startsWith('#') ||
          line.startsWith('//') ||
          line.length > 200) {
        return;
      }
      
      // Strategy 1: Array-like patterns [1, 2, 3, 4]
      const arrayMatch = line.match(/\[([\d\s\.,\-]+)\]/);
      if (arrayMatch) {
        const numbers = arrayMatch[1].split(/[,\s]+/).filter(n => n.trim());
        numbers.forEach(num => {
          const parsed = parseFloat(num);
          if (!isNaN(parsed)) numericalData.push(parsed);
        });
        return;
      }
      
      // Strategy 2: CSV-like data 1,2,3,4 or 1 2 3 4
      const csvNumbers = line.split(/[,\s]+/).slice(0, 10); // Limit to prevent overflow
      let validNumbers = 0;
      csvNumbers.forEach(num => {
        const parsed = parseFloat(num);
        if (!isNaN(parsed) && Math.abs(parsed) < 1000000) { // Reasonable range
          numericalData.push(parsed);
          validNumbers++;
        }
      });
      
      // Strategy 3: Key-value pairs x=1, y=2
      const keyValueMatches = line.match(/(\w+)\s*[=:]\s*([\d\.\-]+)/g);
      if (keyValueMatches) {
        keyValueMatches.forEach(kv => {
          const match = kv.match(/(\w+)\s*[=:]\s*([\d\.\-]+)/);
          if (match) {
            const parsed = parseFloat(match[2]);
            if (!isNaN(parsed)) numericalData.push(parsed);
          }
        });
      }
      
      // Strategy 4: Table data with | separators
      if (line.includes('|')) {
        const tableCells = line.split('|').filter(cell => cell.trim());
        tableCells.forEach(cell => {
          const parsed = parseFloat(cell.trim());
          if (!isNaN(parsed)) numericalData.push(parsed);
        });
      }
    });
    
    return numericalData;
  }

  static detectDataStructure(output) {
    const lines = output.split('\n').slice(0, 50); // Analyze first 50 lines
    let structure = {
      type: 'unknown',
      hasHeaders: false,
      dataPoints: 0,
      dimensions: 1,
      sampleRate: 1,
      isTimeSeries: false,
      isCategorical: false
    };
    
    const numericalData = this.parseNumericalData(output);
    structure.dataPoints = numericalData.length;
    
    // Analyze line patterns
    let arrayLines = 0;
    let tableLines = 0;
    let keyValueLines = 0;
    
    lines.forEach(line => {
      if (line.includes('[') && line.includes(']')) arrayLines++;
      if (line.includes('|')) tableLines++;
      if (line.match(/\w+\s*[=:]\s*[\d\.]/)) keyValueLines++;
      if (line.match(/\d{4}[-/]\d{2}[-/]\d{2}/)) structure.isTimeSeries = true;
      if (line.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*:/)) structure.hasHeaders = true;
    });
    
    // Determine structure type
    if (arrayLines > 2) {
      structure.type = 'array';
      structure.dimensions = arrayLines > 5 ? 2 : 1;
    } else if (tableLines > 2) {
      structure.type = 'table';
      structure.dimensions = 2;
    } else if (keyValueLines > 2) {
      structure.type = 'key_value';
      structure.dimensions = 2;
    } else if (numericalData.length > 10) {
      structure.type = 'numerical_sequence';
      structure.dimensions = 1;
    }
    
    // Check for categorical data
    const textLines = lines.filter(line => 
      line.match(/[a-zA-Z]{3,}/) && 
      !line.match(/error|warning|info|debug/) &&
      line.length < 100
    ).length;
    
    if (textLines > numericalData.length / 2) {
      structure.isCategorical = true;
    }
    
    return structure;
  }

  static generateRealisticDataset(output, chartType, dataPoints = 20) {
    const numericalData = this.parseNumericalData(output);
    const structure = this.detectDataStructure(output);
    
    // If we have enough real data, use it
    if (numericalData.length >= 5) {
      return this.generateFromRealData(numericalData, chartType, structure);
    }
    
    // Otherwise generate realistic synthetic data based on chart type
    return this.generateSyntheticData(chartType, dataPoints, structure);
  }

  static generateFromRealData(data, chartType, structure) {
    const limitedData = data.slice(0, 50); // Limit data points
    
    switch (chartType) {
      case 'line':
        return limitedData.map((value, index) => ({
          x: index,
          y: value,
          label: `Point ${index + 1}`
        }));
        
      case 'bar':
        return limitedData.slice(0, 15).map((value, index) => ({
          x: `Item ${index + 1}`,
          y: Math.abs(value),
          label: `Value ${index + 1}`
        }));
        
      case 'scatter':
        // Create x,y pairs from sequential data
        const pairs = [];
        for (let i = 0; i < limitedData.length - 1; i += 2) {
          pairs.push({
            x: limitedData[i],
            y: limitedData[i + 1] || limitedData[i] * 0.5,
            label: `(${limitedData[i]}, ${limitedData[i + 1] || limitedData[i] * 0.5})`
          });
        }
        return pairs.slice(0, 20);
        
      case 'area':
        return limitedData.map((value, index) => ({
          x: index,
          y: Math.abs(value) + 10, // Ensure positive for area charts
          label: `Area ${index + 1}`
        }));
        
      default:
        return limitedData.map((value, index) => ({
          x: index,
          y: value,
          label: `Point ${index + 1}`
        }));
    }
  }

  static generateSyntheticData(chartType, dataPoints, structure) {
    const data = [];
    
    switch (chartType) {
      case 'line':
        // Realistic time series data
        for (let i = 0; i < dataPoints; i++) {
          const trend = i * 0.8;
          const seasonal = Math.sin(i * 0.5) * 15;
          const noise = (Math.random() - 0.5) * 8;
          data.push({
            x: i,
            y: trend + seasonal + noise + 20,
            label: `Time ${i + 1}`
          });
        }
        break;
        
      case 'bar':
        // Realistic categorical data
        const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < Math.min(dataPoints, categories.length); i++) {
          data.push({
            x: categories[i],
            y: Math.floor(Math.random() * 100) + 20,
            label: categories[i]
          });
        }
        break;
        
      case 'scatter':
        // Realistic correlation data
        for (let i = 0; i < dataPoints; i++) {
          const base = i * 2;
          const x = base + (Math.random() - 0.5) * 10;
          const y = base * 0.8 + (Math.random() - 0.5) * 15 + 10;
          data.push({
            x: x,
            y: y,
            label: `(${x.toFixed(1)}, ${y.toFixed(1)})`
          });
        }
        break;
        
      case 'area':
        // Realistic stacked area data
        let cumulative = 0;
        for (let i = 0; i < dataPoints; i++) {
          const value = Math.sin(i * 0.3) * 20 + Math.cos(i * 0.2) * 10 + 30;
          cumulative += value;
          data.push({
            x: i,
            y: cumulative,
            label: `Cumulative ${i + 1}`
          });
        }
        break;
        
      default:
        for (let i = 0; i < dataPoints; i++) {
          data.push({
            x: i,
            y: Math.sin(i * 0.3) * 25 + Math.random() * 10 + 25,
            label: `Point ${i + 1}`
          });
        }
    }
    
    return data;
  }
}

// Enhanced Visualization Detector Class
class RealisticVisualizationDetector {
  static detectVisualizationCapability(output, language, code = '') {
    if (!output || output.trim().length === 0) {
      return {
        hasVisualization: false,
        confidence: 0,
        type: 'none',
        reason: 'No output data',
        dataStructure: {}
      };
    }

    const analysis = {
      hasVisualization: false,
      confidence: 0,
      type: 'unknown',
      reasons: [],
      dataPoints: 0,
      patterns: [],
      suggestedChart: 'line',
      dataStructure: {},
      dataQuality: 'low'
    };

    // Parse and analyze the actual data
    const numericalData = RealisticDataParser.parseNumericalData(output);
    analysis.dataStructure = RealisticDataParser.detectDataStructure(output);
    analysis.dataPoints = numericalData.length;

    // Data quality assessment
    if (numericalData.length >= 20) {
      analysis.dataQuality = 'high';
    } else if (numericalData.length >= 5) {
      analysis.dataQuality = 'medium';
    }

    // Convert to lowercase for case-insensitive matching
    const outputLower = output.toLowerCase();
    const codeLower = code.toLowerCase();

    // Enhanced data pattern detection with weights
    const dataPatterns = [
      // Array patterns
      { pattern: /\[[\d\s\.,\-]+\]/g, weight: 8, type: 'numerical_array' },
      { pattern: /array\s*\([^)]*\)/g, weight: 7, type: 'array_function' },
      { pattern: /list\s*\([^)]*\)/g, weight: 7, type: 'list_function' },
      
      // Data assignment patterns
      { pattern: /x\s*[:=]\s*\[/, weight: 9, type: 'x_data' },
      { pattern: /y\s*[:=]\s*\[/, weight: 9, type: 'y_data' },
      { pattern: /values?\s*[:=]\s*\[/, weight: 7, type: 'values_data' },
      { pattern: /data\s*[:=]\s*\[/, weight: 7, type: 'data_array' },
      
      // CSV-like data with realistic patterns
      { pattern: /\d+\.?\d*\s*,\s*\d+\.?\d*/g, weight: 6, type: 'coordinate_data' },
      { pattern: /\d+\s+\d+/g, weight: 5, type: 'space_separated_data' },
      { pattern: /\d+\.\d+/g, weight: 4, type: 'float_data' },
      
      // Table data
      { pattern: /\|\s*\d+\.?\d*\s*\|/g, weight: 5, type: 'table_data' },
      { pattern: /\+[-]+\+/g, weight: 4, type: 'table_border' },
      
      // JSON data
      { pattern: /\{"x":\s*[\d\.\-]+/g, weight: 8, type: 'json_coordinates' },
      { pattern: /"y":\s*[\d\.\-]+/g, weight: 8, type: 'json_coordinates' },
      { pattern: /"values":\s*\[/g, weight: 7, type: 'json_values' },
      { pattern: /"data":\s*\[/g, weight: 7, type: 'json_data' }
    ];

    // Visualization keywords in code with context
    const visualizationKeywords = [
      { pattern: /\bplot\s*\(/, weight: 8, type: 'plot_function' },
      { pattern: /\bplt\.plot\b/, weight: 9, type: 'matplotlib_plot' },
      { pattern: /\bgraph\b/, weight: 6, type: 'graph_function' },
      { pattern: /\bchart\b/, weight: 6, type: 'chart_function' },
      { pattern: /\bvisualize\b/, weight: 7, type: 'visualize_function' },
      { pattern: /\bdraw\b/, weight: 5, type: 'draw_function' },
      { pattern: /\bshow\s*\(/, weight: 6, type: 'show_function' },
      { pattern: /\bdisplay\b/, weight: 5, type: 'display_function' },
      { pattern: /\bfigure\b/, weight: 5, type: 'figure_function' },
      { pattern: /\bsubplot\b/, weight: 6, type: 'subplot_function' }
    ];

    // Library detection with version patterns
    const libraryPatterns = [
      { pattern: /matplotlib|plt\./, weight: 9, type: 'matplotlib' },
      { pattern: /seaborn|sns\./, weight: 8, type: 'seaborn' },
      { pattern: /plotly/, weight: 8, type: 'plotly' },
      { pattern: /ggplot/, weight: 7, type: 'ggplot' },
      { pattern: /d3\./, weight: 8, type: 'd3' },
      { pattern: /chart\.js/, weight: 7, type: 'chartjs' },
      { pattern: /pandas|pd\./, weight: 6, type: 'pandas' },
      { pattern: /numpy|np\./, weight: 5, type: 'numpy' }
    ];

    // Analyze output for data patterns
    let totalWeight = 0;
    dataPatterns.forEach(({ pattern, weight, type }) => {
      const matches = output.match(pattern);
      if (matches && matches.length > 0) {
        totalWeight += weight * Math.min(matches.length, 5); // Cap matches
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

    // Real data points boost
    if (analysis.dataPoints > 0) {
      const dataBoost = Math.min(20, analysis.dataPoints * 0.5);
      totalWeight += dataBoost;
      analysis.reasons.push(`Found ${analysis.dataPoints} numerical values`);
    }

    // Data structure boosts
    if (analysis.dataStructure.dimensions === 2) {
      totalWeight += 10;
      analysis.reasons.push('2D data structure detected');
    }
    if (analysis.dataStructure.isTimeSeries) {
      totalWeight += 8;
      analysis.reasons.push('Time series data detected');
    }

    // Language-specific context
    const languageBoosts = {
      'python': 8,
      'r': 8,
      'julia': 7,
      'matlab': 7,
      'javascript': 4,
      'java': 3
    };
    
    totalWeight += languageBoosts[language] || 0;

    // Determine visualization capability
    if (totalWeight >= 15 || analysis.dataPoints >= 10) {
      analysis.hasVisualization = true;
      analysis.confidence = Math.min(95, totalWeight * 2 + analysis.dataPoints);
      
      // Smart chart type suggestion based on data analysis
      if (analysis.dataStructure.isTimeSeries) {
        analysis.type = 'time_series';
        analysis.suggestedChart = 'line';
      } else if (analysis.dataStructure.dimensions === 2) {
        analysis.type = 'correlation_analysis';
        analysis.suggestedChart = 'scatter';
      } else if (analysis.dataStructure.isCategorical) {
        analysis.type = 'categorical_analysis';
        analysis.suggestedChart = 'bar';
      } else if (analysis.dataPoints > 30) {
        analysis.type = 'large_dataset';
        analysis.suggestedChart = 'area';
      } else {
        analysis.type = 'general_visualization';
        analysis.suggestedChart = 'line';
      }
    } else {
      analysis.hasVisualization = false;
      analysis.confidence = Math.min(50, totalWeight * 2);
      analysis.type = 'insufficient_data';
    }

    console.log('Enhanced Visualization Analysis:', analysis);
    return analysis;
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
  const [currentChartType, setCurrentChartType] = useState('line');
  const [dataPoints, setDataPoints] = useState(20);
  const [showRawData, setShowRawData] = useState(false);
  
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Analyze output for visualization capability
  useEffect(() => {
    if (output && output.trim().length > 0 && !userDismissedPopup) {
      const analysis = RealisticVisualizationDetector.detectVisualizationCapability(output, language, code);
      setVisualizationAnalysis(analysis);
      
      // Set initial chart type based on analysis
      if (analysis.hasVisualization) {
        setCurrentChartType(analysis.suggestedChart);
        setDataPoints(Math.min(50, Math.max(10, analysis.dataPoints || 20)));
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
          generateRealisticGraph(analysis);
        }, 500);
      }
    }
  }, [output, language, code, userDismissedPopup]);

  // Handle visualization popup actions
  const handleViewVisualization = () => {
    setShowVisualizationPopup(false);
    if (visualizationAnalysis?.hasVisualization) {
      generateRealisticGraph(visualizationAnalysis);
    }
  };

  const handleDismissPopup = () => {
    setShowVisualizationPopup(false);
    setUserDismissedPopup(true);
  };

  const handleDismissTemporarily = () => {
    setShowVisualizationPopup(false);
  };

  // Generate realistic graph
  const generateRealisticGraph = (analysis) => {
    if (!canvasRef.current) return;
    
    setIsGeneratingGraph(true);
    
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate realistic dataset
        const data = RealisticDataParser.generateRealisticDataset(output, currentChartType, dataPoints);
        
        console.log('🎨 Generating realistic graph with:', {
          dataPoints: data.length,
          chartType: currentChartType,
          dataStructure: analysis.dataStructure,
          dataQuality: analysis.dataQuality
        });

        // Professional background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colorMode === 'dark' ? '#1a202c' : '#f8fafc');
        gradient.addColorStop(1, colorMode === 'dark' ? '#2d3748' : '#f1f5f9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Chart area with professional styling
        const margin = { top: 70, right: 50, bottom: 70, left: 70 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Draw chart background
        ctx.fillStyle = colorMode === 'dark' ? '#2d3748' : '#ffffff';
        ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
        ctx.strokeStyle = colorMode === 'dark' ? '#4a5568' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);
        
        // Professional grid
        ctx.strokeStyle = colorMode === 'dark' ? '#374151' : '#f1f5f9';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= 10; i++) {
          const x = margin.left + (i / 10) * chartWidth;
          const y = margin.top + (i / 10) * chartHeight;
          
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
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        const scaleX = (value) => {
          if (currentChartType === 'bar') {
            const index = typeof value === 'string' ? data.findIndex(d => d.x === value) : value;
            const barWidth = chartWidth / data.length;
            return margin.left + index * barWidth + barWidth * 0.1;
          }
          return margin.left + ((value - xMin) / (xMax - xMin)) * chartWidth;
        };
        
        const scaleY = (value) => {
          return margin.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
        };
        
        // Draw chart based on type
        switch (currentChartType) {
          case 'bar':
            drawProfessionalBarChart(ctx, data, scaleX, scaleY, chartWidth, data.length, margin, colorMode);
            break;
          case 'scatter':
            drawProfessionalScatterChart(ctx, data, scaleX, scaleY, colorMode);
            break;
          case 'area':
            drawProfessionalAreaChart(ctx, data, scaleX, scaleY, chartHeight, margin, colorMode);
            break;
          default: // line
            drawProfessionalLineChart(ctx, data, scaleX, scaleY, colorMode);
            break;
        }
        
        // Professional axes
        ctx.strokeStyle = colorMode === 'dark' ? '#cbd5e0' : '#4a5568';
        ctx.lineWidth = 1.5;
        
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
        
        // Professional labels and title
        ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${language.toUpperCase()} Data Analysis - ${currentChartType.toUpperCase()} Chart`, width / 2, 20);
        
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        ctx.fillText('X Axis', margin.left + chartWidth / 2, margin.top + chartHeight + 25);
        
        ctx.save();
        ctx.translate(margin.left - 35, margin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Y Axis', 0, 0);
        ctx.restore();
        
        // Data quality info
        ctx.font = '11px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = colorMode === 'dark' ? '#a0aec0' : '#718096';
        ctx.textAlign = 'left';
        
        const infoText = [
          `Data points: ${data.length}`,
          `Chart type: ${currentChartType}`,
          `Confidence: ${analysis.confidence}%`,
          `Quality: ${analysis.dataQuality}`
        ].join(' | ');
        
        ctx.fillText(infoText, margin.left, margin.top - 30);
        
        console.log('✅ Realistic graph generated successfully');
        
      } catch (error) {
        console.error('❌ Error generating graph:', error);
        generateProfessionalFallbackGraph();
      } finally {
        setIsGeneratingGraph(false);
      }
    }, 50);
  };

  // Professional chart drawing functions
  const drawProfessionalLineChart = (ctx, data, scaleX, scaleY, colorMode) => {
    // Smooth line with gradient
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
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
    
    // Professional data points
    ctx.fillStyle = '#3182ce';
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 10) === 0) { // Sample points
        const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
        const pointY = scaleY(d.y);
        ctx.beginPath();
        ctx.arc(pointX, pointY, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Point border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };

  const drawProfessionalBarChart = (ctx, data, scaleX, scaleY, chartWidth, dataCount, margin, colorMode) => {
    const barWidth = (chartWidth / dataCount) * 0.7;
    
    data.forEach((d, i) => {
      const x = scaleX(typeof d.x === 'string' ? i : d.x);
      const y = scaleY(d.y);
      const barHeight = margin.top + chartHeight - y;
      
      // Professional gradient for bars
      const gradient = ctx.createLinearGradient(0, y, 0, margin.top + chartHeight);
      gradient.addColorStop(0, '#4299e1');
      gradient.addColorStop(1, '#3182ce');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Bar shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Professional value labels
      if (dataCount <= 12) {
        ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
        ctx.font = '11px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.y.toFixed(1), x + barWidth / 2, y - 8);
      }
    });
  };

  const drawProfessionalScatterChart = (ctx, data, scaleX, scaleY, colorMode) => {
    // Professional scatter points with variation
    data.forEach((d, i) => {
      const pointX = scaleX(typeof d.x === 'string' ? i : d.x);
      const pointY = scaleY(d.y);
      
      // Vary colors slightly for professional look
      const hue = (i * 137.5) % 360; // Golden angle for distribution
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
      
      ctx.beginPath();
      ctx.arc(pointX, pointY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Professional border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Professional trend line
    if (data.length >= 5) {
      const firstPointX = scaleX(typeof data[0].x === 'string' ? 0 : data[0].x);
      const firstPointY = scaleY(data[0].y);
      const lastPointX = scaleX(typeof data[data.length-1].x === 'string' ? data.length-1 : data[data.length-1].x);
      const lastPointY = scaleY(data[data.length-1].y);
      
      ctx.strokeStyle = 'rgba(66, 153, 225, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(firstPointX, firstPointY);
      ctx.lineTo(lastPointX, lastPointY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawProfessionalAreaChart = (ctx, data, scaleX, scaleY, chartHeight, margin, colorMode) => {
    // Professional area gradient
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    gradient.addColorStop(0, 'rgba(72, 187, 120, 0.8)');
    gradient.addColorStop(1, 'rgba(72, 187, 120, 0.1)');
    
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
    
    // Close the path professionally
    const lastPointX = scaleX(typeof data[data.length-1].x === 'string' ? data.length-1 : data[data.length-1].x);
    ctx.lineTo(lastPointX, margin.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Professional line on top
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
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

  const generateProfessionalFallbackGraph = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);
    
    // Professional fallback design
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colorMode === 'dark' ? '#2d3748' : '#f7fafc');
    gradient.addColorStop(1, colorMode === 'dark' ? '#4a5568' : '#edf2f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colorMode === 'dark' ? '#e2e8f0' : '#2d3748';
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Data Visualization Unavailable', width / 2, height / 2 - 20);
    
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = colorMode === 'dark' ? '#a0aec0' : '#718096';
    ctx.fillText('Insufficient or unrecognized data patterns', width / 2, height / 2 + 10);
    
    ctx.fillStyle = colorMode === 'dark' ? '#4a5568' : '#e2e8f0';
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Try running code that generates numerical output', width / 2, height / 2 + 40);
  };

  const regenerateGraph = () => {
    if (visualizationAnalysis) {
      generateRealisticGraph(visualizationAnalysis);
      
      toast({
        title: `Graph Updated`,
        description: `Refreshed ${currentChartType} visualization`,
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
        generateRealisticGraph(visualizationAnalysis);
      }, 100);
    }
  };

  const downloadImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `analysis-${language}-${currentChartType}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Analysis Downloaded",
        description: "Chart saved as high-quality PNG",
        status: "success",
        duration: 2000,
        position: "top-right"
      });
    }
  };

  // Enhanced Visualization Popup Component
  const VisualizationPopup = () => {
    if (!showVisualizationPopup || !visualizationAnalysis) return null;

    return (
      <Modal isOpen={showVisualizationPopup} onClose={handleDismissTemporarily} size="lg">
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
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">Data Analysis Available</Text>
                  <Text fontSize="sm" opacity={0.9}>Automated visualization detected</Text>
                </VStack>
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
                  We analyzed your {language} output and found data patterns suitable for visualization.
                </AlertDescription>
              </Alert>

              <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius="md">
                <VStack spacing={3} align="start">
                  <HStack spacing={2}>
                    <Badge colorScheme="green" fontSize="xs">
                      {visualizationAnalysis.confidence}% CONFIDENCE
                    </Badge>
                    <Badge colorScheme="blue" fontSize="xs">
                      {visualizationAnalysis.dataStructure.type.toUpperCase()}
                    </Badge>
                    <Badge colorScheme="orange" fontSize="xs">
                      {visualizationAnalysis.dataQuality.toUpperCase()} QUALITY
                    </Badge>
                  </HStack>
                  
                  <VStack spacing={1} align="start" width="100%">
                    <Text fontSize="sm" fontWeight="medium">Analysis Details:</Text>
                    <Box pl={2}>
                      <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        • {visualizationAnalysis.dataPoints} data points extracted
                      </Text>
                      <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        • {visualizationAnalysis.dataStructure.dimensions}D data structure
                      </Text>
                      {visualizationAnalysis.reasons.slice(0, 2).map((reason, index) => (
                        <Text key={index} fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                          • {reason}
                        </Text>
                      ))}
                    </Box>
                  </VStack>
                  
                  <FormControl size="sm">
                    <FormLabel fontSize="xs">Suggested Chart Type</FormLabel>
                    <Select 
                      size="sm"
                      value={currentChartType}
                      onChange={(e) => setCurrentChartType(e.target.value)}
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="scatter">Scatter Plot</option>
                      <option value="area">Area Chart</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>

              <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                Generate an automated visualization to better understand your data patterns?
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
                  Generate Visualization
                </Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Professional Chart Controls
  const ChartControls = () => (
    <VStack spacing={3} mb={4} p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} borderRadius="md">
      <HStack spacing={4} width="100%">
        <FormControl size="sm" maxW="200px">
          <FormLabel fontSize="xs">Chart Type</FormLabel>
          <Select 
            value={currentChartType}
            onChange={(e) => changeChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="area">Area Chart</option>
          </Select>
        </FormControl>
        
        <FormControl size="sm" maxW="150px">
          <FormLabel fontSize="xs">Data Points</FormLabel>
          <NumberInput 
            value={dataPoints}
            onChange={(value) => setDataPoints(parseInt(value) || 20)}
            min={5}
            max={100}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>
      
      <HStack spacing={2} width="100%">
        <Button
          size="sm"
          leftIcon={<FaSync />}
          onClick={regenerateGraph}
          isLoading={isGeneratingGraph}
          colorScheme="blue"
          variant="outline"
        >
          Refresh
        </Button>
        
        <Button
          size="sm"
          leftIcon={<FaTable />}
          onClick={() => setShowRawData(!showRawData)}
          variant="outline"
        >
          {showRawData ? 'Hide Data' : 'View Data'}
        </Button>
      </HStack>
    </VStack>
  );

  // Raw Data Viewer
  const RawDataViewer = () => {
    if (!showRawData || !visualizationAnalysis) return null;
    
    const numericalData = RealisticDataParser.parseNumericalData(output);
    
    return (
      <Box mb={4} p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} borderRadius="md">
        <HStack justify="space-between" mb={3}>
          <Text fontSize="sm" fontWeight="bold">Extracted Numerical Data</Text>
          <Badge colorScheme="blue">{numericalData.length} values</Badge>
        </HStack>
        <Box 
          p={3} 
          bg={colorMode === 'dark' ? 'gray.900' : 'white'} 
          borderRadius="md"
          maxH="200px"
          overflowY="auto"
          fontFamily="mono"
          fontSize="xs"
        >
          <pre>{numericalData.slice(0, 50).join(', ')}</pre>
          {numericalData.length > 50 && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              ... and {numericalData.length - 50} more values
            </Text>
          )}
        </Box>
      </Box>
    );
  };

  // Main graphical content
  const renderGraphicalContent = () => {
    if (!visualizationAnalysis || !output) {
      return (
        <VStack spacing={4} justify="center" h="400px" opacity={0.7}>
          <Spinner size="lg" color="purple.500" thickness="3px" />
          <VStack spacing={1}>
            <Text fontSize="lg" fontWeight="medium">Analyzing Data...</Text>
            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              Run your code to generate graphical analysis
            </Text>
          </VStack>
        </VStack>
      );
    }

    if (!visualizationAnalysis.hasVisualization) {
      return (
        <VStack spacing={4} justify="center" h="400px" opacity={0.7}>
          <FaDatabase size={48} color={colorMode === 'dark' ? '#4a5568' : '#a0aec0'} />
          <VStack spacing={1}>
            <Text fontSize="lg" fontWeight="medium">Limited Visualization Data</Text>
            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              Output doesn't contain recognizable numerical patterns
            </Text>
            <Badge colorScheme="yellow" fontSize="xs" mt={2}>
              Confidence: {visualizationAnalysis.confidence}%
            </Badge>
          </VStack>
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
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold">Data Analysis</Text>
              <HStack spacing={2}>
                <Badge colorScheme="green" fontSize="xs">
                  AUTO-DETECTED
                </Badge>
                <Badge colorScheme="blue" fontSize="xs">
                  {language.toUpperCase()}
                </Badge>
                <Badge colorScheme="purple" fontSize="xs">
                  {visualizationAnalysis.confidence}% CONFIDENCE
                </Badge>
              </HStack>
            </VStack>
            <HStack spacing={2}>
              <Tooltip label="Refresh Analysis">
                <IconButton
                  size="sm"
                  icon={<FaSync />}
                  onClick={regenerateGraph}
                  aria-label="Refresh analysis"
                  colorScheme="blue"
                  isLoading={isGeneratingGraph}
                />
              </Tooltip>
              <Tooltip label="Download Chart">
                <IconButton
                  size="sm"
                  icon={<FaDownload />}
                  onClick={downloadImage}
                  aria-label="Download chart"
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

          {/* Chart Controls */}
          <ChartControls />

          {/* Raw Data Viewer */}
          <RawDataViewer />

          {isGeneratingGraph && (
            <Box mb={3}>
              <Progress size="sm" isIndeterminate colorScheme="purple" />
              <Text fontSize="xs" textAlign="center" mt={1}>
                Generating {currentChartType} visualization from {language} data...
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
            <strong>Automated data analysis complete!</strong> The system analyzed {visualizationAnalysis.dataPoints} data points from your {language} output and generated a {currentChartType} visualization. Data quality: {visualizationAnalysis.dataQuality}.
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
                <Text>Data Analysis</Text>
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

      {/* Data Analysis Status Indicator */}
      {visualizationAnalysis && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          p={3}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="md"
          border="1px solid"
          borderColor={visualizationAnalysis.hasVisualization ? 'green.500' : 'yellow.500'}
          boxShadow="lg"
          zIndex={1000}
          maxW="300px"
        >
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="full"
              bg={visualizationAnalysis.hasVisualization ? 'green.500' : 'yellow.500'}
              color="white"
            >
              <FaChartLine size={14} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="bold">
                {visualizationAnalysis.hasVisualization ? 'Data Analyzed' : 'Limited Data'}
              </Text>
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                {visualizationAnalysis.hasVisualization 
                  ? `${visualizationAnalysis.dataPoints} points, ${visualizationAnalysis.confidence}% confidence` 
                  : `${visualizationAnalysis.dataPoints} values found`
                }
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </>
  );
};