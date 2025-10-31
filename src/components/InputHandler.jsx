import {
    Box,
    VStack,
    HStack,
    Text,
    Input,
    Button,
    useColorMode,
    Textarea,
    Alert,
    AlertIcon,
    AlertDescription,
    Badge,
    IconButton,
    Tooltip
  } from "@chakra-ui/react";
  import { FaPlay, FaTrash, FaTerminal, FaInfoCircle } from "react-icons/fa";
  import { useState } from "react";
  
  export const InputHandler = ({ onExecuteWithInput, language, isRunning, code }) => {
    const { colorMode } = useColorMode();
    const [inputValues, setInputValues] = useState(['']);
    const [showInputPanel, setShowInputPanel] = useState(false);
  
    const handleAddInput = () => {
      setInputValues([...inputValues, '']);
    };
  
    const handleRemoveInput = (index) => {
      if (inputValues.length > 1) {
        const newInputs = inputValues.filter((_, i) => i !== index);
        setInputValues(newInputs);
      }
    };
  
    const handleInputChange = (index, value) => {
      const newInputs = [...inputValues];
      newInputs[index] = value;
      setInputValues(newInputs);
    };
  
    const handleExecute = () => {
      const inputString = inputValues.join('\n');
      onExecuteWithInput(inputString);
      setShowInputPanel(false);
    };
  
    const getInputPlaceholder = (index) => {
      const examples = {
        python: ['Enter your name', 'Enter your age', 'Enter your city'],
        javascript: ['Enter value 1', 'Enter value 2', 'Enter value 3'],
        typescript: ['Enter value 1', 'Enter value 2', 'Enter value 3'],
        java: ['Enter your name', 'Enter your age'],
        cpp: ['Enter number', 'Enter text'],
        c: ['Input value'],
        csharp: ['Enter your name', 'Enter your age'],
        php: ['Enter value'],
        ruby: ['Enter value'],
        go: ['Enter value'],
        rust: ['Enter value'],
        swift: ['Enter value'],
        kotlin: ['Enter value']
      };
      
      const langExamples = examples[language] || examples.python;
      return langExamples[index] || `Input ${index + 1}`;
    };
  
    const countInputCalls = () => {
      if (!code) return 0;
      
      const patterns = {
        python: (code.match(/input\(/g) || []).length,
        javascript: (code.match(/prompt\(/g) || []).length,
        typescript: (code.match(/prompt\(/g) || []).length,
        java: (code.match(/next(Int|Double|Float|Long|Line|)/g) || []).length,
        cpp: (code.match(/cin\s*>>/g) || []).length,
        c: (code.match(/scanf|gets|fgets/g) || []).length,
        csharp: (code.match(/Console\.ReadLine/g) || []).length,
        php: (code.match(/fgets\(STDIN\)|readline/g) || []).length,
        ruby: (code.match(/gets/g) || []).length,
        go: (code.match(/fmt\.Scan/g) || []).length,
        rust: (code.match(/std::io::stdin/g) || []).length,
        swift: (code.match(/readLine/g) || []).length,
        kotlin: (code.match(/readLine/g) || []).length
      };
      
      return patterns[language] || patterns.python;
    };
  
    const estimatedInputs = countInputCalls();
  
    if (!showInputPanel) {
      return (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FaTerminal />}
          onClick={() => setShowInputPanel(true)}
          isDisabled={isRunning}
          colorScheme="blue"
        >
          Provide Input ({estimatedInputs})
        </Button>
      );
    }
  
    return (
      <Box
        p={4}
        bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
        borderRadius="md"
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
        mb={4}
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="sm">
              Program Input Required
            </Text>
            <Badge colorScheme="blue" fontSize="xs">
              {language.toUpperCase()}
            </Badge>
          </HStack>
  
          <Alert status="info" size="sm" borderRadius="md">
            <AlertIcon />
            <AlertDescription fontSize="xs">
              Your program requires {estimatedInputs} input(s). Provide values below in the order they will be requested.
            </AlertDescription>
          </Alert>
  
          <VStack spacing={2} align="stretch">
            {inputValues.map((value, index) => (
              <HStack key={index} spacing={2}>
                <Text fontSize="sm" minW="80px" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                  Input {index + 1}:
                </Text>
                <Input
                  size="sm"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={getInputPlaceholder(index)}
                  fontFamily="mono"
                  fontSize="xs"
                  bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                />
                {inputValues.length > 1 && (
                  <IconButton
                    size="xs"
                    icon={<FaTrash />}
                    onClick={() => handleRemoveInput(index)}
                    aria-label="Remove input"
                    variant="ghost"
                    colorScheme="red"
                  />
                )}
              </HStack>
            ))}
          </VStack>
  
          <HStack spacing={2} justify="space-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddInput}
              leftIcon={<FaInfoCircle />}
            >
              Add Input
            </Button>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowInputPanel(false);
                  setInputValues(['']);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FaPlay />}
                onClick={handleExecute}
                isLoading={isRunning}
              >
                Run with Input
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    );
  };