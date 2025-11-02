export class EnhancedVisualizationDetector {
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
        patterns: []
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
        { pattern: /\{"x":\s*\d+/g, weight: 8, type: 'json_coordinates' },
        { pattern: /"values":\s*\[/g, weight: 7, type: 'json_values' }
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
      if (totalWeight >= 15) {
        analysis.hasVisualization = true;
        analysis.confidence = Math.min(100, totalWeight * 3);
        
        // Determine best visualization type
        if (analysis.patterns.some(p => p.type.includes('json') || p.type.includes('coordinates'))) {
          analysis.type = 'interactive_chart';
        } else if (analysis.patterns.some(p => p.type.includes('array') || p.type.includes('data'))) {
          analysis.type = 'line_chart';
        } else if (analysis.dataPoints > 20) {
          analysis.type = 'scatter_plot';
        } else {
          analysis.type = 'bar_chart';
        }
      } else {
        analysis.hasVisualization = false;
        analysis.confidence = Math.min(100, totalWeight * 2);
      }
  
      console.log('Visualization Analysis:', analysis);
      return analysis;
    }
  
    static generateSampleData(output) {
      // Parse numerical data from output
      const numbers = output.match(/\d+\.?\d*/g);
      if (!numbers || numbers.length < 3) {
        // Generate sample data if not enough numbers
        return Array.from({ length: 20 }, (_, i) => ({
          x: i,
          y: Math.sin(i * 0.3) * 10 + Math.random() * 5
        }));
      }
  
      // Use actual numbers from output
      return numbers.slice(0, 20).map((num, i) => ({
        x: i,
        y: parseFloat(num) || 0
      }));
    }
  }